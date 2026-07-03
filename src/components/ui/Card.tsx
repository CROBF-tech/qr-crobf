import type { ReactNode } from 'react';

interface CardProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

export function Card({ title, description, icon, children, className = '' }: CardProps) {
  return (
    <div className={`border border-border bg-surface ${className}`}>
      {(title || icon) && (
        <div className="p-4 md:px-6 md:pt-6 pb-0">
          <div className="flex items-center gap-3">
            {icon && <span className="text-accent">{icon}</span>}
            <div>
              {title && (
                <h3 className="font-display text-lg md:text-xl font-medium leading-tight">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-text-soft mt-1">{description}</p>
              )}
            </div>
          </div>
        </div>
      )}
      <div className="p-4 md:p-6">{children}</div>
    </div>
  );
}
