'use client';

import { useState, useCallback, useEffect, useRef, type FormEvent } from 'react';
import {
  createQRCode,
  getQRCodeBlob,
  downloadQRCode,
  copyQRCodeToClipboard,
  validateQRCode,
  type QRGeneratorOptions,
  type QRValidationResult,
  type QRStyleType,
  type QRCornerSquareType,
  type QRCornerDotType,
  type QRErrorCorrectionLevel,
} from '@crobf/qr-tools';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { CodeCustomizerPanel } from '../customizer/CodeCustomizerPanel';
import { Section } from '../customizer/Section';
import { ColorInput } from '../customizer/ColorInput';
import { GradientBuilder } from '../customizer/GradientBuilder';
import { Select } from '../customizer/Select';
import { Slider } from '../customizer/Slider';
import { FileUpload } from '../customizer/FileUpload';
import { Toggle } from '../customizer/Toggle';
import { useDebounce } from '../../hooks/useDebounce';
import { getTranslations, type Locale } from '../../i18n/utils';

interface QRGeneratorProps {
  locale?: Locale;
}

const dotTypes: QRStyleType[] = [
  'square',
  'dots',
  'rounded',
  'classy',
  'classy-rounded',
  'extra-rounded',
];

const cornerSquareTypes: QRCornerSquareType[] = ['square', 'dot', 'extra-rounded'];
const cornerDotTypes: QRCornerDotType[] = ['dot', 'square', 'extra-rounded'];
const errorLevels: QRErrorCorrectionLevel[] = ['L', 'M', 'Q', 'H'];

function defaultConfig(): QRGeneratorOptions {
  return {
    width: 400,
    height: 400,
    margin: 4,
    type: 'canvas',
    errorCorrectionLevel: 'Q',
    dots: { color: '#1a1917', type: 'square' },
    cornersSquare: { color: '#1a1917', type: 'square' },
    cornersDot: { color: '#1a1917', type: 'square' },
    background: { color: '#f8f6f1' },
  };
}

