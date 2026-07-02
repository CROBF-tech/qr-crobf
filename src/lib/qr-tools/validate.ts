import jsQR from 'jsqr';

export interface QRValidationResult {
  valid: boolean;
  data: string | null;
}

export function validateQRCode(dataUrl: string, expectedText: string): Promise<QRValidationResult> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = Math.min(img.width, img.height);
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve({ valid: false, data: null });
        return;
      }
      ctx.drawImage(img, 0, 0, size, size);
      const imageData = ctx.getImageData(0, 0, size, size);
      const code = jsQR(imageData.data, size, size);
      if (code && code.data === expectedText) {
        resolve({ valid: true, data: code.data });
      } else {
        resolve({ valid: false, data: code?.data || null });
      }
    };
    img.onerror = () => resolve({ valid: false, data: null });
    img.src = dataUrl;
  });
}
