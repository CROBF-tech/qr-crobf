interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  disabled?: boolean;
}

export function Slider({ label, value, min, max, step = 1, unit, onChange, disabled }: SliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="font-mono text-xs uppercase tracking-wider text-text-soft">{label}</label>
        <span className="font-mono text-xs text-text-soft">
          {value}
          {unit}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        disabled={disabled}
        className="w-full accent-accent disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  );
}