export function QRGenerator({ locale = 'en' }: QRGeneratorProps) {
  const t = getTranslations(locale);

  const [text, setText] = useState('');
  const [config, setConfig] = useState<QRGeneratorOptions>(defaultConfig);
  const debouncedConfig = useDebounce(config, 250);
  const [, setDataUrl] = useState('');
  const [validation, setValidation] = useState<QRValidationResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'svg' | 'jpeg'>('png');
  const [copySuccess, setCopySuccess] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const qrRef = useRef<ReturnType<typeof createQRCode> | null>(null);

  const hasImage = Boolean(config.image?.src);

  useEffect(() => {
    if (hasImage && config.errorCorrectionLevel !== 'H' && config.errorCorrectionLevel !== 'Q') {
      setConfig((prev) => ({ ...prev, errorCorrectionLevel: 'Q' }));
    }
  }, [hasImage, config.errorCorrectionLevel]);

  useEffect(() => {
    let cancelled = false;

    async function generate() {
      if (!text.trim()) {
        setDataUrl('');
        setValidation(null);
        setIsGenerating(false);
        qrRef.current = null;
        if (previewRef.current) previewRef.current.innerHTML = '';
        return;
      }

      setIsGenerating(true);
      try {
        const qr = createQRCode({ ...debouncedConfig, data: text });
        qrRef.current = qr;

        const blob = await qr.getRawData('png');
        const nextDataUrl = blob ? await blobToDataURL(blob as Blob) : '';
        const result = await validateQRCode(qr, text);

        if (!cancelled) {
          setDataUrl(nextDataUrl);
          setValidation(result);
          if (previewRef.current) {
            previewRef.current.innerHTML = '';
            qr.append(previewRef.current);
          }
        }
      } catch {
        if (!cancelled) {
          setDataUrl('');
          setValidation({
            readable: false,
            warning: 'Could not generate the QR code. Try with less text or simpler styling.',
          });
        }
      } finally {
        if (!cancelled) setIsGenerating(false);
      }
    }

    generate();
    return () => {
      cancelled = true;
    };
  }, [debouncedConfig, text]);

  const handleDownload = useCallback(async () => {
    if (!text.trim() || !qrRef.current) return;
    const blob = await getQRCodeBlob({ ...config, data: text }, exportFormat);
    if (blob) downloadQRCode(blob, `qr-crobf-${Date.now()}.${exportFormat}`);
  }, [config, exportFormat, text]);

  const handleCopy = useCallback(async () => {
    if (!text.trim()) return;
    try {
      await copyQRCodeToClipboard({ ...config, data: text });
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch {
      setCopySuccess(false);
    }
  }, [config, text]);

  const handleImageUpload = useCallback((file: File | null) => {
    if (!file) {
      setConfig((prev) => ({ ...prev, image: undefined }));
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setConfig((prev) => ({
        ...prev,
        image: {
          src: reader.result as string,
          size: 0.35,
          margin: 5,
          hideBackgroundDots: true,
        },
        errorCorrectionLevel: 'H',
      }));
    };
    reader.readAsDataURL(file);
  }, []);

  const updateDots = (patch: Partial<QRGeneratorOptions['dots']>) =>
    setConfig((prev) => ({ ...prev, dots: { ...prev.dots, ...patch } as QRGeneratorOptions['dots'] }));

  const updateCornersSquare = (patch: Partial<QRGeneratorOptions['cornersSquare']>) =>
    setConfig((prev) => ({ ...prev, cornersSquare: { ...prev.cornersSquare, ...patch } as QRGeneratorOptions['cornersSquare'] }));

  const updateCornersDot = (patch: Partial<QRGeneratorOptions['cornersDot']>) =>
    setConfig((prev) => ({ ...prev, cornersDot: { ...prev.cornersDot, ...patch } as QRGeneratorOptions['cornersDot'] }));

  const updateBackground = (patch: Partial<QRGeneratorOptions['background']>) =>
    setConfig((prev) => ({ ...prev, background: { ...prev.background, ...patch } as QRGeneratorOptions['background'] }));

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr,340px]">
      <Card title={t.qrGeneratorTitle} description={t.qrGeneratorDesc}>
        <form
          onSubmit={(e: FormEvent) => e.preventDefault()}
          className="space-y-5"
        >
          <Input
            label={t.qrGenLabel}
            placeholder={t.qrGenPlaceholder}
            value={text}
            onChange={(e) => setText(e.target.value)}
            helper={t.qrGenHelper}
          />

          <div className="border border-border bg-bg p-4 text-center md:p-6">
            <div
              ref={previewRef}
              className="mx-auto flex min-h-[200px] items-center justify-center"
            />
            {!text.trim() && (
              <p className="mt-2 text-sm text-text-soft">{t.qrGenEmpty}</p>
            )}
          </div>

          {validation && !validation.readable && text.trim() && (
            <div className="border border-accent bg-accent/10 px-4 py-3 text-sm text-accent">
              {validation.warning || t.qrCustomizeValidationWarning}
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Select
              label=""
              value={exportFormat}
              options={[
                { value: 'png', label: t.qrCustomizeFormatPng },
                { value: 'jpeg', label: t.qrCustomizeFormatJpeg },
                { value: 'svg', label: t.qrCustomizeFormatSvg },
              ]}
              onChange={(v) => setExportFormat(v as typeof exportFormat)}
            />
            <Button
              onClick={handleDownload}
              disabled={!text.trim() || isGenerating}
              className="w-full"
            >
              {t.qrGenDownload}
            </Button>
            <Button
              variant="secondary"
              onClick={handleCopy}
              disabled={!text.trim() || isGenerating || !navigator.clipboard}
              className="w-full"
            >
              {copySuccess ? t.qrScanCopied : t.qrScanCopy}
            </Button>
          </div>
        </form>
      </Card>

        <CodeCustomizerPanel title={t.qrCustomizeTitle}>
        <Section title={t.qrCustomizeSectionData}>
          <Select
            label={t.qrCustomizeErrorCorrection}
            value={config.errorCorrectionLevel ?? 'Q'}
            options={errorLevels.map((l) => ({ value: l, label: l }))}
            onChange={(v) =>
              setConfig((prev) => ({ ...prev, errorCorrectionLevel: v as QRErrorCorrectionLevel }))
            }
            helper={
              hasImage
                ? t.qrCustomizeErrorCorrectionLogoHelper
                : t.qrCustomizeErrorCorrectionHelper
            }
          />
        </Section>

        <Section title={t.qrCustomizeSectionDots}>
          <ColorInput
            label={t.qrCustomizeDotsColor}
            color={config.dots?.color ?? '#1a1917'}
            onChange={(c) => updateDots({ color: c, gradient: undefined })}
          />
          <GradientBuilder
            label={t.qrCustomizeDotsGradient}
            value={config.dots?.gradient}
            onChange={(g) => updateDots({ gradient: g, color: undefined })}
          />
          <Select
            label={t.qrCustomizeDotsShape}
            value={config.dots?.type ?? 'square'}
            options={dotTypes.map((t) => ({ value: t, label: t }))}
            onChange={(v) => updateDots({ type: v as QRStyleType })}
          />
        </Section>

        <Section title={t.qrCustomizeSectionCornerSquares}>
          <ColorInput
            label={t.qrCustomizeCornerSquareColor}
            color={config.cornersSquare?.color ?? '#1a1917'}
            onChange={(c) => updateCornersSquare({ color: c, gradient: undefined })}
          />
          <GradientBuilder
            label={t.qrCustomizeCornerSquareGradient}
            value={config.cornersSquare?.gradient}
            onChange={(g) => updateCornersSquare({ gradient: g, color: undefined })}
          />
          <Select
            label={t.qrCustomizeCornerSquareShape}
            value={config.cornersSquare?.type ?? 'square'}
            options={cornerSquareTypes.map((t) => ({ value: t, label: t }))}
            onChange={(v) => updateCornersSquare({ type: v as QRCornerSquareType })}
          />
        </Section>

        <Section title={t.qrCustomizeSectionCornerDots}>
          <ColorInput
            label={t.qrCustomizeCornerDotColor}
            color={config.cornersDot?.color ?? '#1a1917'}
            onChange={(c) => updateCornersDot({ color: c, gradient: undefined })}
          />
          <Select
            label={t.qrCustomizeCornerDotShape}
            value={config.cornersDot?.type ?? 'square'}
            options={cornerDotTypes.map((t) => ({ value: t, label: t }))}
            onChange={(v) => updateCornersDot({ type: v as QRCornerDotType })}
          />
        </Section>

        <Section title={t.qrCustomizeSectionBackground}>
          <ColorInput
            label={t.qrCustomizeBackgroundColor}
            color={config.background?.color ?? '#f8f6f1'}
            onChange={(c) => updateBackground({ color: c, gradient: undefined })}
          />
          <GradientBuilder
            label={t.qrCustomizeBackgroundGradient}
            value={config.background?.gradient}
            onChange={(g) => updateBackground({ gradient: g, color: undefined })}
          />
        </Section>

        <Section title={t.qrCustomizeSectionLogo}>
          <FileUpload
            label={t.qrCustomizeLogoUpload}
            accept="image/png,image/jpeg,image/svg+xml"
            onChange={handleImageUpload}
            previewUrl={config.image?.src}
            onClear={() => setConfig((prev) => ({ ...prev, image: undefined }))}
          />
          {hasImage && (
            <>
              <Slider
                label={t.qrCustomizeLogoSize}
                value={config.image?.size ?? 0.35}
                min={0.1}
                max={0.5}
                step={0.05}
                onChange={(v) =>
                  setConfig((prev) => ({
                    ...prev,
                    image: { ...prev.image, size: v } as QRGeneratorOptions['image'],
                  }))
                }
              />
              <Slider
                label={t.qrCustomizeLogoMargin}
                value={config.image?.margin ?? 5}
                min={0}
                max={20}
                step={1}
                unit="px"
                onChange={(v) =>
                  setConfig((prev) => ({
                    ...prev,
                    image: { ...prev.image, margin: v } as QRGeneratorOptions['image'],
                  }))
                }
              />
              <Toggle
                label={t.qrCustomizeLogoHideDots}
                checked={config.image?.hideBackgroundDots ?? true}
                onChange={(checked) =>
                  setConfig((prev) => ({
                    ...prev,
                    image: { ...prev.image, hideBackgroundDots: checked } as QRGeneratorOptions['image'],
                  }))
                }
              />
            </>
          )}
        </Section>

        <Section title={t.qrCustomizeSectionSize}>
          <Slider
            label={t.qrCustomizeQRSize}
            value={config.width ?? 400}
            min={200}
            max={800}
            step={50}
            unit="px"
            onChange={(v) => setConfig((prev) => ({ ...prev, width: v, height: v }))}
          />
          <Slider
            label={t.qrCustomizeMargin}
            value={config.margin ?? 4}
            min={0}
            max={20}
            step={1}
            unit="px"
            onChange={(v) => setConfig((prev) => ({ ...prev, margin: v }))}
          />
        </Section>
      </CodeCustomizerPanel>
    </div>
  );
}

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
