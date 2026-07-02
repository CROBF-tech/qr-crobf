import jsQR from 'jsqr';
import { BrowserMultiFormatReader } from '@zxing/library';

export interface DecodedFromImage {
  text: string;
  format: string;
}

/**
 * Decode a QR code from a still image (File, Blob, or data URL).
 * Uses jsQR (always available; the project depends on it for QR validation).
 */
export async function decodeQRFromImage(input: File | Blob | string): Promise<DecodedFromImage | null> {
  const url = typeof input === 'string' ? input : URL.createObjectURL(input);
  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);
    if (!code) return null;
    return { text: code.data, format: 'qr_code' };
  } finally {
    if (typeof input !== 'string') URL.revokeObjectURL(url);
  }
}

/**
 * Decode a barcode from a still image. Uses native BarcodeDetector if available,
 * falls back to ZXing's BinaryBitmap-based decode from an ImageBitmap.
 */
export async function decodeBarcodeFromImage(input: File | Blob | string): Promise<DecodedFromImage | null> {
  const url = typeof input === 'string' ? input : URL.createObjectURL(input);
  try {
    if (typeof window !== 'undefined' && window.BarcodeDetector) {
      const img = await loadImage(url);
      const detector = new window.BarcodeDetector();
      const results = await detector.detect(img);
      if (results.length > 0) {
        return { text: results[0].rawValue, format: results[0].format };
      }
      return null;
    }

    // ZXing fallback: decode from canvas-derived luminance data
    const img = await loadImageBitmap(url);
    const reader = new BrowserMultiFormatReader();
    try {
      // draw to canvas, then read pixels for luminance
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      ctx.drawImage(img, 0, 0);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      // Build a luminance buffer for ZXing
      const luminances = new Uint8ClampedArray(imageData.width * imageData.height);
      for (let i = 0, j = 0; i < imageData.data.length; i += 4, j++) {
        luminances[j] = Math.floor(
          0.299 * imageData.data[i] +
          0.587 * imageData.data[i + 1] +
          0.114 * imageData.data[i + 2],
        );
      }
      // Use the lower-level decode path
      const {
        RGBLuminanceSource,
        BinaryBitmap,
        HybridBinarizer,
        MultiFormatReader,
      } = await import('@zxing/library');
      const source = new RGBLuminanceSource(luminances, imageData.width, imageData.height);
      const bitmap = new BinaryBitmap(new HybridBinarizer(source));
      const multiReader = new MultiFormatReader();
      const result = multiReader.decode(bitmap);
      return { text: result.getText(), format: result.getBarcodeFormat().toString() };
    } finally {
      reader.reset();
      img.close();
    }
  } catch (err) {
    console.error('[decodeBarcodeFromImage]', err);
    return null;
  } finally {
    if (typeof input !== 'string') URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Failed to load image'));
    img.src = src;
  });
}

function loadImageBitmap(src: string): Promise<ImageBitmap> {
  return fetch(src)
    .then((res) => res.blob())
    .then((blob) => createImageBitmap(blob));
}
