'use client';

import { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Download, QrCode, Copy, Check } from 'lucide-react';
import { getTranslations, type Locale } from '../i18n/utils';
import { Button } from './ui/Button';
import { Textarea } from './ui/Input';

interface QRGeneratorProps {
  locale?: Locale;
}

export function QRGenerator({ locale = 'en' }: QRGeneratorProps) {
  const t = getTranslations(locale);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const qrRef = useRef<QRCodeStyling | null>(null);

  useEffect(() => {
    if (!submitted || !containerRef.current) return;
    setError(null);

    const qr = new QRCodeStyling({
      type: 'svg',
      width: 320,
      height: 320,
      margin: 8,
      data: submitted,
      qrOptions: { errorCorrectionLevel: 'M' },
      dotsOptions: { type: 'square', color: '#1a1917' },
      backgroundOptions: { color: '#ffffff' },
    });
    qrRef.current = qr;

    containerRef.current.innerHTML = '';
    qr.append(containerRef.current);
  }, [submitted]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) {
      setError(t.qrGenErrorEmpty!);
      return;
    }
    setCreating(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 80));
    try {
      setSubmitted(value);
    } catch (err) {
      console.error('[QRGenerator] onSubmit failed:', err);
      setError(t.qrGenError!);
    } finally {
      setCreating(false);
    }
  };

  const onDownload = (extension: 'png' | 'svg' | 'jpeg') => {
    qrRef.current?.download({ name: 'qr-code', extension });
  };

  const onCopyText = async () => {
    if (!navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(submitted);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onCreateAnother = () => {
    setSubmitted('');
    setText('');
    setError(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4 lg:gap-6 items-start">
      <form
        onSubmit={onSubmit}
        className="border border-border bg-surface p-4 md:p-6 rounded-md flex flex-col gap-5"
        noValidate
      >
        <Textarea
          label={t.qrGenLabel!}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          placeholder={t.qrGenPlaceholder}
          helperText={t.qrGenHelper}
          error={error}
          rows={4}
          required
        />

        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={creating}>
            {t.qrGenButton}
          </Button>
          {submitted && (
            <Button type="button" variant="secondary" onClick={onCreateAnother}>
              {t.qrGenAnother}
            </Button>
          )}
        </div>

        {submitted && (
          <div
            role="group"
            aria-label={t.qrGenDownload}
            className="flex flex-wrap gap-2 pt-3 border-t border-border"
          >
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDownload('png')}
              iconLeft={<Download className="size-3.5" />}
            >
              {t.qrGenDownloadPng}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDownload('svg')}
              iconLeft={<Download className="size-3.5" />}
            >
              {t.qrGenDownloadSvg}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onDownload('jpeg')}
              iconLeft={<Download className="size-3.5" />}
            >
              {t.qrGenDownloadJpeg}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCopyText}
              iconLeft={copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            >
              {t.qrGenCopyText}
            </Button>
          </div>
        )}
      </form>

      <div className="border border-border bg-surface p-4 md:p-6 rounded-md flex flex-col items-center gap-3 w-full lg:w-auto">
        {submitted ? (
          <>
            <div
              ref={containerRef}
              role="img"
              aria-label={t.qrGenAlt}
              className="bg-white p-2 border border-border rounded-sm w-full max-w-xs"
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-soft">
              {t.qrGenAlt}
            </p>
          </>
        ) : (
          <div className="w-full max-w-xs aspect-square flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-bg rounded-md text-center px-4">
            <QrCode className="size-10 text-text-soft/50" strokeWidth={1.25} aria-hidden="true" />
            <div>
              <p className="font-display text-sm font-medium mb-1">{t.qrGenEmpty}</p>
              <p className="text-xs text-text-soft">{t.qrGenEmptyHint}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
