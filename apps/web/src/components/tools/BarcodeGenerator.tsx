'use client';

import { useState, useCallback, useEffect, useRef, type FormEvent } from 'react';
import {
  generateBarcode,
  downloadBarcode,
  exportBarcodeAsBlob,
  copyBarcodeToClipboard,
  validateBarcodeValue,
  type BarcodeGeneratorOptions,
  type BarcodeFormat,
} from '@crobf/barcode-tools';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CodeCustomizerPanel } from '../customizer/CodeCustomizerPanel';
import { Section } from '../customizer/Section';
import { ColorInput } from '../customizer/ColorInput';
import { Select } from '../customizer/Select';
import { Slider } from '../customizer/Slider';
import { Toggle } from '../customizer/Toggle';
import { useDebounce } from '../../hooks/useDebounce';
import { getTranslations, type Locale } from '../../i18n/utils';

interface BarcodeGeneratorProps {
  locale?: Locale;
}

const formats: BarcodeFormat[] = [
  'CODE128',
  'EAN13',
  'EAN8',
  'UPC',
  'CODE39',
  'ITF14',
  'MSI',
  'pharmacode',
];

const fontOptions = [
  'monospace',
  'sans-serif',
  'serif',
  'Arial',
  'Helvetica',
  'Georgia',
];

function defaultConfig(): BarcodeGeneratorOptions {
  return {
    format: 'CODE128',
    width: 2,
    height: 120,
    displayValue: true,
    font: 'monospace',
    textAlign: 'center',
    textPosition: 'bottom',
    textMargin: 2,
    fontSize: 18,
    lineColor: '#1a1917',
    background: '#f8f6f1',
    margin: 10,
  };
}

