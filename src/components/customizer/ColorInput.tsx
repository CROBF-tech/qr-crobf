'use client';

interface ColorInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

export function ColorInput({ label, value, onChange }: ColorInputProps) {
  return (
    <div className="flex items-center justify-between">
      <label className="font-mono text-xs uppercase tracking-wider text-text-soft">{label}</label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-9 h-9 border border-border cursor-pointer bg-transparent p-0"
      />
    </div>
  );
}
