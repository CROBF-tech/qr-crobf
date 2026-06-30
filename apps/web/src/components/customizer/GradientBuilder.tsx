import { useId } from 'react';
import type { QRGradientConfig, QRGradientType } from '@crobf/qr-tools';

interface GradientBuilderProps {
  label: string;
  value?: QRGradientConfig;
  onChange: (gradient?: QRGradientConfig) => void;
}

export function GradientBuilder({ label, value, onChange }: GradientBuilderProps) {
  const id = useId();
  const enabled = Boolean(value);

  const stops = value?.colorStops ?? [
    { offset: 0, color: '#1a1917' },
    { offset: 1, color: '#c45c3e' },
  ];

  const toggleGradient = () => {
    if (enabled) {
      onChange(undefined);
    } else {
      onChange({
        type: 'linear',
        rotation: 0,
        colorStops: [
          { offset: 0, color: '#1a1917' },
          { offset: 1, color: '#c45c3e' },
        ],
      });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="font-mono text-xs uppercase tracking-wider text-text-soft">{label}</label>
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            id={id}
            type="checkbox"
            checked={enabled}
            onChange={toggleGradient}
            className="accent-accent"
          />
          <span className="text-xs text-text-soft">Gradient</span>
        </label>
      </div>

      {enabled && (
        <div className="space-y-3 border-l-2 border-border pl-3">
          <select
            value={value?.type ?? 'linear'}
            onChange={(e) =>
              onChange({ ...value, type: e.target.value as QRGradientType, colorStops: stops })
            }
            className="w-full border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none"
          >
            <option value="linear">Linear</option>
            <option value="radial">Radial</option>
          </select>

          {stops.map((stop, index) => (
            <div key={index} className="flex items-center gap-3">
              <input
                type="color"
                value={stop.color}
                onChange={(e) => {
                  const next = [...stops];
                  next[index] = { ...stop, color: e.target.value };
                  onChange({ ...value!, type: value!.type, colorStops: next });
                }}
                className="h-8 w-8 shrink-0 border-0 bg-transparent p-0"
              />
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={stop.offset}
                onChange={(e) => {
                  const next = [...stops];
                  next[index] = { ...stop, offset: Number(e.target.value) };
                  onChange({ ...value!, type: value!.type, colorStops: next });
                }}
                className="w-full accent-accent"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
