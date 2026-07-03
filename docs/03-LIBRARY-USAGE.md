# Library Usage & Code Patterns (Corrected)

This document explains how each third-party library is used for barcode/QR code reading and generation. This is the core technical reference.

> **Nota de revisión (jul 2026):** se corrigió la sección de ZXing (paquete equivocado para los helpers de cámara), se agregó la sección de secure context / HTTPS, y se hizo una auditoría de condiciones de carrera y errores no obvios (validaciones obsoletas, arranques concurrentes de cámara que dejan streams huérfanos, escritura al portapapeles rota en Safari, colisiones de IDs de DOM, entre otros). Las anotaciones están marcadas con ⚠️ junto al código relevante, más una sección consolidada al final.

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

### ⚠️ React pattern: don't re-instantiate on every render

If `options` is tied to debounced React state, calling `new QRCodeStyling(options)` on every change rebuilds the internal canvas/SVG from scratch each time — wasteful, creates GC pressure. Instantiate once in a `useRef` and call `.update(options)` on subsequent changes instead:

```typescript
const qrRef = useRef<QRCodeStyling | null>(null);

useEffect(() => {
  if (!qrRef.current) {
    qrRef.current = new QRCodeStyling(options);
    qrRef.current.append(containerRef.current!);
  } else {
    qrRef.current.update(options); // much cheaper than re-instantiating
  }
}, [options]);
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

> ⚠️ **Safari-specific race:** if `getQRCodeBlob()` (async — it re-renders and awaits the QR generation) resolves *before* you call `navigator.clipboard.write()`, Safari throws `NotAllowedError` because it revokes clipboard permission ~1 second after the triggering click, regardless of whether your code is still "in the middle" of the same logical operation. Chrome doesn't enforce this as strictly, so this bug is invisible in Chrome-only testing and only shows up on iPhone/Mac users — see the consolidated race-conditions section below for the fix (passing a `Promise<Blob>` directly into `ClipboardItem`).

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

### ⚠️ Avoid the `getImageData` performance warning

Repeated `getImageData()` calls on a plain 2D context force the browser to read pixel data back from the GPU, which modern browsers flag with a console warning. Request the context with `willReadFrequently: true` since this canvas is used purely for readback, not drawing performance:

```typescript
const ctx = canvas.getContext('2d', { willReadFrequently: true });
```

### Validation Flow in `QRGenerator.tsx`

1. Generate QR code as data URL via `renderQRCodeToDataUrl()`
2. Load that data URL into an `Image` element
3. Draw the image onto a canvas
4. Extract `ImageData` from canvas
5. Run `jsQR()` on the pixel data
6. Compare decoded text with original input
7. Display warning if not readable or data doesn't match

### ⚠️ Race condition: stale validation results

Step 2 (`Image` loading) is asynchronous (`img.onload`). If the user types fast enough that a new debounced value fires a new validation pass while a previous `Image` is still loading, the two validations can resolve **out of order** — an old validation for input A can finish and overwrite the UI *after* a newer validation for input B has already finished. Symptom: the "not readable" warning flickers or shows stale state that doesn't match what's currently on screen.

Fix with a generation counter (cheaper than `AbortController` here since `Image.onload` isn't cancellable anyway):

```typescript
const validationIdRef = useRef(0);

async function validateQRCode(dataUrl: string, expectedText: string) {
  const myId = ++validationIdRef.current;

  const img = new Image();
  await new Promise((resolve) => { img.onload = resolve; img.src = dataUrl; });

  // If a newer validation started while we were waiting, discard this result
  if (myId !== validationIdRef.current) return;

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, size, size);
  const code = jsQR(data, width, height);

  if (myId !== validationIdRef.current) return; // check again after the sync work too
  setValidationResult(code?.data === expectedText);
}
```

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
- **Requires a secure context** — see the dedicated section below, this is the #1 cause of "camera doesn't work on my phone but works on desktop"

### ⚠️ Race condition: concurrent `start()` calls

`QRScanner.start()` has no guard against being called again while a previous `start()` is still awaiting camera permission. If a user double-taps a "scan" button, or a React effect fires twice (Strict Mode, or a fast prop change), you get two overlapping `Html5Qrcode` instances both requesting `getUserMedia`. Depending on the device this either throws (`OverconstrainedError` / device busy) or silently leaves one of the two streams running with no reference to it — the camera light stays on and there's no way to `.stop()` it because your code only kept the last assignment. Add an in-flight guard:

```typescript
export class QRScanner {
  private scanner: Html5Qrcode | null = null;
  private starting = false;

