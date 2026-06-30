import { useId } from 'react';

interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helper?: string;
}

export function Toggle({ label, checked, onChange, helper }: ToggleProps) {
  const id = useId();

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="space-y-1">
        <label htmlFor={id} className="font-mono text-xs uppercase tracking-wider text-text-soft">
          {label}
        </label>
        {helper && <p className="text-xs leading-relaxed text-text-soft">{helper}</p>}
      </div>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-accent"
      />
    </div>
  );
}
