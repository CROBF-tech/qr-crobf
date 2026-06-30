'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { QRScanner } from '@crobf/qr-tools';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { getTranslations, type Locale } from '../../i18n/utils';

interface QRScannerProps {
  locale?: Locale;
}

export function QRScannerComponent({ locale = 'en' }: QRScannerProps) {
  const t = getTranslations(locale);

  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef<QRScanner | null>(null);
  const containerId = 'qr-scanner-container';

  const startScanning = useCallback(async () => {
    setError('');
    setResult('');
    setCopied(false);

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(t.qrScanErrorNoCamera);
      }

      scannerRef.current = new QRScanner(containerId);
      await scannerRef.current.start(
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0,
        },
        (decodedText) => {
          setResult(decodedText);
          if (scannerRef.current) {
            scannerRef.current.stop();
            scannerRef.current = null;
            setIsScanning(false);
          }
        }
      );
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
      title={t.qrScannerTitle}
      description={t.qrScanDescription}
      icon={
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 7V5a2 2 0 0 1 2-2h2" />
          <path d="M17 3h2a2 2 0 0 1 2 2v2" />
          <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
          <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      }
    >
      <div className="space-y-5">
        <div
          id={containerId}
          className={`border border-border bg-text aspect-square w-full overflow-hidden ${!isScanning ? 'flex items-center justify-center' : ''}`}
        >
          {!isScanning && (
            <div className="flex flex-col items-center gap-3 px-4 text-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" className="text-text-soft">
                <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              <span className="text-xs leading-relaxed text-text-soft">{t.qrScanPreview}</span>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              {t.qrScanStart}
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="secondary" className="flex-1">
              {t.qrScanStop}
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
            <p className="mb-2 font-mono text-xs uppercase tracking-wider text-text-soft">{t.qrScanResultLabel}</p>
            <p className="break-all font-mono text-sm text-text">{result}</p>
            <Button onClick={copyToClipboard} variant="ghost" size="sm" className="mt-3">
              {copied ? t.qrScanCopied : t.qrScanCopy}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
