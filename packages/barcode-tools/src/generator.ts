import JsBarcode from 'jsbarcode';
import { type BarcodeFormat, validateBarcodeValue } from './types';

export type { BarcodeFormat };
export { validateBarcodeValue };

export interface BarcodeGeneratorOptions {
  format?: BarcodeFormat;
  value?: string;
  width?: number;
  height?: number;
  displayValue?: boolean;
  font?: string;
  textAlign?: 'left' | 'center' | 'right';
  textPosition?: 'bottom' | 'top';
  textMargin?: number;
  fontSize?: number;
  lineColor?: string;
  background?: string;
  margin?: number;
  marginLeft?: number;
  marginRight?: number;
  marginTop?: number;
  marginBottom?: number;
}

export interface BarcodeRenderResult {
  svg: SVGSVGElement;
  valid: boolean;
  message?: string;
}

const DEFAULT_OPTIONS: BarcodeGeneratorOptions = {
  format: 'CODE128',
  width: 2,
  height: 120,
  displayValue: true,
  font: 'monospace',
  textAlign: 'center',
  textPosition: 'bottom',
  textMargin: 2,
  fontSize: 18,
  lineColor: '#1a1917',
  background: '#f8f6f1',
  margin: 10,
};

export function generateBarcode(
  value: string,
  options: BarcodeGeneratorOptions = {}
): BarcodeRenderResult {
  const format = options.format ?? DEFAULT_OPTIONS.format as BarcodeFormat;
  const validation = validateBarcodeValue(value, format);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

  if (!validation.valid) {
    return { svg, valid: false, message: validation.message };
  }

  const merged = { ...DEFAULT_OPTIONS, ...options, format, value };

  try {
    JsBarcode(svg, value, merged);
    return { svg, valid: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Could not create barcode.';
    return { svg, valid: false, message };
  }
}

export function downloadBarcode(svgElement: SVGSVGElement, filename: string = 'barcode.svg'): void {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(svgBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

export async function exportBarcodeAsBlob(
  svgElement: SVGSVGElement,
  format: 'png' | 'svg' = 'png'
): Promise<Blob> {
  if (format === 'svg') {
    const svgData = new XMLSerializer().serializeToString(svgElement);
    return new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  }

  const svgData = new XMLSerializer().serializeToString(svgElement);
  const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  try {
    const image = await loadImage(url);
    const canvas = document.createElement('canvas');
    const { width, height } = getSvgSize(svgElement);
    const scale = format === 'png' ? 2 : 1;
    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    ctx.scale(scale, scale);
    ctx.drawImage(image, 0, 0, width, height);

    return new Promise((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error('Could not create PNG blob'));
      }, 'image/png');
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function copyBarcodeToClipboard(svgElement: SVGSVGElement): Promise<void> {
  const blob = await exportBarcodeAsBlob(svgElement, 'png');

  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error('Clipboard API not supported in this browser.');
  }

  await navigator.clipboard.write([
    new ClipboardItem({ [blob.type]: blob }),
  ]);
}

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load SVG image'));
    img.src = url;
  });
}

function getSvgSize(svg: SVGSVGElement): { width: number; height: number } {
  const widthAttr = svg.getAttribute('width');
  const heightAttr = svg.getAttribute('height');

  const width = widthAttr ? parseFloat(widthAttr) : 0;
  const height = heightAttr ? parseFloat(heightAttr) : 0;

  if (width && height) return { width, height };

  const box = svg.viewBox.baseVal;
  return { width: box.width || 200, height: box.height || 100 };
}
