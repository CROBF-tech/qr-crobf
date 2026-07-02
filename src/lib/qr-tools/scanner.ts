import { Html5Qrcode } from 'html5-qrcode';

export interface QRScannerConfig {
  fps?: number;
  qrbox?: { width: number; height: number } | number;
  aspectRatio?: number;
}

export type QRScanCallback = (decodedText: string) => void;

export class QRScanner {
  private scanner: Html5Qrcode | null = null;
  private elementId: string;

  constructor(elementId: string) {
    this.elementId = elementId;
  }

  async start(config: QRScannerConfig, onScan: QRScanCallback): Promise<void> {
    this.scanner = new Html5Qrcode(this.elementId);
    const qrbox = config.qrbox || { width: 250, height: 250 };
    await this.scanner.start(
      {
        facingMode: { ideal: 'environment' },
        width: { ideal: 1280 },
        height: { ideal: 720 },
      },
      {
        fps: config.fps || 10,
        aspectRatio: config.aspectRatio || 1.0,
        qrbox,
      },
      (decodedText) => {
        onScan(decodedText);
        this.stop();
      },
      () => {},
    );
  }

  async stop(): Promise<void> {
    if (this.scanner) {
      try {
        await this.scanner.stop();
        await this.scanner.clear();
      } catch {
        // scanner may already be stopped
      }
      this.scanner = null;
    }
  }
}
