export type BarcodeFormat =
  | 'CODE128'
  | 'CODE39'
  | 'EAN13'
  | 'EAN8'
  | 'UPC'
  | 'ITF14'
  | 'MSI'
  | 'pharmacode';

export interface FormatValidationRule {
  regex: RegExp;
  message: string;
}

export const BARCODE_FORMAT_RULES: Record<BarcodeFormat, FormatValidationRule> = {
  CODE128: { regex: /^[\x00-\x7F]+$/, message: 'Supports ASCII characters.' },
  CODE39: { regex: /^[A-Z0-9\-\.\$\/\+%\s]+$/, message: 'Uppercase letters, numbers, and - . $ / + % only.' },
  EAN13: { regex: /^\d{12,13}$/, message: 'Requires 12 or 13 digits.' },
  EAN8: { regex: /^\d{7,8}$/, message: 'Requires 7 or 8 digits.' },
  UPC: { regex: /^\d{11,12}$/, message: 'Requires 11 or 12 digits.' },
  ITF14: { regex: /^\d{13,14}$/, message: 'Requires 13 or 14 digits.' },
  MSI: { regex: /^\d+$/, message: 'Digits only.' },
  pharmacode: { regex: /^\d+$/, message: 'Digits only.' },
};

export function validateBarcodeValue(value: string, format: BarcodeFormat): { valid: boolean; message?: string } {
  if (!value.trim()) return { valid: false, message: 'Value is required.' };
  const rule = BARCODE_FORMAT_RULES[format];
  if (!rule.regex.test(value)) {
    return { valid: false, message: rule.message };
  }
  return { valid: true };
}