  async start(config: QRScannerConfig, onScan: QRScanCallback): Promise<void> {
    if (this.starting || this.scanner) return; // ignore duplicate calls
    this.starting = true;
    try {
      this.scanner = new Html5Qrcode(this.elementId);
      await this.scanner.start(/* ... */);
    } finally {
      this.starting = false;
    }
  }
}
```

### ⚠️ Non-obvious: duplicate scan events after detection

`onScan` fires as soon as a code is decoded, but `scanner.stop()` is async and takes a moment to actually halt the camera loop. If your `onScan` handler does anything async before it gets around to calling `.stop()` (e.g. `await fetch()` to save the scanned value), the scanner can decode the *same* code again — or a different one in frame — and fire `onScan` a second time before the first `.stop()` call has taken effect. This looks like "the scanner fired twice for no reason" and is a common source of duplicate database writes. Guard with a simple lock:

```typescript
let handled = false;
await scanner.start(config, async (decodedText) => {
  if (handled) return;
  handled = true;
  await scanner.stop();
  onScan(decodedText); // now safe to do async work
});
```

### ⚠️ Non-obvious: `getElementById` grabs the wrong element

Both `QRScanner` and the ZXing wrapper below take a plain string `elementId` and call `document.getElementById()` internally. If two scanner widgets ever mount at once with the same id (a duplicated component, a modal that doesn't unmount the one behind it, dev hot-reload leaving a stale DOM node around), `getElementById` silently returns the *first* match in the DOM — you can end up drawing the camera feed into, or reading frames from, a completely different component instance with no error thrown. Generate a unique id per instance (e.g. `useId()` in React) rather than hardcoding a string like `"reader-element"`.

---

## Barcode Generation: `JsBarcode` v3.12.x

> **Corrección:** la última versión estable es `3.12.3` (tu doc decía `3.11.5`). No es un error funcional — la API no cambió — pero si vas a fijar versión en `package.json`, usá la actual salvo que tengas una razón para pinnear la vieja.

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

> ⚠️ Same Safari race as the QR clipboard function above — and worse here, since `exportBarcodeAsBlob('png')` has an extra async hop (SVG → `Image` → canvas → blob) before the clipboard write, giving Safari even more time to revoke the activation window. See the fix in the race-conditions section below.

---

## Barcode Scanning: `@zxing/browser` + `@zxing/library` (corrected)

> **Corrección importante:** tu doc original tenía todo bajo `@zxing/library` v0.21.0. Eso está desactualizado y mezcla dos paquetes distintos:
> - **`@zxing/library`** (última: `0.23.0`) — el motor de decodificación puro (`MultiFormatReader`, `BinaryBitmap`, formatos, etc.), sin helpers de cámara/browser.
> - **`@zxing/browser`** (paquete separado) — la capa de browser: `BrowserMultiFormatReader`, `decodeFromVideoDevice`, manejo de `<video>`, listado de cámaras, etc. Esto es lo que tu `BarcodeScanner` wrapper realmente necesita.
>
> Instalar solo `@zxing/library` y esperar que `BrowserMultiFormatReader` funcione puede fallar según la versión — el patrón soportado y documentado hoy es usar ambos paquetes juntos.

### Installation

```
npm install @zxing/library @zxing/browser
```

### How It Works

`@zxing/browser` is the browser layer for ZXing's decoding engine (`@zxing/library`). It decodes barcodes from video streams in real-time using `BrowserMultiFormatReader`.

### Core Usage Pattern (corrected)

```typescript
import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';

const hints = new Map();
hints.set(DecodeHintType.POSSIBLE_FORMATS, [/* optional format filter */]);

const reader = new BrowserMultiFormatReader(hints);
const videoElement = document.getElementById('video-id') as HTMLVideoElement;

// decodeFromVideoDevice returns a `controls` object — use it to stop, not reader.reset()
const controls = await reader.decodeFromVideoDevice(null, videoElement, (result, error) => {
  if (result) {
    console.log(result.getText());
    console.log(result.getBarcodeFormat().toString());
  }
});

