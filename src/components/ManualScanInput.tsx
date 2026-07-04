import { useRef, useState } from 'react';
import { ImageUp, X, ClipboardPaste, Check } from 'lucide-react';
import { Button } from './ui/Button';

interface ManualScanInputProps {
  title: string;
  description: string;
  uploadLabel: string;
  changeLabel: string;
  clearLabel: string;
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
  changeLabel,
  clearLabel,
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
  const [used, setUsed] = useState(false);

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
    setUsed(true);
    setTimeout(() => setUsed(false), 1500);
  };

  const clearFile = () => {
    setSelectedFileName(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="border border-border bg-surface p-4 md:p-6 rounded-md flex flex-col gap-5">
      <div>
        <h3 className="font-display text-base font-medium mb-1">{title}</h3>
        <p className="text-sm text-text-soft leading-relaxed">{description}</p>
      </div>

      <div className="flex flex-col gap-2">
        <label className="font-mono text-[11px] uppercase tracking-wider text-text-soft">
          {uploadLabel}
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />
        <div className="flex items-center gap-3 flex-wrap">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            iconLeft={selectedFileName ? <ImageUp className="size-3.5" /> : <ImageUp className="size-3.5" />}
          >
            {selectedFileName ? changeLabel : uploadLabel}
          </Button>
          {selectedFileName && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-soft truncate max-w-48">{selectedFileName}</span>
              <button
                type="button"
                onClick={clearFile}
                className="inline-flex items-center gap-1 text-xs text-text-soft hover:text-error transition-colors"
                aria-label={clearLabel}
              >
                <X className="size-3" aria-hidden="true" />
                {clearLabel}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="manual-paste"
          className="font-mono text-[11px] uppercase tracking-wider text-text-soft flex items-center gap-1.5"
        >
          <ClipboardPaste className="size-3" aria-hidden="true" />
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
            className="flex-1 bg-bg border border-border rounded-md px-3 py-2.5 text-base text-text placeholder:text-text-soft/60 outline-none transition-colors duration-150 focus:border-accent focus:ring-2 focus:ring-accent/20 disabled:opacity-50"
          />
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={handleUseText}
            disabled={disabled || !pasted.trim()}
            iconLeft={used ? <Check className="size-3.5" /> : undefined}
          >
            {used ? 'OK' : useLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
