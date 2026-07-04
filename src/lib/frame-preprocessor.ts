/**
 * Frame preprocessing helpers for barcode scanning.
 *
 * The barcode scanner takes multiple snapshots from the <video> element and
 * runs each one through ZXing. Linear barcodes are very sensitive to angle
 * and lighting, so we preprocess each frame before decoding:
 *
 *  - upscale 2x (helps ZXing with small codes)
 *  - convert to grayscale (barcodes are inherently grayscale)
 *  - increase contrast (helps under uneven lighting)
 *
 * The output is a list of PNG blobs, one per variant, so the caller can try
 * each variant in sequence and stop at the first that decodes.
 */

export interface FrameVariant {
  blob: Blob;
  label: string;
}

const CONTRAST_FACTOR = 1.6;
const GRAYSCALE_WEIGHTS = { r: 0.299, g: 0.587, b: 0.114 } as const;

function applyContrast(value: number): number {
  return Math.max(0, Math.min(255, CONTRAST_FACTOR * (value - 128) + 128));
}

function toGrayscaleAndContrast(imageData: ImageData): void {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i] ?? 0;
    const g = data[i + 1] ?? 0;
    const b = data[i + 2] ?? 0;
    const gray = GRAYSCALE_WEIGHTS.r * r + GRAYSCALE_WEIGHTS.g * g + GRAYSCALE_WEIGHTS.b * b;
    const adjusted = applyContrast(gray);
    data[i] = adjusted;
    data[i + 1] = adjusted;
    data[i + 2] = adjusted;
    // alpha stays as-is
  }
}

function upscale2x(video: HTMLVideoElement): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth * 2;
  canvas.height = video.videoHeight * 2;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D context');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  return canvas;
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('toBlob returned null'))),
      'image/png'
    );
  });
}

function grayscaleVariant(video: HTMLVideoElement): HTMLCanvasElement {
  const canvas = upscale2x(video);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not get 2D context');
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  toGrayscaleAndContrast(imageData);
  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * Captures one frame from the video and returns multiple preprocessed variants.
 * The first variant is the "best effort" — upscaled, grayscale, contrast-boosted.
 * Additional variants can be added here if a particular code type needs them.
 */
export async function capturePreprocessedFrames(video: HTMLVideoElement): Promise<FrameVariant[]> {
  if (!video.videoWidth || !video.videoHeight) return [];

  const variants: FrameVariant[] = [];

  const processed = grayscaleVariant(video);
  variants.push({
    blob: await canvasToBlob(processed),
    label: '2x+grayscale+contrast',
  });

  return variants;
}

export function waitMs(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
