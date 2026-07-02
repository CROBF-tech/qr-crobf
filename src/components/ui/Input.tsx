'use client';

import type { InputHTMLAttributes } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helper?: string;
}

export function Input({ label, helper, className = '', id, ...props }: InputProps) {
  const inputId = id || props.name;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="font-mono text-xs uppercase tracking-wider text-text-soft">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`bg-bg border border-border focus:border-accent px-3 py-2 text-sm placeholder:text-text-soft/50 outline-none ${className}`}
        {...props}
      />
      {helper && <p className="font-mono text-xs text-text-soft">{helper}</p>}
    </div>
  );
}
