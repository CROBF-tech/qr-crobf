'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { BarcodeScanner } from '@crobf/barcode-tools';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getTranslations, type Locale } from '../../i18n/utils';

interface BarcodeScannerProps {
  locale?: Locale;
}

export function BarcodeScannerComponent({ locale = 'en' }: BarcodeScannerProps) {
  const t = getTranslations(locale);

  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState('');
  const [format, setFormat] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef<BarcodeScanner | null>(null);
  const videoId = 'barcode-scanner-video';

  const startScanning = useCallback(async () => {
    setError('');
    setResult('');
    setFormat('');
    setCopied(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(t.qrScanErrorNoCamera);
      }

      scannerRef.current = new BarcodeScanner({
        videoElementId: videoId,
        timeBetweenDecodingAttempts: 300,
      });

      await scannerRef.current.start((scanResult) => {
        setResult(scanResult.text);
        setFormat(scanResult.format);
        if (scannerRef.current) {
          scannerRef.current.stop();
          scannerRef.current = null;
          setIsScanning(false);
        }
      });

      setIsScanning(true);
    } catch (err) {
      const raw = err instanceof Error ? err.message : '';
      if (/permission|denied|not allowed/i.test(raw)) {
        setError(t.qrScanErrorPermission);
      } else {
        setError(t.qrScanErrorGeneric);
      }
      setIsScanning(false);
    }
  }, [t.qrScanErrorNoCamera, t.qrScanErrorPermission, t.qrScanErrorGeneric]);

  const stopScanning = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current = null;
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);

  const copyToClipboard = useCallback(async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [result]);

  return (
    <Card
      title={t.barcodeScannerTitle}
      description={t.barcodeScannerDesc}
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 5v14" />
          <path d="M8 5v14" />
          <path d="M12 5v14" />
          <path d="M17 5v14" />
          <path d="M21 5v14" />
        </svg>
      }
    >
      <div className="space-y-5">
        <div className="relative border border-border bg-surface aspect-[4/3] w-full overflow-hidden">
          <video
            id={videoId}
            className={`h-full w-full object-cover ${!isScanning ? 'hidden' : ''}`}
            autoPlay
            playsInline
            muted
          />
          {!isScanning && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-4 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="text-text-soft">
                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <path d="M7 12h10" />
              </svg>
              <span className="text-xs leading-relaxed text-text-soft">{t.barcodeScanPreview}</span>
            </div>
          )}
          {isScanning && (
            <div className="pointer-events-none absolute inset-x-[15%] top-1/2 h-px -translate-y-1/2 bg-accent/50" />
          )}
        </div>

        <div className="flex gap-3">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              {t.barcodeScanStart}
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="secondary" className="flex-1">
              {t.barcodeScanStop}
            </Button>
          )}
        </div>

        {error && (
          <div className="border border-accent bg-accent/10 px-4 py-3 text-sm text-accent">
            {error}
          </div>
        )}

        {result && (
          <div className="border border-secondary bg-secondary/10 px-4 py-4">
            <p className="mb-2 font-mono text-xs uppercase tracking-wider text-text-soft">{t.barcodeScanResultLabel}</p>
            <p className="break-all font-mono text-sm text-text">{result}</p>
            {format && (
              <p className="mt-2 font-mono text-xs text-secondary">{t.barcodeScanFormatLabel}: {format}</p>
            )}
            <Button onClick={copyToClipboard} variant="ghost" size="sm" className="mt-3">
              {copied ? t.barcodeScanCopied : t.barcodeScanCopy}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
