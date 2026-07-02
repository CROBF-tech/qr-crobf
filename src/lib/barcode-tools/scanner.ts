import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';

export interface BarcodeScannerConfig {
  videoElement: HTMLVideoElement;
  formats?: string[];
  timeBetweenDecodingAttempts?: number;
}

export interface ScanResult {
  text: string;
  format: string;
  timestamp: number;
}

export type BarcodeScanCallback = (result: ScanResult) => void;

interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<Array<{ rawValue: string; format: string }>>;
}

declare global {
  interface Window {
    BarcodeDetector?: {
      new (options?: { formats?: string[] }): BarcodeDetectorLike;
      getSupportedFormats(): Promise<string[]>;
    };
  }
}

/**
 * Picks the fastest available barcode decoder:
 *  1. Native BarcodeDetector (Chrome/Edge/Android, Safari iPadOS 17+)
 *  2. @zxing/library fallback (anywhere else)
 */
export class BarcodeScanner {
  private videoElement: HTMLVideoElement;
  private isActive: boolean = false;
  private stopFn: () => void = () => {};
  private onScan: BarcodeScanCallback | null = null;
  private rafId: number | null = null;
  private intervalId: number | null = null;

  constructor(config: BarcodeScannerConfig) {
    this.videoElement = config.videoElement;
  }

  async start(onScan: BarcodeScanCallback): Promise<void> {
    this.onScan = onScan;
    this.isActive = true;

    if (typeof window !== 'undefined' && window.BarcodeDetector) {
      try {
        await this.startNative();
        return;
      } catch (err) {
        console.error('[BarcodeScanner] Native BarcodeDetector failed, falling back to ZXing:', err);
        this.cleanupTransport();
      }
    }

    await this.startZxing();
  }

  private async startNative(): Promise<void> {
    const supported = await window.BarcodeDetector!.getSupportedFormats();
    const formats = supported.includes('qr_code')
      ? supported // include QR so a single scanner handles both code types
      : supported;

    const detector = new window.BarcodeDetector!({ formats });

    const detectLoop = async () => {
      if (!this.isActive) return;
      try {
        if (this.videoElement.readyState >= 2) {
          const results = await detector.detect(this.videoElement);
          if (results.length > 0 && this.isActive) {
            this.isActive = false;
            this.onScan?.({
              text: results[0].rawValue,
              format: results[0].format,
              timestamp: Date.now(),
            });
            this.stopMediaTracks();
            return;
          }
        }
      } catch (err) {
        console.error('[BarcodeScanner] Native detect error:', err);
      }
      if (this.isActive) {
        this.rafId = requestAnimationFrame(detectLoop);
      }
    };

    this.rafId = requestAnimationFrame(detectLoop);
  }

  private async startZxing(): Promise<void> {
    const hints = new Map();
    this.reader = new BrowserMultiFormatReader(hints, 300);
    await this.reader.decodeFromVideoDevice(
      { facingMode: 'environment' },
      this.videoElement,
      (result, _err, controls) => {
        if (result && this.isActive) {
          this.isActive = false;
          this.onScan?.({
            text: result.getText(),
            format: result.getBarcodeFormat().toString(),
            timestamp: Date.now(),
          });
          controls.stop();
        }
      },
    );
  }

  private reader: BrowserMultiFormatReader | null = null;

  stop(): void {
    this.isActive = false;
    this.cleanupTransport();
    if (this.reader) {
      try {
        this.reader.reset();
      } catch (err) {
        console.error('[BarcodeScanner] reset error:', err);
      }
      this.reader = null;
    }
  }

  private cleanupTransport(): void {
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private stopMediaTracks(): void {
    const stream = this.videoElement.srcObject as MediaStream | null;
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      this.videoElement.srcObject = null;
    }
  }
}
