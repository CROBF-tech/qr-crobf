import type { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  children: React.ReactNode;
}

const variantClasses: Record<string, string> = {
  primary:
    'bg-text text-bg hover:bg-accent active:scale-[0.98] disabled:bg-text-soft disabled:text-bg/60',
  secondary:
    'bg-surface text-text border border-border hover:border-text hover:bg-bg disabled:opacity-50',
  ghost:
    'bg-transparent text-text hover:bg-accent-soft disabled:opacity-50',
  danger:
    'bg-error text-bg hover:opacity-90 active:scale-[0.98] disabled:opacity-50',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-2 text-[11px] min-h-9',
  md: 'px-4 py-3 text-xs sm:text-sm min-h-11',
  lg: 'px-6 py-4 text-sm min-h-12',
};

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  iconLeft,
  iconRight,
  disabled,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        font-mono uppercase tracking-wider
        rounded-md
        transition-all duration-150 ease-out
        disabled:cursor-not-allowed
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      ) : iconLeft ? (
        <span className="inline-flex shrink-0" aria-hidden="true">{iconLeft}</span>
      ) : null}
      <span>{children}</span>
      {!loading && iconRight ? (
        <span className="inline-flex shrink-0" aria-hidden="true">{iconRight}</span>
      ) : null}
    </button>
  );
}
