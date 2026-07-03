interface SectionProps {
  title: string;
  children: React.ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <div className="border-b border-border pb-5 last:border-0">
      <h4 className="font-display text-sm font-medium mb-3">{title}</h4>
      <div className="flex flex-col gap-3">{children}</div>
    </div>
  );
}
