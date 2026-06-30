import { useId, useRef } from 'react';

interface FileUploadProps {
  label: string;
  accept?: string;
  onChange: (file: File | null) => void;
  previewUrl?: string;
  onClear?: () => void;
}

export function FileUpload({ label, accept = 'image/*', onChange, previewUrl, onClear }: FileUploadProps) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="font-mono text-xs uppercase tracking-wider text-text-soft">
        {label}
      </label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        className="hidden"
      />
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="border border-border bg-bg px-3 py-2 font-mono text-xs uppercase tracking-wider text-text transition-colors hover:border-accent hover:text-accent"
        >
          {previewUrl ? 'Change' : 'Upload'}
        </button>
        {previewUrl && onClear && (
          <button
            type="button"
            onClick={onClear}
            className="border border-border bg-bg px-3 py-2 font-mono text-xs uppercase tracking-wider text-text-soft transition-colors hover:border-accent hover:text-accent"
          >
            Clear
          </button>
        )}
      </div>
      {previewUrl && (
        <img
          src={previewUrl}
          alt="Preview"
          className="h-16 w-16 border border-border object-contain"
        />
      )}
    </div>
  );
}
