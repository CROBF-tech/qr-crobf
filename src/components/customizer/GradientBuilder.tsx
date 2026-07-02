'use client';

import { useState } from 'react';
import { Toggle } from './Toggle';
import { Select } from './Select';
import { ColorInput } from './ColorInput';
import { Slider } from './Slider';

interface GradientStop {
  offset: number;
  color: string;
}

interface GradientBuilderProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  type: 'linear' | 'radial';
  onTypeChange: (type: 'linear' | 'radial') => void;
  rotation: number;
  onRotationChange: (rotation: number) => void;
  stops: GradientStop[];
  onStopsChange: (stops: GradientStop[]) => void;
  label: string;
}

export function GradientBuilder({
  enabled,
  onEnabledChange,
  type,
  onTypeChange,
  rotation,
  onRotationChange,
  stops,
  onStopsChange,
  label,
}: GradientBuilderProps) {
  const addStop = () => {
    onStopsChange([...stops, { offset: 100, color: '#c45c3e' }]);
  };

  const removeStop = (index: number) => {
    onStopsChange(stops.filter((_, i) => i !== index));
  };

  const updateStop = (index: number, field: 'offset' | 'color', value: number | string) => {
    const updated = [...stops];
    const current = updated[index];
    if (!current) return;
    updated[index] = { ...current, [field]: value };
    onStopsChange(updated);
  };

  return (
    <div className="flex flex-col gap-3">
      <Toggle label={label} checked={enabled} onChange={onEnabledChange} />
      {enabled && (
        <div className="border-l-2 border-border pl-3 flex flex-col gap-3">
          <Select
            label="Type"
            value={type}
            onChange={(v) => onTypeChange(v as 'linear' | 'radial')}
            options={[
              { value: 'linear', label: 'Linear' },
              { value: 'radial', label: 'Radial' },
            ]}
          />
          <Slider
            label="Rotation"
            value={rotation}
            onChange={onRotationChange}
            min={0}
            max={360}
            unit="°"
          />
          {stops.map((stop, i) => (
            <div key={i} className="flex items-end gap-2">
              <Slider
                label={`Stop ${i + 1}`}
                value={stop.offset}
                onChange={(v) => updateStop(i, 'offset', v)}
                min={0}
                max={100}
                unit="%"
              />
              <ColorInput
                label=""
                value={stop.color}
                onChange={(v) => updateStop(i, 'color', v)}
              />
              {stops.length > 1 && (
                <button
                  onClick={() => removeStop(i)}
                  className="font-mono text-xs text-accent hover:text-text pb-1"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addStop}
            className="font-mono text-xs text-text-soft hover:text-text self-start"
          >
            + Add stop
          </button>
        </div>
      )}
    </div>
  );
}
