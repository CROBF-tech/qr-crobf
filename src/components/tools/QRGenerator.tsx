'use client';

import { useState, useEffect, useRef } from 'react';
import {
  renderQRCodeToDataUrl,
  getQRCodeBlob,
  downloadQRCode,
  copyQRCodeToClipboard,
  type QRGeneratorOptions,
  type DotType,
  type CornerSquareType,
  type CornerDotType,
  type ErrorCorrectionLevel,
} from '../../lib/qr-tools';
import { validateQRCode } from '../../lib/qr-tools/validate';
import { getTranslations, type Locale } from '../../i18n/utils';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CodeCustomizerPanel } from '../customizer/CodeCustomizerPanel';
import { Section } from '../customizer/Section';
import { ColorInput } from '../customizer/ColorInput';
import { Select } from '../customizer/Select';
import { Slider } from '../customizer/Slider';
import { FileUpload } from '../customizer/FileUpload';
import { Toggle } from '../customizer/Toggle';
import { GradientBuilder } from '../customizer/GradientBuilder';

interface Props {
  locale?: Locale;
}

const DOT_TYPES: { value: string; label: string }[] = [
  { value: 'square', label: 'Square' },
  { value: 'dots', label: 'Dots' },
  { value: 'rounded', label: 'Rounded' },
  { value: 'classy', label: 'Classy' },
  { value: 'classy-rounded', label: 'Classy Rounded' },
  { value: 'extra-rounded', label: 'Extra Rounded' },
];

const ERROR_CORRECTION: { value: string; label: string }[] = [
  { value: 'L', label: 'L (7%)' },
  { value: 'M', label: 'M (15%)' },
  { value: 'Q', label: 'Q (25%)' },
  { value: 'H', label: 'H (30%)' },
];

