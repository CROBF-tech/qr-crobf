import { BrowserMultiFormatReader } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';
import { DEFAULT_BARCODE_FORMATS } from './barcode-scanner';

export interface BarcodeImageDecodeResult {
  text: string;
  format: string;
}

function makeReader(formats: BarcodeFormat[]): BrowserMultiFormatReader {
  const hints = new Map<DecodeHintType, unknown>();
  hints.set(DecodeHintType.POSSIBLE_FORMATS, formats);
  hints.set(DecodeHintType.TRY_HARDER, true);
  hints.set(DecodeHintType.CHARACTER_SET, 'utf-8');
  return new BrowserMultiFormatReader(hints, {
    delayBetweenScanAttempts: 0,
  });
}

async function tryDecode(reader: BrowserMultiFormatReader, url: string): Promise<BarcodeImageDecodeResult | null> {
  try {
    const result = await reader.decodeFromImageUrl(url);
    if (!result) return null;
    return {
      text: result.getText(),
      format: result.getBarcodeFormat().toString(),
    };
  } catch (err) {
    console.error('[barcode-image-decoder] tryDecode failed:', err);
    return null;
  }
}

export async function decodeBarcodeFromImage(
  file: File,
  formats: BarcodeFormat[] = DEFAULT_BARCODE_FORMATS
): Promise<BarcodeImageDecodeResult | null> {
  const url = URL.createObjectURL(file);

  try {
    const reader = makeReader(formats);
    return await tryDecode(reader, url);
  } catch (err) {
    console.error('[barcode-image-decoder] decodeBarcodeFromImage failed:', err);
    return null;
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function decodeBarcodeFromFrames(
  frames: Blob[],
  formats: BarcodeFormat[] = DEFAULT_BARCODE_FORMATS
): Promise<BarcodeImageDecodeResult | null> {
  // Each frame has its own short-lived object URL. We share a single reader
  // instance because constructing BrowserMultiFormatReader is the expensive part.
  const reader = makeReader(formats);
  const urls: string[] = [];

  try {
    for (const blob of frames) {
      const url = URL.createObjectURL(blob);
      urls.push(url);

      const result = await tryDecode(reader, url);
      if (result) return result;
    }
    return null;
  } finally {
    urls.forEach((u) => URL.revokeObjectURL(u));
  }
}
