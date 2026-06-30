import QRCodeStyling from 'qr-code-styling';
import jsQR from 'jsqr';
import type { Options, TypeNumber, DrawType, ErrorCorrectionLevel, DotType, CornerSquareType, CornerDotType, GradientType, Gradient } from 'qr-code-styling';

export type QRStyleType = DotType;
export type QRCornerSquareType = CornerSquareType;
export type QRCornerDotType = CornerDotType;
export type QRErrorCorrectionLevel = ErrorCorrectionLevel;
export type QRGradientType = GradientType;
export type QRGradientConfig = Gradient;

export interface QRColorConfig {
  color?: string;
  gradient?: QRGradientConfig;
}

export interface QRImageConfig {
  src?: string;
  size?: number;
  margin?: number;
  hideBackgroundDots?: boolean;
}

export interface QRGeneratorOptions {
  width?: number;
  height?: number;
  margin?: number;
  data?: string;
  errorCorrectionLevel?: QRErrorCorrectionLevel;
  dots?: QRColorConfig & { type?: QRStyleType };
  cornersSquare?: QRColorConfig & { type?: QRCornerSquareType };
  cornersDot?: QRColorConfig & { type?: QRCornerDotType };
  background?: QRColorConfig;
  image?: QRImageConfig;
  type?: DrawType;
}

export interface QRValidationResult {
  readable: boolean;
  decodedText?: string;
  warning?: string;
}

const DEFAULT_OPTIONS: QRGeneratorOptions = {
  width: 400,
  height: 400,
  margin: 0,
  data: '',
  errorCorrectionLevel: 'Q',
  type: 'canvas',
  dots: { color: '#1a1917', type: 'square' },
  background: { color: '#f8f6f1' },
};

export function buildQRCodeStylingOptions(options: QRGeneratorOptions): Options {
  const merged = { ...DEFAULT_OPTIONS, ...options };

  const dotsOptions = {
    type: merged.dots?.type,
    color: merged.dots?.gradient ? undefined : merged.dots?.color,
    gradient: merged.dots?.gradient,
  };

  const cornersSquareOptions = merged.cornersSquare
    ? {
        type: merged.cornersSquare.type,
        color: merged.cornersSquare.gradient
          ? undefined
          : merged.cornersSquare.color,
        gradient: merged.cornersSquare.gradient,
      }
    : undefined;

  const cornersDotOptions = merged.cornersDot
    ? {
        type: merged.cornersDot.type,
        color: merged.cornersDot.gradient
          ? undefined
          : merged.cornersDot.color,
        gradient: merged.cornersDot.gradient,
      }
    : undefined;

  const backgroundOptions = merged.background
    ? {
        color: merged.background.gradient
          ? undefined
          : merged.background.color,
        gradient: merged.background.gradient,
      }
    : undefined;

  const imageOptions = merged.image?.src
    ? {
        imageSize: merged.image.size ?? 0.4,
        margin: merged.image.margin ?? 0,
        hideBackgroundDots: merged.image.hideBackgroundDots ?? true,
        saveAsBlob: true,
      }
    : undefined;

  return {
    width: merged.width,
    height: merged.height,
    type: merged.type,
    data: merged.data || ' ',
    margin: merged.margin,
    qrOptions: {
      errorCorrectionLevel: merged.errorCorrectionLevel,
      typeNumber: 0 as TypeNumber,
    },
    dotsOptions,
    cornersSquareOptions,
    cornersDotOptions,
    backgroundOptions,
    image: merged.image?.src,
    imageOptions,
  };
}

export function createQRCode(options: QRGeneratorOptions): QRCodeStyling {
  return new QRCodeStyling(buildQRCodeStylingOptions(options));
}

export async function generateQRCodeDataUrl(
  text: string,
  options: QRGeneratorOptions = {}
): Promise<{ dataUrl: string; validation: QRValidationResult }> {
  const merged = { ...DEFAULT_OPTIONS, ...options, data: text || ' ' };
  const qr = createQRCode(merged);

  const blob = (await qr.getRawData('png')) as Blob | null;
  if (!blob) throw new Error('Failed to generate QR code');

  const dataUrl = await blobToDataURL(blob);
  const validation = await validateQRCode(qr, text);

  return { dataUrl, validation };
}

export async function validateQRCode(
  qr: QRCodeStyling,
  expectedData?: string
): Promise<QRValidationResult> {
  try {
    const blob = (await qr.getRawData('png')) as Blob | null;
    if (!blob) return { readable: false, warning: 'Could not render QR code.' };

    const bitmap = await blobToImageBitmap(blob);
    const { data, width, height } = bitmapToImageData(bitmap);
    const code = jsQR(data, width, height);

    if (!code) {
      return {
        readable: false,
        warning:
          'The QR could not be read. Try lowering the logo size, increasing contrast, or reducing styling complexity.',
      };
    }

    if (expectedData !== undefined && code.data !== expectedData) {
      return {
        readable: false,
        warning:
          'The QR decoded differently from the input. Try a higher error-correction level or a smaller logo.',
      };
    }

    return { readable: true, decodedText: code.data };
  } catch {
    return {
      readable: false,
      warning: 'Could not validate the QR code automatically.',
    };
  }
}

export async function getQRCodeBlob(
  options: QRGeneratorOptions,
  extension: 'png' | 'jpeg' | 'svg' = 'png'
): Promise<Blob | null> {
  const qr = createQRCode(options);
  return (await qr.getRawData(extension)) as Blob | null;
}

export function downloadQRCode(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export async function copyQRCodeToClipboard(
  options: QRGeneratorOptions
): Promise<void> {
  const blob = await getQRCodeBlob(options, 'png');
  if (!blob) throw new Error('Could not generate QR code');

  if (!navigator.clipboard || !window.ClipboardItem) {
    throw new Error('Clipboard API not supported in this browser.');
  }

  await navigator.clipboard.write([
    new ClipboardItem({ [blob.type]: blob }),
  ]);
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function blobToImageBitmap(blob: Blob): Promise<ImageBitmap> {
  return createImageBitmap(blob);
}

function bitmapToImageData(bitmap: ImageBitmap): ImageData {
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get canvas context');
  ctx.drawImage(bitmap, 0, 0);
  return ctx.getImageData(0, 0, bitmap.width, bitmap.height);
}
