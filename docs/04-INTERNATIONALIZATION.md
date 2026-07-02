# Internationalization (i18n)

## Overview

The app supports English (default) and Spanish. English routes have no prefix (`/tools/qr`), Spanish routes are prefixed with `/es/` (`/es/tools/qr`).

## How i18n Works

### Astro Configuration

```javascript
// astro.config.mjs
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'es'],
  routing: {
    prefixDefaultLocale: false,  // English has no prefix
  },
}
```

### Translation Files

All translations are in `src/i18n/translations.ts`. The file exports a `ui` object with all strings in both languages.

### Utilities (`src/i18n/utils.ts`)

```typescript
// Get locale from URL path
getLocaleFromPath(pathname: string): Locale

// Remove locale prefix from path
getPathWithoutLocale(pathname: string): string

// Add locale prefix to path
localizePath(path: string, locale: Locale): string

// Get translations for a locale
getTranslations(locale: Locale): UITranslations
```

### Locale Detection

- Locale is extracted from the first URL segment
- If no valid locale segment, defaults to `en`
- Each page Astro component calls `getLocaleFromPath(Astro.url.pathname)` and passes the locale to React components via props

### React Component Usage

React (island) components receive `locale` as a prop and call `getTranslations(locale)`:

```typescript
// In a React component
import { getTranslations, type Locale } from '../../i18n/utils';

interface Props { locale?: Locale; }

export function MyComponent({ locale = 'en' }: Props) {
  const t = getTranslations(locale);
  return <p>{t.someKey}</p>;
}
```

### Astro Page Templates

In Astro pages, translations are accessed directly:

```typescript
---
const locale = getLocaleFromPath(Astro.url.pathname);
const t = getTranslations(locale);
---
<h1>{t.heroTitle1}</h1>
```

## Translation Structure

The `ui` object has the following top-level groups:

- `brandName`, `brandTagline` — Brand identity
- `siteTitle`, `siteTagline` — SEO metadata
- `backToTools` — Shared navigation
- `hero*` — Homepage hero section
- `benefit*` — Homepage benefit cards
- `directoryTitle`, `directoryDescription`, `toolsAvailable` — Tool directory
- `catGenerate`, `catRead` — Tool categories
- `qrGeneratorTitle`, `qrGeneratorDesc`, etc. — Tool names/descriptions
- `qrPage*`, `barcodePage*`, `qrScannerPage*`, `barcodeScannerPage*` — Page SEO data
- `qrGen*` — QR Generator UI labels
- `qrCustomize*` — QR Customizer UI labels
- `qrScan*` — QR Scanner UI labels
- `barcodeGen*` — Barcode Generator UI labels
- `barcodeCustomize*` — Barcode Customizer UI labels
- `barcodeScan*` — Barcode Scanner UI labels
- `footer*` — Footer text

## Language Picker

- Button with globe icon showing current language name
- Opens a dropdown menu with language options
- Preserves the current page path when switching languages
- Stores preferred language in `localStorage` as `preferred-language`
- Built as an Astro component with inline vanilla JS for interactivity

## SEO per Locale

- Each page has unique `<title>` and `<meta name="description">` per locale
- HTML `<html lang="...">` attribute matches current locale
- hreflang annotations for SEO:
  - `<link rel="alternate" hreflang="en" href="...">`
  - `<link rel="alternate" hreflang="es" href="...">`
  - `<link rel="alternate" hreflang="x-default" href="...">` (points to English)
- Canonical URLs include locale prefix
- Open Graph `og:locale` set to `en_US` or `es_ES`