// later, to stop scanning and release the camera:
controls.stop();
```

### Wrapper Class: `BarcodeScanner` (corrected)

Located in `packages/barcode-tools/src/scanner.ts`:

```typescript
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { DecodeHintType } from '@zxing/library';

export class BarcodeScanner {
  private reader: BrowserMultiFormatReader;
  private controls: IScannerControls | null = null;
  private videoElementId: string;

  constructor(config: BarcodeScannerConfig) {
    this.videoElementId = config.videoElementId;
    const hints = new Map();
    if (config.formats) {
      hints.set(DecodeHintType.POSSIBLE_FORMATS, config.formats);
    }
    this.reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: config.timeBetweenDecodingAttempts || 300,
    });
  }

  async start(onScan: BarcodeScanCallback): Promise<void> {
    const videoElement = document.getElementById(this.videoElementId) as HTMLVideoElement;
    this.controls = await this.reader.decodeFromVideoDevice(null, videoElement, (result, _error) => {
      if (result) {
        onScan({
          text: result.getText(),
          format: result.getBarcodeFormat().toString(),
          timestamp: Date.now(),
        });
      }
    });
  }

  stop(): void {
    // Use the controls object returned by decodeFromVideoDevice, not reader.reset()
    this.controls?.stop();
    this.controls = null;
  }
}
```

> Nota: el nombre del segundo parámetro del constructor de `BrowserMultiFormatReader` (delay entre intentos de decodificación) varía un poco entre versiones — chequeá el `.d.ts` instalado en tu `node_modules` si TypeScript se queja, porque `@zxing/browser` tuvo cambios de firma entre versiones 0.1.x y 0.2.x.

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
- The scanner does NOT auto-stop on detection — you must call `stop()` (via `controls.stop()`) manually
- The scan callback includes both `text` and `format` information
- `@zxing/browser` peer-depends on a specific `@zxing/library` version range — if you get a version mismatch warning, bump `@zxing/library` to match what `@zxing/browser`'s peerDependencies expects
- The scanner provides better barcode detection than `html5-qrcode` for linear barcodes
- **Requires a secure context** — see below

### ⚠️ Race condition: orphaned camera stream on concurrent `start()`

This is worse than the equivalent `html5-qrcode` race above. Look at the wrapper: `this.controls` is only assigned *after* `await this.reader.decodeFromVideoDevice(...)` resolves. If `start()` is called a second time before the first call's promise resolves (double-tap, effect re-run, fast route change), the second call's `decodeFromVideoDevice` opens a **second** camera stream, and whichever `await` resolves last wins and overwrites `this.controls` — permanently losing the reference to the first stream's `controls` object. That first stream has no way to be stopped from your code anymore; the camera stays on until the user navigates away or closes the tab. Add the same in-flight guard as the `html5-qrcode` wrapper:

```typescript
export class BarcodeScanner {
  private reader: BrowserMultiFormatReader;
  private controls: IScannerControls | null = null;
  private starting = false;

