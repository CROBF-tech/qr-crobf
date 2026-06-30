import { Html5Qrcode, type Html5QrcodeResult, type Html5QrcodeCameraScanConfig } from 'html5-qrcode';

export type QRScanCallback = (decodedText: string, decodedResult: Html5QrcodeResult) => void;

export interface QRScannerConfig {
  fps?: number;
  qrbox?: { width: number; height: number } | number;
  aspectRatio?: number;
}

export class QRScanner {
  private scanner: Html5Qrcode | null = null;
  private elementId: string;

  constructor(elementId: string) {
    this.elementId = elementId;
  }

  async start(
    config: QRScannerConfig = {},
    onScan: QRScanCallback
  ): Promise<void> {
    const defaultConfig: Html5QrcodeCameraScanConfig = {
      fps: config.fps || 10,
      aspectRatio: config.aspectRatio || 1.0,
    };

    if (config.qrbox) {
      defaultConfig.qrbox = config.qrbox;
    }

    this.scanner = new Html5Qrcode(this.elementId);

    await this.scanner.start(
      { facingMode: 'environment' },
      defaultConfig,
      onScan,
      () => {}
    );
  }

  async stop(): Promise<void> {
    if (this.scanner) {
      await this.scanner.stop();
      this.scanner = null;
    }
  }

  isScanning(): boolean {
    return this.scanner !== null;
  }
}

export type { Html5QrcodeResult };
