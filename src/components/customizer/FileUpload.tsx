'use client';

import { useRef } from 'react';
import { Button } from '../ui/Button';

interface FileUploadProps {
  label: string;
  preview?: string | null;
  onChange: (dataUrl: string | null) => void;
}

export function FileUpload({ label, preview, onChange }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  const clear = () => {
    onChange(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="font-mono text-xs uppercase tracking-wider text-text-soft">{label}</label>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFile}
        className="hidden"
      />
      <div className="flex items-center gap-3">
        {preview ? (
          <>
            <img src={preview} alt="Logo preview" className="w-16 h-16 object-contain border border-border bg-bg" />
            <div className="flex flex-col gap-1.5">
              <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
                Change
              </Button>
              <Button variant="ghost" size="sm" onClick={clear}>
                Clear
              </Button>
            </div>
          </>
        ) : (
          <Button variant="secondary" size="sm" onClick={() => inputRef.current?.click()}>
            Upload
          </Button>
        )}
      </div>
    </div>
  );
}
