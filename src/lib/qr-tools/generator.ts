import QRCodeStyling from 'qr-code-styling';
import type { Options, DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel } from 'qr-code-styling';

export type { DotType, CornerSquareType, CornerDotType, ErrorCorrectionLevel };

export interface QRGeneratorOptions {
  text: string;
  width?: number;
  height?: number;
  margin?: number;
  errorCorrectionLevel?: ErrorCorrectionLevel;
  dotsColor?: string;
  dotsType?: DotType;
  dotsGradient?: {
    type: 'linear' | 'radial';
    rotation: number;
    colorStops: Array<{ offset: number; color: string }>;
  };
  cornerSquareColor?: string;
  cornerSquareType?: CornerSquareType;
  cornerSquareGradient?: {
    type: 'linear' | 'radial';
    rotation: number;
    colorStops: Array<{ offset: number; color: string }>;
  };
  cornerDotColor?: string;
  cornerDotType?: CornerDotType;
  backgroundOptions?: {
    color?: string;
    gradient?: {
      type: 'linear' | 'radial';
      rotation: number;
      colorStops: Array<{ offset: number; color: string }>;
    };
  };
  image?: string;
  imageOptions?: {
    imageSize?: number;
    margin?: number;
    hideBackgroundDots?: boolean;
  };
}

export function createQRCode(options: QRGeneratorOptions): QRCodeStyling {
  const qrOptions: Options = {
    width: options.width || 300,
    height: options.height || 300,
    type: 'canvas',
    data: options.text,
    margin: options.margin ?? 2,
    qrOptions: {
      typeNumber: '0',
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    },
    dotsOptions: {
      type: options.dotsType || 'square',
      color: options.dotsColor || '#1a1917',
      gradient: options.dotsGradient,
    },
    cornersSquareOptions: {
      type: options.cornerSquareType || 'square',
      color: options.cornerSquareColor || '#1a1917',
      gradient: options.cornerSquareGradient,
    },
    cornersDotOptions: {
      type: options.cornerDotType || 'square',
      color: options.cornerDotColor || '#1a1917',
    },
    backgroundOptions: options.backgroundOptions || {
      color: '#ffffff',
    },
    image: options.image,
    imageOptions: options.imageOptions || {
      imageSize: 0.4,
      margin: 4,
      hideBackgroundDots: true,
    },
  };

  return new QRCodeStyling(qrOptions);
}

export async function renderQRCodeToDataUrl(options: QRGeneratorOptions): Promise<string | null> {
  try {
    const qr = createQRCode(options);
    const blob = await qr.getRawData('png');
    if (!blob) return null;
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function getQRCodeBlob(options: QRGeneratorOptions, extension: 'png' | 'jpeg' | 'svg'): Promise<Blob | null> {
  try {
    const qr = createQRCode(options);
    return await qr.getRawData(extension);
  } catch {
    return null;
  }
}

export function downloadQRCode(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export async function copyQRCodeToClipboard(options: QRGeneratorOptions): Promise<void> {
  const blob = await getQRCodeBlob(options, 'png');
  if (!blob) throw new Error('Could not generate QR code');
  await navigator.clipboard.write([
    new ClipboardItem({ 'image/png': blob }),
  ]);
}
