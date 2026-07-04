import { Html5Qrcode } from 'html5-qrcode';
import { CAMERA_CONSTRAINTS } from './camera';

export interface QRScanResult {
  text: string;
  timestamp: number;
}

export interface QRScannerConfig {
  fps?: number;
  qrbox?: { width: number; height: number } | number;
  aspectRatio?: number;
}

export class QRScanner {
  private scanner: Html5Qrcode | null = null;
  private elementId: string;
  private starting = false;
  private stopped = false;

  constructor(elementId: string) {
    this.elementId = elementId;
  }

  async start(config: QRScannerConfig, onScan: (result: QRScanResult) => void): Promise<void> {
    if (this.starting || this.scanner) return;
    this.starting = true;
    this.stopped = false;

    try {
      this.scanner = new Html5Qrcode(this.elementId);
      let handled = false;

      const videoConstraints = (CAMERA_CONSTRAINTS.video ?? { facingMode: 'environment' }) as MediaTrackConstraints;

      await this.scanner.start(
        videoConstraints,
        {
          fps: config.fps ?? 10,
          qrbox: config.qrbox ?? { width: 250, height: 250 },
          aspectRatio: config.aspectRatio ?? 1.0,
        },
        (decodedText) => {
          if (handled || this.stopped) return;
          handled = true;
          onScan({ text: decodedText, timestamp: Date.now() });
        },
        () => {} // no-op: this fires on every frame without a code
      );
    } finally {
      this.starting = false;
      // If stop() was requested while we were waiting for camera permission,
      // stop the scanner immediately so the stream is not left running orphaned.
      if (this.stopped) {
        if (this.scanner) {
          try {
            await this.scanner.stop();
          } catch {
            // Ignore cleanup errors (e.g. already stopped).
          }
          this.scanner = null;
        }
      }
    }
  }

  async stop(): Promise<void> {
    this.stopped = true;
    if (this.scanner) {
      try {
        await this.scanner.stop();
      } catch {
        // Ignore cleanup errors (e.g. already stopped).
      }
      this.scanner = null;
    }
  }
}
