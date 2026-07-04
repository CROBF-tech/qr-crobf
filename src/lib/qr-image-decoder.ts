import jsQR from 'jsqr';

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (err) => {
      console.error('[qr-image-decoder] loadImage failed:', err);
      reject(new Error('Could not load image'));
    };
    img.src = src;
  });
}

export async function decodeQRFromImage(file: File): Promise<string | null> {
  const url = URL.createObjectURL(file);

  try {
    const img = await loadImage(url);
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      console.error('[qr-image-decoder] getContext failed');
      return null;
    }

    ctx.drawImage(img, 0, 0);
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const code = jsQR(imageData.data, imageData.width, imageData.height);

    if (!code) {
      console.error('[qr-image-decoder] jsQR returned no code');
    }

    return code?.data ?? null;
  } catch (err) {
    console.error('[qr-image-decoder] decodeQRFromImage failed:', err);
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}
