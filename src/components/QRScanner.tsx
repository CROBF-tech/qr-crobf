'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Camera, ScanLine, X, AlertCircle, Check, ExternalLink, RotateCcw } from 'lucide-react';
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
        console.error('[QRScanner] startCamera failed:', err);
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
    try {
      const decoded = await decodeQRFromImage(file);
      if (decoded) {
        finishWithResult(decoded);
      } else {
        setError(t.qrScanErrorGeneric!);
      }
    } catch (err) {
      console.error('[QRScanner] handleImageSelected failed:', err);
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
    if (!result || !navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border border-border bg-surface p-4 md:p-6 rounded-md">
        <div className="relative w-full max-w-md mx-auto aspect-square bg-bg border border-border overflow-hidden rounded-sm">
          <div ref={hostRef} className="absolute inset-0" />

          {isStreaming && (
            <>
              <div
                className="absolute inset-8 border-2 border-accent pointer-events-none rounded-sm"
                aria-hidden="true"
              />
              <span
                className="absolute left-1/2 -translate-x-1/2 top-3 font-mono text-[10px] uppercase tracking-[0.2em] text-accent bg-bg/80 px-2 py-1 rounded-sm animate-pulse-soft"
                role="status"
                aria-live="polite"
              >
                {t.qrScanSearching}
              </span>
            </>
          )}

          {!isStreaming && !result && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <ScanLine className="size-10 text-text-soft/50" strokeWidth={1.25} aria-hidden="true" />
              <p className="font-mono text-xs text-text-soft">{t.qrScanPreview}</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {isStreaming ? (
            <Button variant="secondary" onClick={stopCamera} iconLeft={<X className="size-4" />} fullWidth className="sm:w-auto">
              {t.qrScanStop}
            </Button>
          ) : (
            <Button onClick={startCamera} iconLeft={<Camera className="size-4" />} fullWidth className="sm:w-auto">
              {t.qrScanStart}
            </Button>
          )}
        </div>

        {isStreaming && (
          <p className="mt-3 text-xs text-text-soft text-center font-mono uppercase tracking-wider">
            {t.qrScanFrame}
          </p>
        )}
      </div>

      {error && (
        <div role="alert" className="flex items-start gap-3 border border-error/30 bg-error-soft p-4 rounded-md">
          <AlertCircle className="size-4 text-error shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-sm text-text leading-relaxed">{error}</p>
        </div>
      )}

      <ManualScanInput
        title={t.qrScanManualTitle!}
        description={t.qrScanManualDescription!}
        uploadLabel={t.qrScanManualUpload!}
        changeLabel={t.qrScanManualChange!}
        clearLabel={t.qrScanManualClear!}
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
          <pre className="font-mono text-sm bg-bg border border-border p-4 overflow-x-auto whitespace-pre-wrap break-all max-h-64 overflow-y-auto rounded-sm">
            {result}
          </pre>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              onClick={copyResult}
              fullWidth
              className="sm:flex-none sm:w-auto"
              iconLeft={copied ? <Check className="size-4" /> : undefined}
            >
              {copied ? t.scanResultCopied : t.scanResultCopyValue}
            </Button>
            {result && isUrl(result) && (
              <a
                href={result}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 font-mono uppercase tracking-wider bg-secondary text-bg hover:bg-accent active:scale-[0.98] px-4 py-3 text-xs sm:text-sm min-h-11 rounded-md transition-all duration-150"
              >
                {t.scanResultOpenLink}
                <ExternalLink className="size-3.5" aria-hidden="true" />
              </a>
            )}
            <Button
              variant="secondary"
              onClick={scanAgain}
              fullWidth
              className="sm:flex-none sm:w-auto"
              iconLeft={<RotateCcw className="size-4" />}
            >
              {t.scanResultScanAgain}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