export function QRGenerator({ locale = 'en' }: Props) {
  const t = getTranslations(locale);

  const [text, setText] = useState('');
  const [dataUrl, setDataUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationWarning, setValidationWarning] = useState<string | null>(null);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'jpeg'>('png');

  // QR config
  const [dotsColor, setDotsColor] = useState('#1a1917');
  const [dotsType, setDotsType] = useState<DotType>('square');
  const [dotsGradientEnabled, setDotsGradientEnabled] = useState(false);
  const [dotsGradientType, setDotsGradientType] = useState<'linear' | 'radial'>('linear');
  const [dotsGradientRotation, setDotsGradientRotation] = useState(0);
  const [dotsGradientStops, setDotsGradientStops] = useState([
    { offset: 0, color: '#c45c3e' },
    { offset: 100, color: '#3d5a5b' },
  ]);

  const [errorCorrection, setErrorCorrection] = useState<ErrorCorrectionLevel>('M');
  const [qrSize, setQrSize] = useState(300);
  const [margin, setMargin] = useState(2);

  const [cornerSquareColor, setCornerSquareColor] = useState('#1a1917');
  const [cornerSquareType, setCornerSquareType] = useState<CornerSquareType>('square');
  const [cornerSquareGradientEnabled, setCornerSquareGradientEnabled] = useState(false);
  const [cornerSquareGradientType, setCornerSquareGradientType] = useState<'linear' | 'radial'>('linear');
  const [cornerSquareGradientRotation, setCornerSquareGradientRotation] = useState(0);
  const [cornerSquareGradientStops, setCornerSquareGradientStops] = useState([
    { offset: 0, color: '#c45c3e' },
    { offset: 100, color: '#3d5a5b' },
  ]);

  const [cornerDotColor, setCornerDotColor] = useState('#1a1917');
  const [cornerDotType, setCornerDotType] = useState<CornerDotType>('square');

  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [backgroundGradientEnabled, setBackgroundGradientEnabled] = useState(false);
  const [backgroundGradientType, setBackgroundGradientType] = useState<'linear' | 'radial'>('linear');
  const [backgroundGradientRotation, setBackgroundGradientRotation] = useState(0);
  const [backgroundGradientStops, setBackgroundGradientStops] = useState([
    { offset: 0, color: '#ffffff' },
    { offset: 100, color: '#e9c7ba' },
  ]);

  const [logoDataUrl, setLogoDataUrl] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(0.4);
  const [logoMargin, setLogoMargin] = useState(4);
  const [logoHideDots, setLogoHideDots] = useState(true);

  const generateIdRef = useRef(0);

  const buildOptions = (): QRGeneratorOptions => {
    const opts: QRGeneratorOptions = {
      text,
      width: qrSize,
      height: qrSize,
      margin,
      errorCorrectionLevel: errorCorrection,
      dotsColor,
      dotsType,
      cornerSquareColor,
      cornerSquareType,
      cornerDotColor,
      cornerDotType,
      backgroundOptions: { color: backgroundColor },
      image: logoDataUrl || undefined,
      imageOptions: logoDataUrl
        ? { imageSize: logoSize, margin: logoMargin, hideBackgroundDots: logoHideDots }
        : undefined,
    };

    if (dotsGradientEnabled) {
      opts.dotsGradient = {
        type: dotsGradientType,
        rotation: dotsGradientRotation,
        colorStops: dotsGradientStops,
      };
    }
    if (cornerSquareGradientEnabled) {
      opts.cornerSquareGradient = {
        type: cornerSquareGradientType,
        rotation: cornerSquareGradientRotation,
        colorStops: cornerSquareGradientStops,
      };
    }
    if (backgroundGradientEnabled) {
      opts.backgroundOptions = {
        ...opts.backgroundOptions,
        gradient: {
          type: backgroundGradientType,
          rotation: backgroundGradientRotation,
          colorStops: backgroundGradientStops,
        },
      };
    }

    return opts;
  };

  useEffect(() => {
    if (!text) {
      setDataUrl(null);
      setValidationWarning(null);
      return;
    }

    const currentId = ++generateIdRef.current;
    setIsGenerating(true);

    const timer = setTimeout(async () => {
      try {
        const options = buildOptions();
        const url = await renderQRCodeToDataUrl(options);
        if (currentId !== generateIdRef.current) return;

        if (url) {
          setDataUrl(url);
          const result = await validateQRCode(url, text);
          if (!result.valid && currentId === generateIdRef.current) {
            setValidationWarning(t.qrCustomizeValidationWarning);
          } else {
            setValidationWarning(null);
          }
          setError(null);
        } else {
          setError(t.qrGenError);
        }
      } catch {
        if (currentId === generateIdRef.current) {
          setError(t.qrGenError);
        }
      } finally {
        if (currentId === generateIdRef.current) {
          setIsGenerating(false);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    text,
    errorCorrection,
    qrSize,
    margin,
    dotsColor,
    dotsType,
    dotsGradientEnabled,
    dotsGradientType,
    dotsGradientRotation,
    dotsGradientStops,
    cornerSquareColor,
    cornerSquareType,
    cornerSquareGradientEnabled,
    cornerSquareGradientType,
    cornerSquareGradientRotation,
    cornerSquareGradientStops,
    cornerDotColor,
    cornerDotType,
    backgroundColor,
    backgroundGradientEnabled,
    backgroundGradientType,
    backgroundGradientRotation,
    backgroundGradientStops,
    logoDataUrl,
    logoSize,
    logoMargin,
    logoHideDots,
  ]);

  const handleDownload = async () => {
    const options = getCurrentOptions();
    const blob = await getQRCodeBlob(options, exportFormat);
    if (blob) {
      const ext = exportFormat === 'jpeg' ? 'jpg' : exportFormat;
      downloadQRCode(blob, `qr-code.${ext}`);
    }
  };

  const handleCopy = async () => {
    try {
      await copyQRCodeToClipboard(getCurrentOptions());
    } catch (err) {
      console.error('[QRGenerator] Copy to clipboard failed:', err);
    }
  };

  const getCurrentOptions = (): QRGeneratorOptions => ({
    text: text,
    width: qrSize,
    height: qrSize,
    margin,
    errorCorrectionLevel: errorCorrection,
    dotsColor,
    dotsType,
    dotsGradient: dotsGradientEnabled
      ? { type: dotsGradientType, rotation: dotsGradientRotation, colorStops: dotsGradientStops }
      : undefined,
    cornerSquareColor,
    cornerSquareType,
    cornerSquareGradient: cornerSquareGradientEnabled
      ? { type: cornerSquareGradientType, rotation: cornerSquareGradientRotation, colorStops: cornerSquareGradientStops }
      : undefined,
    cornerDotColor,
    cornerDotType,
    backgroundOptions: {
      color: backgroundColor,
      gradient: backgroundGradientEnabled
        ? { type: backgroundGradientType, rotation: backgroundGradientRotation, colorStops: backgroundGradientStops }
        : undefined,
    },
    image: logoDataUrl || undefined,
    imageOptions: logoDataUrl
      ? { imageSize: logoSize, margin: logoMargin, hideBackgroundDots: logoHideDots }
      : undefined,
  });

  // Force minimum Q error correction when logo is present
  const effectiveErrorCorrectionOptions = logoDataUrl
    ? ERROR_CORRECTION.filter((e) => ['Q', 'H'].includes(e.value))
    : ERROR_CORRECTION;

  return (
    <div className="lg:grid lg:grid-cols-[1fr,340px] gap-6">
      {/* Preview area */}
      <div className="flex flex-col items-center gap-4">
        <div className="w-full border border-border bg-surface p-4 md:p-8 flex items-center justify-center min-h-[300px]">
          {text ? (
            isGenerating ? (
              <span className="font-mono text-xs text-text-soft">{t.qrGenLoading}</span>
            ) : dataUrl ? (
              <img src={dataUrl} alt={t.qrGenAlt} className="max-w-full" style={{ width: qrSize, height: qrSize }} />
            ) : error ? (
              <span className="font-mono text-xs text-accent">{error}</span>
            ) : (
              <span className="font-mono text-xs text-text-soft">{t.qrGenEmpty}</span>
            )
          ) : (
            <span className="font-mono text-xs text-text-soft">{t.qrGenEmpty}</span>
          )}
        </div>

        {validationWarning && (
          <div className="w-full bg-accent-soft text-text px-4 py-3 font-mono text-xs">{validationWarning}</div>
        )}

        {dataUrl && (
          <div className="flex items-center gap-3 flex-wrap">
            <Button onClick={handleDownload}>{t.qrGenDownload}</Button>
            <Select
              label=""
              value={exportFormat}
              onChange={(v) => setExportFormat(v as 'png' | 'svg' | 'jpeg')}
              options={[
                { value: 'png', label: t.qrCustomizeFormatPng },
                { value: 'svg', label: t.qrCustomizeFormatSvg },
                { value: 'jpeg', label: t.qrCustomizeFormatJpeg },
              ]}
            />
            <Button variant="secondary" onClick={handleCopy}>
              Copy
            </Button>
          </div>
        )}
      </div>

      {/* Customizer panel */}
      <CodeCustomizerPanel title={t.qrCustomizeTitle}>
        <Section title={t.qrCustomizeSectionData}>
          <Input
            label={t.qrGenLabel}
            placeholder={t.qrGenPlaceholder}
            helper={t.qrGenHelper}
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <Select
            label={t.qrCustomizeErrorCorrection}
            value={errorCorrection}
            onChange={(v) => setErrorCorrection(v as ErrorCorrectionLevel)}
            options={effectiveErrorCorrectionOptions}
          />
          {logoDataUrl && (
            <p className="font-mono text-xs text-accent">{t.qrCustomizeErrorCorrectionLogoHelper}</p>
          )}
          <p className="font-mono text-xs text-text-soft">{t.qrCustomizeErrorCorrectionHelper}</p>
        </Section>

        <Section title={t.qrCustomizeSectionDots}>
          <ColorInput label={t.qrCustomizeDotsColor} value={dotsColor} onChange={setDotsColor} />
          <Select
            label={t.qrCustomizeDotsShape}
            value={dotsType}
            onChange={(v) => setDotsType(v as DotType)}
            options={DOT_TYPES}
          />
          <GradientBuilder
            label={t.qrCustomizeDotsGradient}
            enabled={dotsGradientEnabled}
            onEnabledChange={setDotsGradientEnabled}
            type={dotsGradientType}
            onTypeChange={setDotsGradientType}
            rotation={dotsGradientRotation}
            onRotationChange={setDotsGradientRotation}
            stops={dotsGradientStops}
            onStopsChange={setDotsGradientStops}
          />
        </Section>

        <Section title={t.qrCustomizeSectionCornerSquares}>
          <ColorInput label={t.qrCustomizeCornerSquareColor} value={cornerSquareColor} onChange={setCornerSquareColor} />
          <Select
            label={t.qrCustomizeCornerSquareShape}
            value={cornerSquareType}
            onChange={(v) => setCornerSquareType(v as CornerSquareType)}
            options={DOT_TYPES}
          />
          <GradientBuilder
            label={t.qrCustomizeCornerSquareGradient}
            enabled={cornerSquareGradientEnabled}
            onEnabledChange={setCornerSquareGradientEnabled}
            type={cornerSquareGradientType}
            onTypeChange={setCornerSquareGradientType}
            rotation={cornerSquareGradientRotation}
            onRotationChange={setCornerSquareGradientRotation}
            stops={cornerSquareGradientStops}
            onStopsChange={setCornerSquareGradientStops}
          />
        </Section>

        <Section title={t.qrCustomizeSectionCornerDots}>
          <ColorInput label={t.qrCustomizeCornerDotColor} value={cornerDotColor} onChange={setCornerDotColor} />
          <Select
            label={t.qrCustomizeCornerDotShape}
            value={cornerDotType}
            onChange={(v) => setCornerDotType(v as CornerDotType)}
            options={DOT_TYPES}
          />
        </Section>

        <Section title={t.qrCustomizeSectionBackground}>
          <ColorInput label={t.qrCustomizeBackgroundColor} value={backgroundColor} onChange={setBackgroundColor} />
          <GradientBuilder
            label={t.qrCustomizeBackgroundGradient}
            enabled={backgroundGradientEnabled}
            onEnabledChange={setBackgroundGradientEnabled}
            type={backgroundGradientType}
            onTypeChange={setBackgroundGradientType}
            rotation={backgroundGradientRotation}
            onRotationChange={setBackgroundGradientRotation}
            stops={backgroundGradientStops}
            onStopsChange={setBackgroundGradientStops}
          />
        </Section>

        <Section title={t.qrCustomizeSectionLogo}>
          <FileUpload
            label={t.qrCustomizeLogoUpload}
            preview={logoDataUrl}
            onChange={setLogoDataUrl}
          />
          {logoDataUrl && (
            <>
              <Slider
                label={t.qrCustomizeLogoSize}
                value={logoSize}
                onChange={setLogoSize}
                min={0.1}
                max={0.8}
                step={0.05}
              />
              <Slider
                label={t.qrCustomizeLogoMargin}
                value={logoMargin}
                onChange={setLogoMargin}
                min={0}
                max={20}
              />
              <Toggle
                label={t.qrCustomizeLogoHideDots}
                checked={logoHideDots}
                onChange={setLogoHideDots}
              />
            </>
          )}
        </Section>

        <Section title={t.qrCustomizeSectionSize}>
          <Slider
            label={t.qrCustomizeQRSize}
            value={qrSize}
            onChange={setQrSize}
            min={100}
            max={600}
            step={10}
            unit="px"
          />
          <Slider
            label={t.qrCustomizeMargin}
            value={margin}
            onChange={setMargin}
            min={0}
            max={20}
          />
        </Section>
      </CodeCustomizerPanel>
    </div>
  );
}
