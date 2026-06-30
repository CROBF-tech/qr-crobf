import { BrowserMultiFormatReader, DecodeHintType, type BarcodeFormat as ZXingBarcodeFormat } from '@zxing/library';
import { type BarcodeFormat } from './types';

export type BarcodeScanCallback = (result: {
  text: string;
  format: string;
  timestamp: number;
}) => void;

export interface BarcodeScannerConfig {
  videoElementId: string;
  formats?: ZXingBarcodeFormat[];
  timeBetweenDecodingAttempts?: number;
}

export class BarcodeScanner {
  private reader: BrowserMultiFormatReader;
  private videoElementId: string;
  private isActive: boolean = false;

  constructor(config: BarcodeScannerConfig) {
    this.videoElementId = config.videoElementId;
    
    const hints = new Map<DecodeHintType, unknown>();
    if (config.formats) {
      hints.set(DecodeHintType.POSSIBLE_FORMATS, config.formats);
    }
    
    this.reader = new BrowserMultiFormatReader(
      hints,
      config.timeBetweenDecodingAttempts || 300
    );
  }

  async start(onScan: BarcodeScanCallback): Promise<void> {
    if (this.isActive) {
      throw new Error('Scanner is already running');
    }

    const videoElement = document.getElementById(this.videoElementId) as HTMLVideoElement;
    if (!videoElement) {
      throw new Error(`Video element with id "${this.videoElementId}" not found`);
    }

    this.isActive = true;

    await this.reader.decodeFromVideoDevice(
      null,
      videoElement,
      (result, _error) => {
        if (result && this.isActive) {
          onScan({
            text: result.getText(),
            format: result.getBarcodeFormat().toString(),
            timestamp: Date.now(),
          });
        }
      }
    );
  }

  stop(): void {
    this.isActive = false;
    this.reader.reset();
  }

  isScanning(): boolean {
    return this.isActive;
  }
}

export type { BarcodeFormat };
