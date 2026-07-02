import JsBarcode from 'jsbarcode';

export type BarcodeFormat =
  | 'CODE128'
  | 'CODE39'
  | 'MSI';

export const BARCODE_FORMAT_RULES: Record<BarcodeFormat, { regex: RegExp; message: string }> = {
  CODE128: { regex: /^[\x00-\x7F]+$/, message: 'Supports ASCII characters.' },
  CODE39: { regex: /^[A-Z0-9\-.\$\/\+%\s]+$/, message: 'Uppercase letters, numbers, and - . $ / + % space.' },
  MSI: { regex: /^\d+$/, message: 'Digits only.' },
};

export const BARCODE_FORMATS: BarcodeFormat[] = [
  'CODE128',
  'CODE39',
  'MSI',
];

export interface BarcodeOptions {
  value: string;
  format: BarcodeFormat;
  width?: number;
  height?: number;
  margin?: number;
  lineColor?: string;
  background?: string;
  displayValue?: boolean;
  font?: string;
  fontSize?: number;
  textPosition?: 'bottom' | 'top';
  textAlign?: 'left' | 'center' | 'right';
}

const DEFAULT_OPTIONS: Required<Pick<BarcodeOptions, 'width' | 'height' | 'margin' | 'lineColor' | 'background' | 'displayValue' | 'font' | 'fontSize' | 'textPosition' | 'textAlign'>> = {
  width: 2,
  height: 120,
  margin: 10,
  lineColor: '#1a1917',
  background: '#ffffff',
  displayValue: true,
  font: 'monospace',
  fontSize: 18,
  textPosition: 'bottom',
  textAlign: 'center',
};

export function validateBarcodeValue(value: string, format: BarcodeFormat): boolean {
  const rule = BARCODE_FORMAT_RULES[format];
  if (!rule) return false;
  return rule.regex.test(value);
}

export function createBarcode(value: string, options: BarcodeOptions): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  const merged = { ...DEFAULT_OPTIONS, ...options };

  JsBarcode(svg, value, {
    format: merged.format,
    width: merged.width,
    height: merged.height,
    margin: merged.margin,
    lineColor: merged.lineColor,
    background: merged.background,
    displayValue: merged.displayValue,
    font: merged.font,
    fontSize: merged.fontSize,
    textPosition: merged.textPosition,
    textAlign: merged.textAlign,
  });

  return svg;
}

export function renderBarcode(svgElement: SVGElement): string {
  const serializer = new XMLSerializer();
  return 'data:image/svg+xml;base64,' + btoa(serializer.serializeToString(svgElement));
}

export function downloadBarcode(svgElement: SVGElement, filename: string): void {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const blob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function exportBarcodeAsBlob(
  svgElement: SVGElement,
  format: 'svg' | 'png',
): Promise<Blob | null> {
  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);

  if (format === 'svg') {
    return new Blob([svgString], { type: 'image/svg+xml' });
  }

  const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(svgBlob);

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2;
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(null);
        return;
      }
      ctx.scale(scale, scale);
      ctx.drawImage(img, 0, 0);
      canvas.toBlob((blob) => {
        URL.revokeObjectURL(url);
        resolve(blob);
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(null);
    };
    img.src = url;
  });
}

export async function copyBarcodeToClipboard(svgElement: SVGElement): Promise<void> {
  const blob = await exportBarcodeAsBlob(svgElement, 'png');
  if (!blob) throw new Error('Could not export barcode');
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob }),
  ]);
}
