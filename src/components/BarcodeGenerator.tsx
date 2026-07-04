'use client';

import { useEffect, useRef, useState } from 'react';
import JsBarcode from 'jsbarcode';
import { Barcode, Download, Copy, Check } from 'lucide-react';
import { getTranslations, type Locale } from '../i18n/utils';
import { Button } from './ui/Button';
import { Input } from './ui/Input';

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
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);

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
    } catch {
      setError(t.barcodeGenError!);
    }
  }, [submitted, t.barcodeGenError]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const value = text.trim();
    if (!value) {
      setError(t.barcodeGenErrorEmpty!);
      return;
    }
    setCreating(true);
    setError(null);
    await new Promise((r) => setTimeout(r, 80));
    setSubmitted({ value, format });
    setCreating(false);
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

  const onCopyValue = async () => {
    if (!submitted || !navigator.clipboard?.writeText) return;
    await navigator.clipboard.writeText(submitted.value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const onCreateAnother = () => {
    setSubmitted(null);
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
        <Input
          label={t.barcodeGenLabel!}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          placeholder={t.barcodeGenPlaceholder}
          helperText={t.barcodeGenHelper}
          error={error}
          required
        />

        <div>
          <label
            htmlFor="barcode-format"
            className="block font-mono text-[11px] uppercase tracking-wider text-text-soft mb-1.5"
          >
            {t.barcodeGenFormatLabel}
          </label>
          <select
            id="barcode-format"
            value={format}
            onChange={(e) => setFormat(e.target.value as (typeof FORMATS)[number]['value'])}
            className="w-full bg-bg border border-border rounded-md px-3 py-2.5 text-base text-text outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-text-soft">{t.barcodeGenFormatHelp}</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button type="submit" loading={creating}>
            {t.barcodeGenButton}
          </Button>
          {submitted && (
            <Button type="button" variant="secondary" onClick={onCreateAnother}>
              {t.barcodeGenAnother}
            </Button>
          )}
        </div>

        {submitted && (
          <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onDownload}
              iconLeft={<Download className="size-3.5" />}
            >
              {t.barcodeGenDownload}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onCopyValue}
              iconLeft={copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
            >
              {t.barcodeGenCopyText}
            </Button>
          </div>
        )}
      </form>

      <div className="border border-border bg-surface p-4 md:p-6 rounded-md flex flex-col items-center gap-3 w-full lg:w-auto">
        {submitted ? (
          <>
            <div
              role="img"
              aria-label={`${t.barcodeGenFormat} ${format}`}
              className="bg-white p-3 border border-border rounded-sm w-full max-w-xs flex items-center justify-center min-h-[140px]"
            >
              <svg ref={svgRef} className="w-full h-auto" />
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-text-soft">
              {t.barcodeGenFormat}: {format}
            </p>
          </>
        ) : (
          <div className="w-full max-w-xs aspect-[2/1] flex flex-col items-center justify-center gap-3 border border-dashed border-border bg-bg rounded-md text-center px-4">
            <Barcode className="size-10 text-text-soft/50" strokeWidth={1.25} aria-hidden="true" />
            <div>
              <p className="font-display text-sm font-medium mb-1">{t.barcodeGenEmpty}</p>
              <p className="text-xs text-text-soft">{t.barcodeGenEmptyHint}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
