import type { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  icon?: ReactNode;
}

export function Card({ children, className = '', title, description, icon }: CardProps) {
  return (
    <div
      className={`
        border border-border bg-surface transition-colors duration-200
        ${className}
      `}
    >
      {(title || description || icon) && (
        <div className="border-b border-border px-4 py-4 md:px-6">
          <div className="flex items-start gap-3 md:items-center">
            {icon && <div className="shrink-0 text-accent">{icon}</div>}
            <div className="min-w-0">
              {title && (
                <h3 className="font-display text-lg font-medium leading-tight text-text md:text-xl">
                  {title}
                </h3>
              )}
              {description && (
                <p className="mt-1 text-sm leading-relaxed text-text-soft">{description}</p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}
