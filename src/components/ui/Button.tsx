'use client';

import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: ReactNode;
}

const variantClasses: Record<string, string> = {
  primary: 'bg-text text-bg hover:bg-accent',
  secondary: 'bg-surface hover:bg-secondary hover:text-bg',
  ghost: 'bg-transparent hover:bg-accent-soft',
};

const sizeClasses: Record<string, string> = {
  sm: 'px-3 py-2 text-[11px]',
  md: 'px-4 py-3 text-xs sm:text-sm',
  lg: 'px-6 py-4 text-sm',
};

export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`font-mono uppercase tracking-wider transition-all duration-200 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
