import type { ReactNode } from 'react';

interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <div className="space-y-4 border-b border-border pb-5 last:border-0">
      <h4 className="font-display text-sm font-medium text-text">{title}</h4>
      <div className="space-y-4">{children}</div>
    </div>
  );
}
