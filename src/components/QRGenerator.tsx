'use client';

import { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { getTranslations, type Locale } from '../i18n/utils';

interface QRGeneratorProps {
  locale?: Locale;
}

export function QRGenerator({ locale = 'en' }: QRGeneratorProps) {
  const t = getTranslations(locale);
  const [text, setText] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [error, setError] = useState<string | null>(null);

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

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    try {
      setSubmitted(value);
    } catch {
      setError(t.qrGenError!);
    }
  };

  const onDownload = (extension: 'png' | 'svg') => {
    qrRef.current?.download({ name: 'qr-code', extension });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-8 items-start">
      <form onSubmit={onSubmit} className="border border-border bg-surface p-4 md:p-6 flex flex-col gap-4">
        <div>
          <label
            htmlFor="qr-input"
            className="font-mono text-xs uppercase tracking-wider text-text-soft block mb-2"
          >
            {t.qrGenLabel}
          </label>
          <textarea
            id="qr-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.qrGenPlaceholder}
            rows={4}
            className="w-full bg-bg border border-border focus:border-accent px-3 py-2 text-sm font-mono placeholder:text-text-soft/50 outline-none resize-y"
          />
          <p className="mt-2 text-xs text-text-soft">{t.qrGenHelper}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="font-mono uppercase tracking-wider bg-text text-bg hover:bg-accent px-4 py-3 text-xs sm:text-sm transition-colors duration-200"
          >
            {t.qrGenButton}
          </button>
          {submitted && (
            <>
              <button
                type="button"
                onClick={() => onDownload('png')}
                className="font-mono uppercase tracking-wider bg-surface hover:bg-secondary hover:text-bg px-4 py-3 text-xs sm:text-sm transition-colors duration-200 border border-border"
              >
                {t.qrGenDownload} (PNG)
              </button>
              <button
                type="button"
                onClick={() => onDownload('svg')}
                className="font-mono uppercase tracking-wider bg-surface hover:bg-secondary hover:text-bg px-4 py-3 text-xs sm:text-sm transition-colors duration-200 border border-border"
              >
                SVG
              </button>
            </>
          )}
        </div>

        {error && (
          <div className="border border-accent/30 bg-accent/10 p-3">
            <p className="text-sm text-text">{error}</p>
          </div>
        )}
      </form>

      <div className="border border-border bg-surface p-4 md:p-6 flex flex-col items-center gap-3 min-w-[320px]">
        {submitted ? (
          <>
            <div
              ref={containerRef}
              className="bg-white p-2 border border-border"
              aria-label={t.qrGenAlt}
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-soft">
              {t.qrGenAlt}
            </p>
          </>
        ) : (
          <div className="w-[320px] h-[320px] flex items-center justify-center border border-dashed border-border bg-bg">
            <p className="font-mono text-xs text-text-soft text-center px-4">
              {t.qrGenEmpty}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
