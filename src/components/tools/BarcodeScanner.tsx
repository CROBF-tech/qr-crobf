'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { BarcodeScanner, type BarcodeScanCallback } from '../../lib/barcode-tools/scanner';
import { decodeBarcodeFromImage } from '../../lib/qr-tools/decodeImage';
import { getTranslations, type Locale } from '../../i18n/utils';
import { Button } from '../ui/Button';

interface Props {
  locale?: Locale;
}

export function BarcodeScannerComponent({ locale = 'en' }: Props) {
  const t = getTranslations(locale);
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [format, setFormat] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const scannerRef = useRef<BarcodeScanner | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const handleScanRef = useRef<BarcodeScanCallback | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const stopScanner = useCallback(() => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current = null;
    }
    setIsScanning(false);
    setIsInitializing(false);
  }, []);

  const handleScan: BarcodeScanCallback = useCallback((scanResult) => {
    setResult(scanResult.text);
    setFormat(scanResult.format);
    stopScanner();
  }, [stopScanner]);

  useEffect(() => {
    handleScanRef.current = handleScan;
  }, [handleScan]);

  useEffect(() => {
    if (!isScanning || isInitializing) return;
    if (!videoRef.current) return;
    if (scannerRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        const scanner = new BarcodeScanner({ videoElement: videoRef.current! });
        if (cancelled) {
          scanner.stop();
          return;
        }
        scannerRef.current = scanner;
        await scanner.start((result) => handleScanRef.current?.(result));
        if (cancelled) {
          scanner.stop();
        } else {
          videoRef.current?.play().catch((err) => {
            console.error('[BarcodeScanner] video.play() rejected:', err);
          });
        }
      } catch (err) {
        console.error('[BarcodeScanner]', err);
        if (cancelled) return;

        let message = t.qrScanErrorGeneric;
        if (err instanceof Error) {
          if (err.name === 'NotAllowedError') {
            message = t.qrScanErrorPermission;
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            message = locale === 'es'
              ? 'La cámara está en uso por otra aplicación. Cierra otras pestañas o recarga la página.'
              : 'Camera is in use by another application. Close other tabs or reload the page.';
          } else if (err.name === 'NotFoundError') {
            message = locale === 'es'
              ? 'No se encontró ninguna cámara. Conecta una cámara e intenta de nuevo.'
              : 'No camera found. Connect a camera and try again.';
          } else if (err.name === 'OverconstrainedError') {
            message = locale === 'es'
              ? 'La cámara no soporta los ajustes solicitados. Prueba con otra cámara.'
              : 'The camera does not support the requested settings. Try a different camera.';
          } else if (err.name === 'SecurityError') {
            message = locale === 'es'
              ? 'La cámara requiere una conexión segura (HTTPS). Verifica la URL.'
              : 'Camera access requires a secure connection (HTTPS). Check the URL.';
          }
        }

        setError(message);
        setIsScanning(false);
        setIsInitializing(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isScanning, isInitializing, locale, t]);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && scannerRef.current) {
        scannerRef.current.stop();
        scannerRef.current = null;
        setIsScanning(false);
        setIsInitializing(false);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  const startScanning = async () => {
    setError(null);
    setResult(null);

    if (!navigator.mediaDevices?.getUserMedia) {
      setError(t.qrScanErrorNoCamera);
      return;
    }

    setIsInitializing(true);
    setIsScanning(true);
  };

  const stopScanning = () => {
    stopScanner();
  };

  const copyResult = async () => {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);
    try {
      const decoded = await decodeBarcodeFromImage(file);
      if (decoded) {
        setResult(decoded.text);
        setFormat(decoded.format);
      } else {
        setError(
          locale === 'es'
            ? 'No se encontró ningún código de barras en la imagen.'
            : 'No barcode found in the image.',
        );
      }
    } catch (err) {
      console.error('[BarcodeScanner] file upload decode failed:', err);
      setError(
        locale === 'es'
          ? 'No se pudo leer la imagen. Intenta con otra.'
          : 'Could not read the image. Try another one.',
      );
    } finally {
      e.target.value = '';
    }
  };

  const useManualValue = () => {
    if (!manualInput.trim()) return;
    setResult(manualInput.trim());
    setFormat('manual');
    setError(null);
    setManualInput('');
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="border border-border bg-surface min-h-[300px] flex items-center justify-center overflow-hidden relative">
        {isScanning ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full max-h-[400px] object-contain"
            />
            {!isInitializing && (
              <div className="absolute top-3 left-1/2 -translate-x-1/2 z-10">
                <div className="bg-accent/90 text-white px-3 py-1.5 rounded-full flex items-center gap-2">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                  <span className="font-mono text-xs">
                    {locale === 'es' ? 'Apunta al código de barras' : 'Point at barcode'}
                  </span>
                </div>
              </div>
            )}
          </>
        ) : (
          <p className="font-mono text-xs text-text-soft px-4 text-center">{t.barcodeScanPreview}</p>
        )}

        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/90 z-20">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            <p className="font-mono text-xs text-text-soft px-4 text-center">
              {locale === 'es' ? 'Iniciando cámara...' : 'Starting camera...'}
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-accent-soft text-text px-4 py-3 font-mono text-xs">{error}</div>
      )}

      <div className="flex items-center gap-3">
        {isScanning ? (
          <Button onClick={stopScanning} variant="secondary">
            {t.barcodeScanStop}
          </Button>
        ) : (
          <Button onClick={startScanning} disabled={isInitializing}>
            {isInitializing
              ? (locale === 'es' ? 'Iniciando...' : 'Starting...')
              : t.barcodeScanStart
            }
          </Button>
        )}
      </div>

      {/* Manual fallback */}
      {!isScanning && !result && (
        <div className="border border-border bg-surface p-4 flex flex-col gap-3">
          <div>
            <p className="font-mono text-xs uppercase tracking-wider text-text-soft">
              {t.barcodeScanManualTitle}
            </p>
            <p className="font-mono text-xs text-text-soft mt-1">
              {t.barcodeScanManualDescription}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              variant="secondary"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              {t.barcodeScanManualUpload}
            </Button>
          </div>
          <div className="flex flex-col gap-2">
            <label className="font-mono text-xs text-text-soft">
              {t.barcodeScanManualPaste}
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder={t.barcodeScanManualPastePlaceholder}
                className="flex-1 min-w-0 px-3 py-2 bg-bg border border-border font-mono text-xs"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') useManualValue();
                }}
              />
              <Button
                variant="primary"
                size="sm"
                onClick={useManualValue}
                disabled={!manualInput.trim()}
              >
                {t.barcodeScanManualUse}
              </Button>
            </div>
          </div>
        </div>
      )}

      {result && (
        <div className="border border-border bg-surface p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <span className="font-mono text-xs uppercase tracking-wider text-text-soft block mb-1">
                {t.barcodeScanResultLabel}
              </span>
              <p className="font-mono text-sm break-all">{result}</p>
              {format && (
                <span className="font-mono text-xs text-text-soft mt-1 block">
                  {t.barcodeScanFormatLabel}: {format}
                </span>
              )}
            </div>
            <Button variant="secondary" size="sm" onClick={copyResult}>
              {copied ? t.barcodeScanCopied : t.barcodeScanCopy}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
