import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
import { DecodeHintType, BarcodeFormat } from '@zxing/library';

export interface BarcodeScanResult {
  text: string;
  format: string;
  timestamp: number;
}

export interface BarcodeScannerConfig {
  formats?: BarcodeFormat[];
  timeBetweenDecodingAttempts?: number;
}

export const DEFAULT_BARCODE_FORMATS: BarcodeFormat[] = [
  BarcodeFormat.CODE_128,
  BarcodeFormat.CODE_39,
  BarcodeFormat.EAN_13,
  BarcodeFormat.EAN_8,
  BarcodeFormat.UPC_A,
  BarcodeFormat.UPC_E,
  BarcodeFormat.ITF,
  BarcodeFormat.CODABAR,
  BarcodeFormat.CODE_93,
];

export class BarcodeScanner {
  private reader: BrowserMultiFormatReader;
  private controls: IScannerControls | null = null;
  private starting = false;
  private stopped = false;

  constructor(config: BarcodeScannerConfig = {}) {
    const hints = new Map<DecodeHintType, unknown>();
    hints.set(DecodeHintType.TRY_HARDER, true);
    hints.set(DecodeHintType.CHARACTER_SET, "utf-8");
    if (config.formats && config.formats.length > 0) {
      hints.set(DecodeHintType.POSSIBLE_FORMATS, config.formats);
    }

    this.reader = new BrowserMultiFormatReader(hints, {
      delayBetweenScanAttempts: config.timeBetweenDecodingAttempts ?? 300,
    });
  }

  async start(
    videoStream: MediaStream,
    videoElement: HTMLVideoElement,
    onScan: (result: BarcodeScanResult) => void
  ): Promise<void> {
    if (this.starting || this.controls) return;
    this.starting = true;
    this.stopped = false;

    try {
      let handled = false;

      this.controls = await this.reader.decodeFromStream(
        videoStream,
        videoElement,
        (result) => {
          if (handled || this.stopped) return;
          if (result) {
            handled = true;
            onScan({
              text: result.getText(),
              format: result.getBarcodeFormat().toString(),
              timestamp: Date.now(),
            });
          }
        }
      );
    } finally {
      this.starting = false;
      // If stop() was called while we were waiting for the camera to initialize,
      // halt the controls immediately so the stream does not stay alive orphaned.
      if (this.stopped) {
        this.controls?.stop();
        this.controls = null;
      }
    }
  }

  stop(): void {
    this.stopped = true;
    this.controls?.stop();
    this.controls = null;
  }
}