  async start(onScan: BarcodeScanCallback): Promise<void> {
    if (this.starting || this.controls) return;
    this.starting = true;
    try {
      const videoElement = document.getElementById(this.videoElementId) as HTMLVideoElement;
      this.controls = await this.reader.decodeFromVideoDevice(null, videoElement, (result) => {
        if (result) onScan({ text: result.getText(), format: result.getBarcodeFormat().toString(), timestamp: Date.now() });
      });
    } finally {
      this.starting = false;
    }
  }
}
```

### Alternative worth knowing about

The zxing-js maintainers have said they don't have time to actively maintain the project anymore (it's still functional, just not actively developed). If long-term maintenance matters, `react-zxing` v3+ moved to `barcode-detector` (a WASM build of ZXing-C++) instead of `@zxing/library`. Not necessary to switch now, just flagging it in case `@zxing/library` stalls on a bug you hit later.

**About the native `BarcodeDetector` Web API — important correction:** it exists (part of the Shape Detection API spec) and works with zero dependencies on Chromium browsers:

```typescript
if ('BarcodeDetector' in window) {
  const detector = new BarcodeDetector({ formats: ['qr_code', 'code_128', 'ean_13'] });
  const barcodes = await detector.detect(videoElement);
  barcodes.forEach(barcode => console.log(barcode.rawValue));
}
```

**But it is NOT supported in Safari/WebKit** — meaning no iOS browser supports it, since every browser on iOS (Chrome, Firefox, etc.) is required by Apple to use WebKit under the hood. It also isn't supported in Firefox. Practically, that means:

- ✅ Chrome/Edge/Samsung Internet on Android and desktop
- ❌ Any browser on iOS/iPadOS (all use WebKit)
- ❌ Safari on macOS
- ❌ Firefox (any platform)

For `qr.crobf.tech`, where you're testing on your own phone and presumably want it to work for iPhone users too, relying on native `BarcodeDetector` alone would silently break for a big chunk of mobile users. If you want to explore this path later, always feature-detect and fall back to `@zxing/browser` or `html5-qrcode`, or use the `barcode-detector` npm package (a WASM polyfill that gives you the same API surface everywhere) instead of the raw native API.

---

## Secure Context Requirement for Camera Access (new section)

This is the most common reason camera-based scanning (`html5-qrcode` and `@zxing/browser`) works on desktop `localhost` but fails silently or throws a permission error on a phone during local network testing.

### The rule

`navigator.mediaDevices.getUserMedia()` — which both `html5-qrcode` and `@zxing/browser` rely on internally — only works in a **secure context**:

- ✅ `https://` origins
- ✅ `http://localhost` / `http://127.0.0.1` (special-cased by browsers)
- ❌ `http://192.168.x.x:PORT` or any other LAN IP over plain HTTP

If you're testing on your phone by pointing it at your dev machine's LAN IP (e.g. `http://192.168.1.50:4321`), the browser will block camera access even if the code is 100% correct — this is a browser/WebRTC restriction, not a bug in your app or in the scanning libraries.

### Fixes (pick one)

**1. Local HTTPS with `mkcert` (recommended for Astro/Vite dev)**

```bash
mkcert -install
mkcert 192.168.1.50 localhost
```

Then point Vite/Astro's dev server config at the generated cert/key:

```typescript
// astro.config.mjs
export default defineConfig({
  vite: {
    server: {
      https: {
        cert: './192.168.1.50+1.pem',
        key: './192.168.1.50+1-key.pem',
      },
      host: true, // expose on LAN
    },
  },
});
```

**2. Tunnel (fastest, no cert management)**

```bash
cloudflared tunnel --url http://localhost:4321
# or
ngrok http 4321
```

Gives you a public HTTPS URL that proxies to your local dev server — open that on your phone instead of the LAN IP.

**3. Production**

Not an issue once deployed, since `qr.crobf.tech` will be served over HTTPS by default (Vercel/Cloudflare etc. handle this automatically).

### Symptom checklist

If you're seeing any of these, this is very likely the cause:
- `getUserMedia` rejects with `NotAllowedError` or `NotFoundError` on mobile but not desktop
- No permission prompt appears at all on mobile (browser silently blocks it before even asking)
- Works fine when you deploy but not in local dev on your phone

---

## React 18 Strict Mode: async start/stop race condition (new section)

`scanner.start()` (html5-qrcode) and `decodeFromVideoDevice()` (@zxing/browser) are both async — they don't finish instantly, since they wait on the camera permission prompt and stream setup.

In React 18 Strict Mode (dev only, but also in real fast mount/unmount cases like a user quickly closing a scanner modal), a component can **unmount before that promise resolves**. If your `useEffect` cleanup calls `.stop()` immediately, you're calling stop on a scanner that hasn't finished starting yet — this can throw an unhandled promise rejection, or worse, leave the camera stream hanging (the camera "on" light stays lit after the component is gone).

Guard against this with a mounted flag:

```typescript
useEffect(() => {
  let isMounted = true;
  const scanner = new QRScanner('reader-element');

  scanner.start(config, (result) => { ... })
    .then(() => {
      // Component unmounted while the camera was still initializing — kill it now
      if (!isMounted) scanner.stop();
    })
    .catch(console.error);

  return () => {
    isMounted = false;
    scanner.stop();
  };
}, []);
```

---

## SSR / Astro build-time danger (new section)

`JsBarcode` (`document.createElementNS`), `jsQR` (`document.createElement('canvas')`), and `qr-code-styling` (canvas/SVG DOM manipulation) all assume a browser `document` exists. If any of these run during Astro's static build or server-side render — for example, imported and executed at the top level of a component instead of inside a client-side lifecycle hook — the build will fail with a `document is not defined` error.

