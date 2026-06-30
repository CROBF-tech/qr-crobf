import type { ReactNode } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles =
    'font-mono uppercase tracking-wider transition-all duration-200 inline-flex items-center justify-center gap-2 touch-manipulation';

  const variants = {
    primary:
      'bg-text text-bg hover:bg-accent hover:border-accent border border-text',
    secondary:
      'bg-surface text-text hover:bg-secondary hover:text-bg hover:border-secondary border border-text',
    ghost:
      'bg-transparent text-text hover:bg-accent-soft hover:border-accent border border-border',
  };

  const sizes = {
    sm: 'px-3 py-2 text-[11px]',
    md: 'px-4 py-3 text-xs sm:text-sm',
    lg: 'px-6 py-4 text-sm',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
