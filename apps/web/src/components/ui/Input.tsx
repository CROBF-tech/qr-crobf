import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
}

export function Input({ label, helper, className = '', ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="font-mono text-xs uppercase tracking-wider text-text-soft">
          {label}
        </label>
      )}
      <input
        className={`
          w-full border border-border bg-bg px-4 py-3
          text-text placeholder:text-text-soft/50
          focus:border-accent focus:outline-none
          transition-colors
          ${className}
        `}
        {...props}
      />
      {helper && <p className="text-xs leading-relaxed text-text-soft">{helper}</p>}
    </div>
  );
}
