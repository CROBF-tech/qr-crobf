import { useId } from 'react';

interface ColorInputProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
  disabled?: boolean;
}

export function ColorInput({ label, color, onChange, disabled }: ColorInputProps) {
  const id = useId();

  return (
    <div className="flex items-center gap-3">
      <input
        id={id}
        type="color"
        value={color}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="h-9 w-9 shrink-0 cursor-pointer border-0 bg-transparent p-0 disabled:cursor-not-allowed disabled:opacity-50"
      />
      <label htmlFor={id} className="font-mono text-xs uppercase tracking-wider text-text-soft">
        {label}
      </label>
    </div>
  );
}