export function BarcodeGenerator({ locale = 'en' }: BarcodeGeneratorProps) {
  const t = getTranslations(locale);

  const [value, setValue] = useState('');
  const [config, setConfig] = useState<BarcodeGeneratorOptions>(defaultConfig);
  const debouncedConfig = useDebounce(config, 200);
  const [error, setError] = useState('');
  const svgRef = useRef<SVGSVGElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg'>('png');
  const [copySuccess, setCopySuccess] = useState(false);

  const validation = validateBarcodeValue(value.trim(), config.format ?? 'CODE128');

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    if (!value.trim()) {
      svgRef.current = null;
      setError('');
      return;
    }

    if (!validation.valid) {
      svgRef.current = null;
      setError(validation.message ?? 'Invalid value.');
      return;
    }

    const result = generateBarcode(value, debouncedConfig);
    if (!result.valid) {
      svgRef.current = null;
      setError(result.message ?? 'Could not create barcode.');
      return;
    }

    setError('');
    svgRef.current = result.svg;
    containerRef.current.appendChild(result.svg);
  }, [debouncedConfig, value, validation.valid, validation.message]);

  const handleDownload = useCallback(async () => {
    if (!svgRef.current) return;
    if (exportFormat === 'svg') {
      downloadBarcode(svgRef.current, `barcode-crobf-${Date.now()}.svg`);
    } else {
      const blob = await exportBarcodeAsBlob(svgRef.current, 'png');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `barcode-crobf-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [exportFormat]);

  const handleCopy = useCallback(async () => {
    if (!svgRef.current) return;
    try {
      await copyBarcodeToClipboard(svgRef.current);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setCopySuccess(false);
    }
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,340px]">
      <Card
        title={t.barcodeGeneratorTitle}
        description={t.barcodeGeneratorDesc}
      >
        <form onSubmit={(e: FormEvent) => e.preventDefault()} className="space-y-5">
          <Input
            label={t.barcodeGenLabel}
            placeholder={t.barcodeGenPlaceholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            helper={t.barcodeGenHelper}
          />

          <div className="border border-border bg-bg p-4 text-center md:p-6">
            <div
              ref={containerRef}
              className="mx-auto flex min-h-[120px] items-center justify-center overflow-auto"
            />
            {!value.trim() && (
              <p className="mt-2 text-sm text-text-soft">{t.barcodeGenError}</p>
            )}
          </div>

          {error && value.trim() && (
            <div className="border border-accent bg-accent/10 px-4 py-3 text-sm text-accent">
              {error}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Select
              label=""
              value={exportFormat}
              options={[
                { value: 'png', label: t.barcodeCustomizeFormatPng },
                { value: 'svg', label: t.barcodeCustomizeFormatSvg },
              ]}
              onChange={(v) => setExportFormat(v as typeof exportFormat)}
            />
            <Button
              onClick={handleDownload}
              disabled={!value.trim() || !validation.valid || !svgRef.current}
              className="w-full"
            >
              {t.barcodeGenDownload}
            </Button>
            <Button
              variant="secondary"
              onClick={handleCopy}
              disabled={!value.trim() || !validation.valid || !svgRef.current}
              className="w-full"
            >
              {copySuccess ? t.barcodeScanCopied : t.barcodeScanCopy}
            </Button>
          </div>
        </form>
      </Card>

      <CodeCustomizerPanel title={t.barcodeCustomizeTitle}>
        <Section title={t.barcodeCustomizeSectionFormat}>
          <Select
            label={t.barcodeGenFormatLabel}
            value={config.format ?? 'CODE128'}
            options={formats.map((f) => ({ value: f, label: f }))}
            onChange={(v) => setConfig((prev) => ({ ...prev, format: v as BarcodeFormat }))}
            helper={validation.valid ? '' : validation.message}
          />
        </Section>

        <Section title={t.barcodeCustomizeSectionColors}>
          <ColorInput
            label={t.barcodeCustomizeBarColor}
            color={config.lineColor ?? '#1a1917'}
            onChange={(c) => setConfig((prev) => ({ ...prev, lineColor: c }))}
          />
          <ColorInput
            label={t.barcodeCustomizeBackground}
            color={config.background ?? '#f8f6f1'}
            onChange={(c) => setConfig((prev) => ({ ...prev, background: c }))}
          />
        </Section>

        <Section title={t.barcodeCustomizeSectionDimensions}>
          <Slider
            label={t.barcodeCustomizeBarWidth}
            value={config.width ?? 2}
            min={1}
            max={4}
            step={1}
            unit="px"
            onChange={(v) => setConfig((prev) => ({ ...prev, width: v }))}
          />
          <Slider
            label={t.barcodeCustomizeHeight}
            value={config.height ?? 120}
            min={40}
            max={240}
            step={10}
            unit="px"
            onChange={(v) => setConfig((prev) => ({ ...prev, height: v }))}
          />
          <Slider
            label={t.barcodeCustomizeMargin}
            value={config.margin ?? 10}
            min={0}
            max={40}
            step={2}
            unit="px"
            onChange={(v) => setConfig((prev) => ({ ...prev, margin: v }))}
          />
        </Section>

        <Section title={t.barcodeCustomizeSectionText}>
          <Toggle
            label={t.barcodeCustomizeShowValue}
            checked={config.displayValue ?? true}
            onChange={(checked) => setConfig((prev) => ({ ...prev, displayValue: checked }))}
          />
          {config.displayValue && (
            <>
              <Select
                label={t.barcodeCustomizeFont}
                value={config.font ?? 'monospace'}
                options={fontOptions.map((f) => ({ value: f, label: f }))}
                onChange={(v) => setConfig((prev) => ({ ...prev, font: v }))}
              />
              <Slider
                label={t.barcodeCustomizeFontSize}
                value={config.fontSize ?? 18}
                min={10}
                max={32}
                step={1}
                unit="px"
                onChange={(v) => setConfig((prev) => ({ ...prev, fontSize: v }))}
              />
              <Select
                label={t.barcodeCustomizeTextPosition}
                value={config.textPosition ?? 'bottom'}
                options={[
                  { value: 'bottom', label: t.barcodeCustomizeTextPositionBottom },
                  { value: 'top', label: t.barcodeCustomizeTextPositionTop },
                ]}
                onChange={(v) => setConfig((prev) => ({ ...prev, textPosition: v as 'bottom' | 'top' }))}
              />
            </>
          )}
        </Section>
      </CodeCustomizerPanel>
    </div>
  );
}
