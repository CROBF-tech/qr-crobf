interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
  helper?: string;
  disabled?: boolean;
}

export function Select({ label, value, options, onChange, helper, disabled }: SelectProps) {
  return (
    <div className="space-y-2">
      <label className="font-mono text-xs uppercase tracking-wider text-text-soft">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full border border-border bg-bg px-3 py-2 text-sm text-text focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {helper && <p className="text-xs leading-relaxed text-text-soft">{helper}</p>}
    </div>
  );
}
