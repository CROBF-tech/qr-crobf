import { useRef, useState } from 'react';
import { Button } from './ui/Button';

interface ManualScanInputProps {
  title: string;
  description: string;
  uploadLabel: string;
  pasteLabel: string;
  placeholder: string;
  useLabel: string;
  onImageSelected: (file: File) => void;
  onTextSubmitted: (text: string) => void;
  disabled?: boolean;
}

export function ManualScanInput({
  title,
  description,
  uploadLabel,
  pasteLabel,
  placeholder,
  useLabel,
  onImageSelected,
  onTextSubmitted,
  disabled,
}: ManualScanInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pasted, setPasted] = useState('');
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    onImageSelected(file);
  };

  const handleUseText = () => {
    const trimmed = pasted.trim();
    if (!trimmed) return;
    onTextSubmitted(trimmed);
  };

  const clearFile = () => {
    setSelectedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="border border-border bg-surface p-4 md:p-6 flex flex-col gap-4">
      <div>
        <h3 className="font-display text-lg font-medium mb-1">{title}</h3>
        <p className="text-sm text-text-soft leading-relaxed">{description}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-xs uppercase tracking-wider text-text-soft">{uploadLabel}</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            {uploadLabel}
          </Button>
          {selectedFileName && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-soft truncate max-w-48">{selectedFileName}</span>
              <button
                type="button"
                onClick={clearFile}
                className="text-xs text-accent hover:underline"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="manual-paste" className="font-mono text-xs uppercase tracking-wider text-text-soft">
          {pasteLabel}
        </label>
        <div className="flex gap-2">
          <input
            id="manual-paste"
            type="text"
            value={pasted}
            onChange={(e) => setPasted(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className="flex-1 bg-bg border border-border focus:border-accent px-3 py-2 text-sm placeholder:text-text-soft/50 outline-none"
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleUseText}
            disabled={disabled || !pasted.trim()}
          >
            {useLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
