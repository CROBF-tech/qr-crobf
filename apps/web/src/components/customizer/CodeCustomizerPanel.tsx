import type { ReactNode } from 'react';

interface CodeCustomizerPanelProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function CodeCustomizerPanel({ children, title, className = '' }: CodeCustomizerPanelProps) {
  return (
    <div
      className={`
        flex h-full flex-col border border-border bg-surface
        transition-colors duration-200
        ${className}
      `}
    >
      {title && (
        <div className="border-b border-border px-4 py-4 md:px-6">
          <h3 className="font-display text-base font-medium text-text md:text-lg">{title}</h3>
        </div>
      )}
      <div className="flex-1 space-y-6 overflow-y-auto p-4 md:p-6">{children}</div>
    </div>
  );
}
