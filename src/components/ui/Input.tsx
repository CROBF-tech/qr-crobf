import { forwardRef, useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react';

type CommonProps = {
  label: string;
  helperText?: string;
  error?: string | null;
  hideLabel?: boolean;
  optional?: boolean;
  required?: boolean;
};

type InputProps = CommonProps & InputHTMLAttributes<HTMLInputElement>;
type TextareaProps = CommonProps & TextareaHTMLAttributes<HTMLTextAreaElement>;

const baseField =
  'w-full bg-bg border border-border rounded-md px-3 py-2.5 text-base text-text ' +
  'placeholder:text-text-soft/60 outline-none transition-colors duration-150 ' +
  'focus:border-accent focus:ring-2 focus:ring-accent/20 ' +
  'disabled:opacity-50 disabled:cursor-not-allowed';

const errorField =
  'border-error focus:border-error focus:ring-error/20';

const labelBase =
  'block font-mono text-[11px] uppercase tracking-wider text-text-soft mb-1.5';

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, helperText, error, hideLabel, optional, required, className = '', id, ...props },
  ref
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className={labelBase} data-sr-only={hideLabel ? '' : undefined}>
        {label}
        {required && <span className="text-accent ml-1" aria-hidden="true">*</span>}
        {optional && <span className="text-text-soft ml-1 font-normal normal-case">(optional)</span>}
      </label>
      <input
        ref={ref}
        id={inputId}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          [error ? errorId : null, helperText ? helperId : null].filter(Boolean).join(' ') || undefined
        }
        className={`${baseField} ${error ? errorField : ''} ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p id={helperId} className="mt-1.5 text-xs text-text-soft">{helperText}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-error font-mono">
          {error}
        </p>
      )}
    </div>
  );
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, helperText, error, hideLabel, optional, required, className = '', id, rows = 4, ...props },
  ref
) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;

  return (
    <div className="w-full">
      <label htmlFor={inputId} className={labelBase} data-sr-only={hideLabel ? '' : undefined}>
        {label}
        {required && <span className="text-accent ml-1" aria-hidden="true">*</span>}
        {optional && <span className="text-text-soft ml-1 font-normal normal-case">(optional)</span>}
      </label>
      <textarea
        ref={ref}
        id={inputId}
        rows={rows}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={
          [error ? errorId : null, helperText ? helperId : null].filter(Boolean).join(' ') || undefined
        }
        className={`${baseField} resize-y max-h-48 ${error ? errorField : ''} ${className}`}
        {...props}
      />
      {helperText && !error && (
        <p id={helperId} className="mt-1.5 text-xs text-text-soft">{helperText}</p>
      )}
      {error && (
        <p id={errorId} role="alert" className="mt-1.5 text-xs text-error font-mono">
          {error}
        </p>
      )}
    </div>
  );
});
