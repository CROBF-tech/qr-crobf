'use client';

import { useState, useEffect, useRef } from 'react';
import {
  createBarcode,
  validateBarcodeValue,
  renderBarcode,
  exportBarcodeAsBlob,
  BARCODE_FORMATS,
  type BarcodeFormat,
} from '../../lib/barcode-tools';
import { getTranslations, type Locale } from '../../i18n/utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../customizer/Select';
import { Section } from '../customizer/Section';
import { ColorInput } from '../customizer/ColorInput';
import { Slider } from '../customizer/Slider';
import { Toggle } from '../customizer/Toggle';
import { CodeCustomizerPanel } from '../customizer/CodeCustomizerPanel';

interface Props {
  locale?: Locale;
}

export function BarcodeGenerator({ locale = 'en' }: Props) {
  const t = getTranslations(locale);

  const [value, setValue] = useState('');
  const [format, setFormat] = useState<BarcodeFormat>('CODE128');
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [inputError, setInputError] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'svg' | 'png'>('svg');

  const [barColor, setBarColor] = useState('#1a1917');
  const [background, setBackground] = useState('#ffffff');
  const [barWidth, setBarWidth] = useState(2);
  const [height, setHeight] = useState(120);
  const [margin, setMargin] = useState(10);
  const [displayValue, setDisplayValue] = useState(true);
  const [fontSize, setFontSize] = useState(18);
  const [textPosition, setTextPosition] = useState<'bottom' | 'top'>('bottom');

  const svgContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!value) {
      setDataUrl(null);
      setInputError(null);
      return;
    }

    const timer = setTimeout(() => {
      if (!validateBarcodeValue(value, format)) {
        setInputError(t.barcodeGenError);
        setDataUrl(null);
        return;
      }

      setInputError(null);

      try {
        const svg = createBarcode(value, {
          value,
          format,
          width: barWidth,
          height,
          margin,
          lineColor: barColor,
          background,
          displayValue,
          fontSize,
          textPosition,
        });
        const url = renderBarcode(svg);
        setDataUrl(url);
      } catch (err) {
        console.error('[BarcodeGenerator]', err);
        setInputError(t.barcodeGenError);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [value, format, barColor, background, barWidth, height, margin, displayValue, fontSize, textPosition]);

  const handleDownload = async () => {
    if (!dataUrl) return;
    const blob = await exportBarcodeAsBlob(createSvgFromUrl(dataUrl), exportFormat);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barcode.${exportFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const createSvgFromUrl = (url: string): SVGElement => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const img = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    img.setAttribute('href', url);
    svg.appendChild(img);
    return svg;
  };

  const formatOptions = BARCODE_FORMATS.map((f) => ({ value: f, label: f }));

  return (
    <div className="lg:grid lg:grid-cols-[1fr,340px] gap-6">
      <div className="flex flex-col items-center gap-4">
        <div
          ref={svgContainerRef}
          className="w-full border border-border bg-surface p-4 md:p-8 flex items-center justify-center min-h-[200px]"
        >
          {dataUrl ? (
            <img src={dataUrl} alt="Barcode" className="max-w-full" />
          ) : inputError ? (
            <span className="font-mono text-xs text-accent">{inputError}</span>
          ) : (
            <span className="font-mono text-xs text-text-soft">{t.qrGenEmpty}</span>
          )}
        </div>

        {dataUrl && (
          <div className="flex items-center gap-3">
            <Button onClick={handleDownload}>{t.barcodeGenDownload}</Button>
            <Select
              label=""
              value={exportFormat}
              onChange={(v) => setExportFormat(v as 'svg' | 'png')}
              options={[
                { value: 'svg', label: t.barcodeCustomizeFormatSvg },
                { value: 'png', label: t.barcodeCustomizeFormatPng },
              ]}
            />
          </div>
        )}
      </div>

      <CodeCustomizerPanel title={t.barcodeCustomizeTitle}>
        <Section title={t.barcodeCustomizeSectionFormat}>
          <Input
            label={t.barcodeGenLabel}
            placeholder={t.barcodeGenPlaceholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          <Select
            label={t.barcodeGenFormatLabel}
            value={format}
            onChange={(v) => setFormat(v as BarcodeFormat)}
            options={formatOptions}
          />
          <p className="font-mono text-xs text-text-soft">{t.barcodeGenFormatHelp}</p>
        </Section>

        <Section title={t.barcodeCustomizeSectionColors}>
          <ColorInput label={t.barcodeCustomizeBarColor} value={barColor} onChange={setBarColor} />
          <ColorInput label={t.barcodeCustomizeBackground} value={background} onChange={setBackground} />
        </Section>

        <Section title={t.barcodeCustomizeSectionDimensions}>
          <Slider label={t.barcodeCustomizeBarWidth} value={barWidth} onChange={setBarWidth} min={1} max={4} unit="px" />
          <Slider label={t.barcodeCustomizeHeight} value={height} onChange={setHeight} min={40} max={300} unit="px" />
          <Slider label={t.barcodeCustomizeMargin} value={margin} onChange={setMargin} min={0} max={40} unit="px" />
        </Section>

        <Section title={t.barcodeCustomizeSectionText}>
          <Toggle label={t.barcodeCustomizeShowValue} checked={displayValue} onChange={setDisplayValue} />
          <Slider label={t.barcodeCustomizeFontSize} value={fontSize} onChange={setFontSize} min={10} max={36} unit="px" />
          <Select
            label={t.barcodeCustomizeTextPosition}
            value={textPosition}
            onChange={(v) => setTextPosition(v as 'bottom' | 'top')}
            options={[
              { value: 'bottom', label: t.barcodeCustomizeTextPositionBottom },
              { value: 'top', label: t.barcodeCustomizeTextPositionTop },
            ]}
          />
        </Section>
      </CodeCustomizerPanel>
    </div>
  );
}
