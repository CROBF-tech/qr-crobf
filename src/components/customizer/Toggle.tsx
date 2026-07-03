interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  helper?: string;
}

export function Toggle({ label, checked, onChange, helper }: ToggleProps) {
  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="accent-accent"
        />
        <span className="font-mono text-xs uppercase tracking-wider text-text-soft">{label}</span>
      </label>
      {helper && <p className="font-mono text-xs text-text-soft ml-6">{helper}</p>}
    </div>
  );
}
