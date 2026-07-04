'use client';

import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { getTranslations, type Locale } from '../i18n/utils';

interface BarcodeGeneratorProps {
  locale?: Locale;
}

const FORMATS = [
  { value: 'CODE128', label: 'CODE128' },
  { value: 'CODE39', label: 'CODE39' },
  { value: 'CODE93', label: 'CODE93' },
  { value: 'EAN13', label: 'EAN-13' },
  { value: 'EAN8', label: 'EAN-8' },
  { value: 'UPC', label: 'UPC' },
  { value: 'ITF', label: 'ITF' },
  { value: 'codabar', label: 'CODABAR' },
  { value: 'MSI', label: 'MSI' },
] as const;

export function BarcodeGenerator({ locale = 'en' }: BarcodeGeneratorProps) {
  const t = getTranslations(locale);
  const [text, setText] = useState('');
  const [format, setFormat] = useState<(typeof FORMATS)[number]['value']>('CODE128');
  const [submitted, setSubmitted] = useState<{ value: string; format: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!submitted || !svgRef.current) return;
    setError(null);
    try {
      JsBarcode(svgRef.current, submitted.value, {
        format: submitted.format,
        displayValue: true,
        background: '#ffffff',
        lineColor: '#1a1917',
        margin: 10,
        height: 100,
        fontSize: 16,
        font: 'JetBrains Mono, monospace',
      });
    } catch (err) {
      setError(t.barcodeGenError!);
    }
  }, [submitted, t.barcodeGenError]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) return;
    setSubmitted({ value, format });
  };

  const onDownload = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const source = serializer.serializeToString(svgRef.current);
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `barcode-${format}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 lg:gap-8 items-start">
      <form onSubmit={onSubmit} className="border border-border bg-surface p-4 md:p-6 flex flex-col gap-4">
        <div>
          <label
            htmlFor="barcode-input"
            className="font-mono text-xs uppercase tracking-wider text-text-soft block mb-2"
          >
            {t.barcodeGenLabel}
          </label>
          <input
            id="barcode-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t.barcodeGenPlaceholder}
            className="w-full bg-bg border border-border focus:border-accent px-3 py-2 text-sm font-mono placeholder:text-text-soft/50 outline-none"
          />
        </div>

        <div>
          <label
            htmlFor="barcode-format"
            className="font-mono text-xs uppercase tracking-wider text-text-soft block mb-2"
          >
            {t.barcodeGenFormatLabel}
          </label>
          <select
            id="barcode-format"
            value={format}
            onChange={(e) => setFormat(e.target.value as (typeof FORMATS)[number]['value'])}
            className="w-full bg-bg border border-border focus:border-accent px-3 py-2 text-sm font-mono outline-none"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-text-soft">{t.barcodeGenFormatHelp}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="font-mono uppercase tracking-wider bg-text text-bg hover:bg-accent px-4 py-3 text-xs sm:text-sm transition-colors duration-200"
          >
            {t.barcodeGenButton}
          </button>
          {submitted && (
            <button
              type="button"
              onClick={onDownload}
              className="font-mono uppercase tracking-wider bg-surface hover:bg-secondary hover:text-bg px-4 py-3 text-xs sm:text-sm transition-colors duration-200 border border-border"
            >
              {t.barcodeGenDownload}
            </button>
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
          <div className="bg-white p-3 border border-border w-full flex items-center justify-center min-h-[140px]">
            <svg ref={svgRef} />
          </div>
        ) : (
          <div className="w-[320px] h-[160px] flex items-center justify-center border border-dashed border-border bg-bg">
            <p className="font-mono text-xs text-text-soft text-center px-4">
              {t.barcodeGenEmpty}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
