# Library Usage & Code Patterns

This document explains how each third-party library is used for barcode/QR code reading and generation. This is the core technical reference.

---

## QR Code Generation: `qr-code-styling` v1.9.2

### Installation

```
npm install qr-code-styling
```

### How It Works

`qr-code-styling` provides a `QRCodeStyling` class that renders a styled QR code to canvas or SVG. It creates the QR code internally (you don't need a separate QR encoding library).

### Core Usage Pattern

```typescript
import QRCodeStyling from 'qr-code-styling';
import type { Options, TypeNumber, DrawType, ErrorCorrectionLevel, DotType, CornerSquareType, CornerDotType, GradientType, Gradient } from 'qr-code-styling';

// Create instance
const qr = new QRCodeStyling(options);

// Get as blob for download
const blob = await qr.getRawData('png'); // 'png', 'jpeg', or 'svg'
```

### Options Structure

```typescript
interface Options {
  width?: number;
  height?: number;
  type?: 'canvas' | 'svg';
  data?: string;                   // The content to encode
  margin?: number;
  qrOptions?: {
    typeNumber?: string;           // Always '0' (auto)
    errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';  // L=7%, M=15%, Q=25%, H=30%
  };
  dotsOptions?: {
    type?: 'square' | 'dots' | 'rounded' | 'classy' | 'classy-rounded' | 'extra-rounded';
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      rotation: number;
      colorStops: Array<{ offset: number; color: string }>;
    };
  };
  cornersSquareOptions?: {
    type?: 'square' | 'dot' | 'extra-rounded';
    color?: string;
    gradient?: { ... };
  };
  cornersDotOptions?: {
    type?: 'dot' | 'square' | 'extra-rounded';
    color?: string;
    gradient?: { ... };
  };
  backgroundOptions?: {
    color?: string;
    gradient?: { ... };
  };
  image?: string;  // Base64 data URL for center logo
  imageOptions?: {
    imageSize?: number;        // 0-1, default 0.4
    margin?: number;
    hideBackgroundDots?: boolean;
    saveAsBlob?: boolean;
  };
}
```

### Key Functions in `packages/qr-tools/src/generator.ts`

#### `buildQRCodeStylingOptions(options)`
Transforms internal QRGeneratorOptions into `qr-code-styling` Options.

#### `createQRCode(options)`
Creates a new `QRCodeStyling` instance.

#### `renderQRCodeToDataUrl(options)`
Generates QR code and returns a base64 data URL string. Used for displaying the QR code in an `<img>` tag.

#### `getQRCodeBlob(options, extension)`
Returns the QR code as a Blob for download or clipboard.

#### `downloadQRCode(blob, filename)`
Creates a temporary `<a>` element, triggers download, then cleans up.

#### `copyQRCodeToClipboard(options)`
Uses `navigator.clipboard.write()` with `ClipboardItem` API.

---

## QR Code Validation: `jsQR` v1.4.0

### Installation

```
npm install jsqr
```

### How It Works

`jsQR` decodes QR codes from raw pixel data (ImageData). It is used purely for **validation** — after generating a styled QR code, the app re-decodes it to verify it's readable.

### Core Usage Pattern

```typescript
import jsQR from 'jsqr';

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
ctx.drawImage(imageElement, 0, 0);
const { data, width, height } = ctx.getImageData(0, 0, size, size);

const code = jsQR(data, width, height);
if (code) {
  console.log(code.data); // Decoded text
}
```

### Validation Flow in `QRGenerator.tsx`

1. Generate QR code as data URL via `renderQRCodeToDataUrl()`
2. Load that data URL into an `Image` element
3. Draw the image onto a canvas
4. Extract `ImageData` from canvas
5. Run `jsQR()` on the pixel data
6. Compare decoded text with original input
7. Display warning if not readable or data doesn't match

### Type Declaration

A custom `.d.ts` file is needed because jsQR's types may not be complete:

```typescript
declare module 'jsqr' {
  export interface QRCode {
    data: string;
    chunks: Array<{ type: string; text?: string }>;
    version: number;
    location: { ... };
  }
  export default function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: { inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst' }
  ): QRCode | null;
}
```

---

## QR Code Scanning: `html5-qrcode` v2.3.8

### Installation

```
npm install html5-qrcode
```

### How It Works

`html5-qrcode` provides camera access and QR/barcode decoding in one package. It displays a camera preview in a given DOM element and calls a callback when a code is detected.

### Core Usage Pattern

```typescript
import { Html5Qrcode, type Html5QrcodeResult, type Html5QrcodeCameraScanConfig } from 'html5-qrcode';

const scanner = new Html5Qrcode('element-id');

await scanner.start(
  { facingMode: 'environment' },   // Use rear camera
  { fps: 10, qrbox: { width: 250, height: 250 } },
  (decodedText, decodedResult) => {
    console.log(`Scanned: ${decodedText}`);
    scanner.stop();  // Auto-stop on first scan
  },
  () => {}  // Error callback (unused)
);
```

### Wrapper Class: `QRScanner`

Located in `packages/qr-tools/src/scanner.ts`:

```typescript
export class QRScanner {
  private scanner: Html5Qrcode | null = null;
  private elementId: string;

  constructor(elementId: string) { ... }

  async start(config: QRScannerConfig, onScan: QRScanCallback): Promise<void> {
    this.scanner = new Html5Qrcode(this.elementId);
    await this.scanner.start(
      { facingMode: 'environment' },
      { fps: config.fps || 10, aspectRatio: config.aspectRatio || 1.0, ... },
      onScan,
      () => {}
    );
  }

  async stop(): Promise<void> {
    if (this.scanner) {
      await this.scanner.stop();
      this.scanner = null;
    }
  }
}
```

### Scanner Config Options

```typescript
interface QRScannerConfig {
  fps?: number;          // Frames per second (default: 10)
  qrbox?: { width: number; height: number } | number;
  aspectRatio?: number;  // Default: 1.0
}
```

### Important Notes

- Always use `{ facingMode: 'environment' }` for rear camera
- Always stop the scanner in a `useEffect` cleanup function to prevent memory leaks
- Check `navigator.mediaDevices?.getUserMedia` before starting
- Camera permission errors are caught and shown to the user

---

## Barcode Generation: `JsBarcode` v3.11.5

### Installation

```
npm install jsbarcode
npm install -D @types/jsbarcode
```

### How It Works

`JsBarcode` renders barcodes into an SVG element. It supports multiple formats and full customization.

### Core Usage Pattern

```typescript
import JsBarcode from 'jsbarcode';

const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
JsBarcode(svg, '123456789', {
  format: 'CODE128',
  width: 2,
  height: 120,
  displayValue: true,
  font: 'monospace',
  textAlign: 'center',
  textPosition: 'bottom',
  fontSize: 18,
  lineColor: '#1a1917',
  background: '#f8f6f1',
  margin: 10,
});
```

### Supported Barcode Formats

| Format | Pattern | Example |
|--------|---------|---------|
| `CODE128` | ASCII characters (0-127) | "ABC-123" |
| `CODE39` | Uppercase letters, numbers, `- . $ / + % space` | "ABC123" |
| `EAN13` | 12 or 13 digits | "5901234123457" |
| `EAN8` | 7 or 8 digits | "96385074" |
| `UPC` | 11 or 12 digits | "012345678905" |
| `ITF14` | 13 or 14 digits | "15478963254123" |
| `MSI` | Digits only | "123456" |
| `pharmacode` | Digits only | "12345" |

### Validation

Located in `packages/barcode-tools/src/types.ts`:

```typescript
const BARCODE_FORMAT_RULES = {
  CODE128:  { regex: /^[\x00-\x7F]+$/, message: 'Supports ASCII characters.' },
  CODE39:   { regex: /^[A-Z0-9\-\.\$\/\+%\s]+$/, message: '...' },
  EAN13:    { regex: /^\d{12,13}$/, message: 'Requires 12 or 13 digits.' },
  EAN8:     { regex: /^\d{7,8}$/, message: 'Requires 7 or 8 digits.' },
  UPC:      { regex: /^\d{11,12}$/, message: 'Requires 11 or 12 digits.' },
  ITF14:    { regex: /^\d{13,14}$/, message: 'Requires 13 or 14 digits.' },
  MSI:      { regex: /^\d+$/, message: 'Digits only.' },
  pharmacode: { regex: /^\d+$/, message: 'Digits only.' },
};
```

### Download Functions

#### `downloadBarcode(svgElement, filename)`
Serializes SVG to XML string, creates a Blob, and triggers download.

#### `exportBarcodeAsBlob(svgElement, format)`
For SVG: returns SVG blob directly. For PNG: renders SVG to an Image, draws to a canvas at 2x scale, converts to PNG blob.

#### `copyBarcodeToClipboard(svgElement)`
Exports as PNG, writes to clipboard via `ClipboardItem` API.

---

## Barcode Scanning: `@zxing/library` v0.21.0

### Installation

```
npm install @zxing/library
```

### How It Works

`@zxing/library` is a pure JavaScript port of the ZXing barcode scanning library. It decodes barcodes from video streams in real-time.

### Core Usage Pattern

```typescript
import { BrowserMultiFormatReader, DecodeHintType } from '@zxing/library';

const hints = new Map();
hints.set(DecodeHintType.POSSIBLE_FORMATS, [/* optional format filter */]);

const reader = new BrowserMultiFormatReader(hints, 300); // 300ms between attempts
const videoElement = document.getElementById('video-id') as HTMLVideoElement;

await reader.decodeFromVideoDevice(null, videoElement, (result, error) => {
  if (result) {
    console.log(result.getText());
    console.log(result.getBarcodeFormat().toString());
  }
});
```

### Wrapper Class: `BarcodeScanner`

Located in `packages/barcode-tools/src/scanner.ts`:

```typescript
export class BarcodeScanner {
  private reader: BrowserMultiFormatReader;
  private videoElementId: string;
  private isActive: boolean = false;

  constructor(config: BarcodeScannerConfig) {
    this.videoElementId = config.videoElementId;
    const hints = new Map();
    if (config.formats) {
      hints.set(DecodeHintType.POSSIBLE_FORMATS, config.formats);
    }
    this.reader = new BrowserMultiFormatReader(hints, config.timeBetweenDecodingAttempts || 300);
  }

  async start(onScan: BarcodeScanCallback): Promise<void> {
    const videoElement = document.getElementById(this.videoElementId) as HTMLVideoElement;
    this.isActive = true;
    await this.reader.decodeFromVideoDevice(null, videoElement, (result, _error) => {
      if (result && this.isActive) {
        onScan({
          text: result.getText(),
          format: result.getBarcodeFormat().toString(),
          timestamp: Date.now(),
        });
      }
    });
  }

  stop(): void {
    this.isActive = false;
    this.reader.reset();
  }
}
```

### Scanner Config

```typescript
interface BarcodeScannerConfig {
  videoElementId: string;
  formats?: ZXingBarcodeFormat[];
  timeBetweenDecodingAttempts?: number; // Default: 300ms
}
```

### Important Notes

- The video element must exist in the DOM before starting
- Use `<video>` element with `autoplay`, `playsInline`, `muted` attributes
- The scanner does NOT auto-stop on detection — you must call `stop()` manually
- The scan callback includes both `text` and `format` information
- Always call `reset()` in cleanup
- The scanner provides better barcode detection than `html5-qrcode` for linear barcodes

---

## Debounce Hook

```typescript
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}
```

- QR generator uses 300ms debounce
- Barcode generator uses 200ms debounce
