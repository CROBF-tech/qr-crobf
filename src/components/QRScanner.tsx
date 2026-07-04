'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { getTranslations, type Locale } from '../i18n/utils';
import { QRScanner as QRScannerEngine } from '../lib/qr-scanner';
import { decodeQRFromImage } from '../lib/qr-image-decoder';
import { toCameraErrorName } from '../lib/camera';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { ManualScanInput } from './ManualScanInput';

interface QRScannerProps {
  locale?: Locale;
}

function isUrl(text: string): boolean {
  return /^https?:\/\/\S+/i.test(text);
}

export function QRScanner({ locale = 'en' }: QRScannerProps) {
  const t = getTranslations(locale);
  const id = useId();
  // Single ref to the host element that html5-qrcode will own. We do NOT
  // render any React children inside this element, so the library's DOM
  // mutations (creating/moving its internal <video>) never conflict with
  // React's reconciliation.
  const hostRef = useRef<HTMLDivElement | null>(null);
  const elementId = `qr-scanner-${id}`;
  const scannerRef = useRef<QRScannerEngine | null>(null);
  const mountedRef = useRef(true);
  const startingRef = useRef(false);

  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const cleanup = useCallback(() => {
    scannerRef.current?.stop();
    scannerRef.current = null;
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  const handleError = (err: unknown) => {
    const name = toCameraErrorName(err);
    switch (name) {
      case 'NotAllowedError':
        setError(t.qrScanErrorPermission!);
        break;
      case 'SecurityError':
        setError(t.qrScanErrorInsecure!);
        break;
      case 'NotFoundError':
        setError(t.qrScanErrorNoCamera!);
        break;
      case 'NotReadableError':
        setError(t.qrScanErrorBusy!);
        break;
      case 'OverconstrainedError':
        setError(t.qrScanErrorConstraints!);
        break;
      default:
        setError(t.qrScanErrorGeneric!);
    }
  };

  const finishWithResult = useCallback(
    (text: string) => {
      if (!mountedRef.current) return;
      setResult(text);
      setIsStreaming(false);
      cleanup();
    },
    [cleanup]
  );

  const startCamera = async () => {
    if (startingRef.current) return;
    startingRef.current = true;

    try {
      cleanup();

      setError(null);
      setResult(null);

      if (!hostRef.current) {
        setError(t.qrScanErrorGeneric!);
        return;
      }

      // Hand html5-qrcode a fresh, empty <div> it owns entirely. The host
      // wrapper is just a layout box — no React children inside the div
      // the library will mutate.
      const target = document.createElement('div');
      target.id = elementId;
      target.style.width = '100%';
      target.style.height = '100%';
      target.style.position = 'relative';
      hostRef.current.replaceChildren(target);

      scannerRef.current = new QRScannerEngine(elementId);
      setIsStreaming(true);

      try {
        await scannerRef.current.start(
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (scan) => {
            finishWithResult(scan.text);
          }
        );
      } catch (err) {
        if (!mountedRef.current) {
          cleanup();
          return;
        }
        setIsStreaming(false);
        handleError(err);
      }
    } finally {
      startingRef.current = false;
    }
  };

  const stopCamera = () => {
    cleanup();
    setIsStreaming(false);
  };

  const handleImageSelected = async (file: File) => {
    setError(null);
    const decoded = await decodeQRFromImage(file);
    if (decoded) {
      finishWithResult(decoded);
    } else {
      setError(t.qrScanErrorGeneric!);
    }
  };

  const handleTextSubmitted = (text: string) => {
    const value = text.trim();
    if (!value) return;
    finishWithResult(value);
  };

  const closeModal = useCallback(() => {
    setResult(null);
    setCopied(false);
  }, []);

  const scanAgain = useCallback(() => {
    setResult(null);
    setCopied(false);
    void startCamera();
  }, []);

  const copyResult = async () => {
    if (!result) return;
    if (!navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border border-border bg-surface p-4 md:p-6">
        <div className="relative w-full max-w-sm mx-auto aspect-square bg-bg border border-border overflow-hidden">
          <div ref={hostRef} className="absolute inset-0" />
          {!isStreaming && !result && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <p className="font-mono text-xs text-text-soft text-center px-4">
                {t.qrScanPreview}
              </p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {isStreaming ? (
            <Button variant="secondary" onClick={stopCamera}>
              {t.qrScanStop}
            </Button>
          ) : (
            <Button onClick={startCamera}>{t.qrScanStart}</Button>
          )}
        </div>
      </div>

      {error && (
        <div className="border border-accent/30 bg-accent/10 p-4">
          <p className="text-sm text-text">{error}</p>
        </div>
      )}

      <ManualScanInput
        title={t.qrScanManualTitle!}
        description={t.qrScanManualDescription!}
        uploadLabel={t.qrScanManualUpload!}
        pasteLabel={t.qrScanManualPaste!}
        placeholder={t.qrScanManualPastePlaceholder!}
        useLabel={t.qrScanManualUse!}
        onImageSelected={handleImageSelected}
        onTextSubmitted={handleTextSubmitted}
        disabled={isStreaming}
      />

      <Modal
        open={result !== null}
        onClose={closeModal}
        eyebrow={t.scanResultModalEyebrow}
        title={t.scanResultModalTitle!}
        maxWidth="lg"
      >
        <div className="flex flex-col gap-4">
          <pre className="font-mono text-sm bg-bg border border-border p-4 overflow-x-auto whitespace-pre-wrap break-all max-h-64 overflow-y-auto">
            {result}
          </pre>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={copyResult} className="flex-1 sm:flex-none">
              {copied ? t.scanResultCopied : t.scanResultCopyValue}
            </Button>
            {result && isUrl(result) && (
              <a
                href={result}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono uppercase tracking-wider bg-secondary text-bg hover:bg-accent px-4 py-3 text-xs sm:text-sm transition-colors duration-200 inline-flex items-center justify-center"
              >
                {t.scanResultOpenLink}
              </a>
            )}
            <Button variant="secondary" onClick={scanAgain} className="flex-1 sm:flex-none">
              {t.scanResultScanAgain}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
