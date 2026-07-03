interface CodeCustomizerPanelProps {
  title: string;
  children: React.ReactNode;
}

export function CodeCustomizerPanel({ title, children }: CodeCustomizerPanelProps) {
  return (
    <div className="border border-border bg-surface overflow-y-auto">
      <div className="p-4 md:p-6 border-b border-border">
        <h3 className="font-display text-sm font-medium">{title}</h3>
      </div>
      <div className="p-4 md:p-6 flex flex-col gap-5">{children}</div>
    </div>
  );
}
