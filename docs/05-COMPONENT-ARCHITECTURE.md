# Component Architecture

## Layout

### `Layout.astro` (Global Layout)

- Imports `global.css`
- Sets up HTML structure with `<html lang={locale}>`
- Includes SEO meta tags (canonical, hreflang, Open Graph, Twitter Card)
- Loads Google Fonts (Space Grotesk, Inter, JetBrains Mono)
- Inline anti-flash script for dark mode
- JSON-LD structured data (WebSite + WebPage)
- Header with logo, LanguagePicker, and ThemeToggle
- Main content `<slot />`
- Footer with brand and tagline
- `min-h-screen bg-bg text-text transition-colors duration-200`

## Page Components (Astro)

Each page follows the same pattern:
1. Import Layout, relevant React component, and i18n utils
2. Extract locale from URL
3. Get translations
4. Wrap page content in `<Layout>` with page-specific title/description
5. Page header with breadcrumb, title, description, and "back to tools" link
6. Main area with the React component (using `client:load` directive)

## React Interactive Components

All interactive components use `'use client'` directive and are loaded with `client:load` in Astro.

### Tools Layer

| Component | Props | State | Key Libraries |
|-----------|-------|-------|---------------|
| `QRGenerator` | `locale?` | text, config, dataUrl, validation, isGenerating, exportFormat | `@crobf/qr-tools`, `jsqr` |
| `QRScannerComponent` | `locale?` | isScanning, result, copied, error | `@crobf/qr-tools` (QRScanner) |
| `BarcodeGenerator` | `locale?` | value, config, error, svgRef, exportFormat | `@crobf/barcode-tools` |
| `BarcodeScannerComponent` | `locale?` | isScanning, result, format, copied, error | `@crobf/barcode-tools` (BarcodeScanner) |

### Customizer Components

| Component | Description |
|-----------|-------------|
| `CodeCustomizerPanel` | Collapsible side panel with scrollable content area |
| `Section` | Grouped section within customizer with title and bottom border |
| `ColorInput` | Native color picker with label |
| `GradientBuilder` | Toggle + type selector + dynamic color stops |
| `Select` | Styled dropdown matching design system |
| `Slider` | Range slider with label and current value display |
| `Toggle` | Checkbox toggle with label |
| `FileUpload` | Hidden file input with styled button and preview |

### UI Components

| Component | Description |
|-----------|-------------|
| `Button` | 3 variants (primary, secondary, ghost), 3 sizes (sm, md, lg) |
| `Card` | Surface card with optional header (icon, title, description) |
| `Input` | Text input with label and helper |
| `LanguagePicker` | Dropdown language selector (vanilla JS) |
| `ThemeToggle` | Dark/light mode toggle (vanilla JS) |
| `ToolCard` | Tool directory card with category, icon, title, description |

## Data Flow

```
Astro Page
  └── reads locale from URL
  └── gets translations
  └── renders Layout + React component with locale prop
        └── React component calls getTranslations(locale)
        └── React component manages its own state
        └── React component imports from lib/ (qr-tools, barcode-tools)
        └── Debounce config changes via useDebounce
        └── Renders preview and customizer panel
```

## Key State Patterns

- **Debounced configuration**: Generator config is debounced before triggering re-renders (300ms for QR, 200ms for barcode)
- **Auto-stop on scan**: Both scanners stop automatically after first successful scan
- **Cleanup**: Both scanners stop in `useEffect` return cleanup function
- **Validation**: QR codes are validated by re-decoding with jsQR; barcodes validate input format before rendering
- **Image upload**: QR logo is read as base64 data URL via FileReader
