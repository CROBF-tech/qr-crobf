'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { getTranslations, type Locale } from '../i18n/utils';
import { BarcodeScanner, DEFAULT_BARCODE_FORMATS } from '../lib/barcode-scanner';
import { decodeBarcodeFromFrames, decodeBarcodeFromImage } from '../lib/barcode-image-decoder';
import { requestCamera, stopStream, toCameraErrorName } from '../lib/camera';
import { capturePreprocessedFrames, waitMs } from '../lib/frame-preprocessor';
import { Button } from './ui/Button';
import { Modal } from './ui/Modal';
import { ManualScanInput } from './ManualScanInput';

interface BarcodeScannerProps {
  locale?: Locale;
}

const FRAME_COUNT = 7;
const FRAME_INTERVAL_MS = 300;

function isUrl(text: string): boolean {
  return /^https?:\/\/\S+/i.test(text);
}

export function BarcodeScannerComponent({ locale = 'en' }: BarcodeScannerProps) {
  const t = getTranslations(locale);
  const id = useId();
  const videoElementId = `barcode-video-${id}`;
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scannerRef = useRef<BarcodeScanner | null>(null);
  const mountedRef = useRef(true);
  const startingRef = useRef(false);

  const [isStreaming, setIsStreaming] = useState(false);
  const [isDecoding, setIsDecoding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ text: string; format: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const cleanup = useCallback(() => {
    scannerRef.current?.stop();
    scannerRef.current = null;
    stopStream(streamRef.current);
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
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
        setError(t.barcodeScanErrorPermission!);
        break;
      case 'SecurityError':
        setError(t.barcodeScanErrorInsecure!);
        break;
      case 'NotFoundError':
        setError(t.barcodeScanErrorNoCamera!);
        break;
      default:
        setError(t.barcodeScanErrorGeneric!);
    }
  };

  const stopCamera = () => {
    cleanup();
    setIsStreaming(false);
  };

  const finishWithResult = useCallback(
    (text: string, format: string) => {
      if (!mountedRef.current) return;
      setResult({ text, format });
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

      const video = document.getElementById(videoElementId) as HTMLVideoElement | null;
      if (!video) {
        setError(t.barcodeScanErrorGeneric!);
        return;
      }

      let stream: MediaStream;
      try {
        stream = await requestCamera();
      } catch (err) {
        if (!mountedRef.current) return;
        handleError(err);
        return;
      }

      if (!mountedRef.current) {
        stopStream(stream);
        return;
      }

      streamRef.current = stream;
      videoRef.current = video;
      video.srcObject = stream;
      try {
        await video.play();
      } catch (err) {
        stopStream(stream);
        streamRef.current = null;
        video.srcObject = null;
        if ((err as Error).name !== 'AbortError') {
          if (mountedRef.current) handleError(err);
        }
        return;
      }

      if (!mountedRef.current) {
        stopStream(stream);
        return;
      }

      setIsStreaming(true);

      scannerRef.current = new BarcodeScanner({
        formats: DEFAULT_BARCODE_FORMATS,
        timeBetweenDecodingAttempts: 250,
      });

      try {
        await scannerRef.current.start(stream, video, (scan) => {
          finishWithResult(scan.text, scan.format);
        });
      } catch (err) {
        if (!mountedRef.current) {
          cleanup();
          return;
        }
        console.warn('BarcodeScanner live start failed', err);
      }
    } finally {
      startingRef.current = false;
    }
  };

  // Manual capture: 7 preprocessed frames, decode each one. Fallback when
  // the live scanner isn't picking up the code.
  const captureAndDecode = async () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    setError(null);
    setIsDecoding(true);

    scannerRef.current?.stop();
    scannerRef.current = null;

    const allBlobs: Blob[] = [];

    try {
      for (let i = 0; i < FRAME_COUNT; i++) {
        if (!mountedRef.current) break;
        if (i > 0) await waitMs(FRAME_INTERVAL_MS);
        const variants = await capturePreprocessedFrames(video);
        for (const v of variants) allBlobs.push(v.blob);
      }

      if (!mountedRef.current) return;

      const decoded = await decodeBarcodeFromFrames(allBlobs);

      if (decoded) {
        finishWithResult(decoded.text, decoded.format);
      } else {
        setError(t.barcodeScanErrorNoCode!);
      }
    } finally {
      if (mountedRef.current) setIsDecoding(false);
    }
  };

  const handleImageSelected = async (file: File) => {
    setError(null);
    const decoded = await decodeBarcodeFromImage(file);
    if (decoded) {
      finishWithResult(decoded.text, decoded.format);
    } else {
      setError(t.barcodeScanErrorGeneric!);
    }
  };

  const handleTextSubmitted = (text: string) => {
    const value = text.trim();
    if (!value) return;
    finishWithResult(value, 'MANUAL');
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
    await navigator.clipboard.writeText(result.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="border border-border bg-surface p-4 md:p-6">
        <div className="relative w-full max-w-sm mx-auto aspect-2/1 bg-bg border border-border overflow-hidden flex items-center justify-center">
          <video
            id={videoElementId}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          {!isStreaming && !result && (
            <p className="font-mono text-xs text-text-soft text-center px-4 relative z-10">
              {t.barcodeScanPreview}
            </p>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-3">
          {isStreaming ? (
            <>
              <Button onClick={captureAndDecode} disabled={isDecoding}>
                {isDecoding ? '...' : t.barcodeScanRead!}
              </Button>
              <Button variant="secondary" onClick={stopCamera}>
                {t.barcodeScanStop}
              </Button>
            </>
          ) : (
            <Button onClick={startCamera}>{t.barcodeScanStart}</Button>
          )}
        </div>
      </div>

      {error && (
        <div className="border border-accent/30 bg-accent/10 p-4">
          <p className="text-sm text-text">{error}</p>
        </div>
      )}

      <ManualScanInput
        title={t.barcodeScanManualTitle!}
        description={t.barcodeScanManualDescription!}
        uploadLabel={t.barcodeScanManualUpload!}
        pasteLabel={t.barcodeScanManualPaste!}
        placeholder={t.barcodeScanManualPastePlaceholder!}
        useLabel={t.barcodeScanManualUse!}
        onImageSelected={handleImageSelected}
        onTextSubmitted={handleTextSubmitted}
        disabled={isDecoding}
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
            {result?.text}
          </pre>

          <p className="font-mono text-xs text-text-soft">
            {t.barcodeScanFormatLabel}: <span className="text-text">{result?.format}</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-2">
            <Button onClick={copyResult} className="flex-1 sm:flex-none">
              {copied ? t.scanResultCopied : t.scanResultCopyValue}
            </Button>
            {result && isUrl(result.text) && (
              <a
                href={result.text}
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