**Rule:** any file that imports and runs these libraries must be client-only:

```astro
<!-- Astro -->
<QRGenerator client:only="react" />
```

Or, if you need to lazy-load inside an already-client component:

```typescript
useEffect(() => {
  import('qr-code-styling').then(({ default: QRCodeStyling }) => {
    // safe here — definitely running in the browser
  });
}, []);
```

---

## Race Conditions & Non-Obvious Failure Points — Consolidated (new section)

Everything below either spans multiple libraries or didn't fit cleanly next to one specific code block. The scanner-specific races (stale validation, double-start, orphaned camera streams) are annotated in place above — this section covers the rest.

### Fix: Safari clipboard writes losing user activation

Referenced above from both `copyQRCodeToClipboard` and `copyBarcodeToClipboard`. The root cause: Safari revokes the "this click authorizes a clipboard write" permission a short time after the triggering event, regardless of what your code is doing. If you `await` blob generation *before* calling `clipboard.write()`, that permission window can already be gone by the time you get there — this passes silently in Chrome (which is more lenient) and only breaks on Safari/iOS, so it's easy to ship without noticing.

The fix supported by both Chromium and Safari: give `ClipboardItem` a `Promise<Blob>` directly instead of awaiting the blob first. The browser holds the clipboard authorization open while your promise resolves, instead of you consuming it before the write call:

```typescript
// ❌ Breaks in Safari — blob generation finishes, THEN we try to write,
// by which point Safari may have already revoked the permission
async function copyQRCodeToClipboard(options: Options) {
  const blob = await getQRCodeBlob(options, 'png');
  await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
}

// ✅ Works in both — the Promise itself is handed to ClipboardItem,
// so the write() call happens synchronously within the click handler
function copyQRCodeToClipboard(options: Options) {
  return navigator.clipboard.write([
    new ClipboardItem({
      'image/png': getQRCodeBlob(options, 'png'), // pass the Promise, don't await it here
    }),
  ]);
}
```

Important: this only works if `copyQRCodeToClipboard()` itself is called synchronously from the click handler (no `await` before it). If you need to `await` something else first (e.g. checking permissions), do that after constructing the `ClipboardItem`, not before.

Firefox is a separate story: `ClipboardItem` is behind a disabled-by-default flag there, so `navigator.clipboard.write` may not exist at all. Feature-detect (`'ClipboardItem' in window`) and fall back to a plain download if it's missing, rather than assuming the API is universally available.

### Non-obvious: `html5-qrcode`'s error callback is not for errors

The 4th argument to `scanner.start()` (the one left as `() => {}` in this doc) fires on nearly **every frame** where no code was found — which, in normal operation, is most frames. It is not an exceptional/fatal error channel. Two mistakes we've seen this cause:
- Wiring `console.error` into it "for debugging" floods the console and makes real errors impossible to spot
- Wiring any state update or cleanup logic into it, thinking it only fires on actual failures — this creates a de facto race with the real `onScan` callback, since both fire constantly during normal scanning

Leave it as a no-op unless you specifically want per-frame diagnostics, and never treat it as a signal to stop the scanner.

### Non-obvious: shared `hints` Map mutation across scanner instances

If `hints` (used for `DecodeHintType.POSSIBLE_FORMATS` in the ZXing wrapper) is ever built once at module scope and reused across multiple `BarcodeScanner` instances instead of created fresh per instance — for example if this product ever supports two scan modes on screen at once — mutating that shared `Map` from one instance's config can silently change the accepted formats for the *other* instance too. Always construct `hints` inside the constructor (as the current wrapper does) rather than importing a shared constant.

### Non-obvious: `decodeFromVideoDevice(null, ...)` camera selection isn't fully deterministic

Passing `null` as the device id lets the browser/OS choose a camera automatically. Right after a fresh permission grant, some Android devices briefly enumerate cameras differently than they do a moment later, occasionally causing the front camera to be selected once before settling on the rear one you requested via `facingMode`. Not strictly a race condition in your code, but it can look like one ("sometimes it opens the front camera for a split second"). If this becomes a real issue, enumerate devices explicitly with `BrowserCodeReader.listVideoInputDevices()` and pick the rear camera by label/facing mode yourself instead of relying on device id `null`.

---

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