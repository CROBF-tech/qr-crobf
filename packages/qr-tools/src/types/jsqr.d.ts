declare module 'jsqr' {
  export interface QRCode {
    data: string;
    chunks: Array<{ type: string; text?: string }>;
    version: number;
    location: {
      topRight: { x: number; y: number };
      topLeft: { x: number; y: number };
      bottomLeft: { x: number; y: number };
      bottomRight: { x: number; y: number };
      topRightFinderPattern: { x: number; y: number };
      topLeftFinderPattern: { x: number; y: number };
      bottomLeftFinderPattern: { x: number; y: number };
      bottomRightAlignmentPattern?: { x: number; y: number };
    };
  }

  export default function jsQR(
    data: Uint8ClampedArray,
    width: number,
    height: number,
    options?: {
      inversionAttempts?: 'dontInvert' | 'onlyInvert' | 'attemptBoth' | 'invertFirst';
    }
  ): QRCode | null;
}
