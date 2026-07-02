# qr.crobf.tech — Project Overview

## What is it?

A privacy-first, client-side web application for generating and scanning QR codes and barcodes. Everything runs in the browser — no backend, no database, no tracking, no server.

## URL

https://qr.crobf.tech

## Core Features

- **QR Generator** — Turn links, text, phone numbers, emails, or Wi-Fi details into custom QR codes with colors, gradients, dot shapes, and logos.
- **QR Scanner** — Read QR codes with the device camera, instantly and locally.
- **Barcode Generator** — Create standard barcodes (EAN, UPC, CODE128, CODE39, ITF14, MSI, pharmacode).
- **Barcode Scanner** — Scan barcodes with the device camera.

## Key Selling Points

- Private by design — no backend, no database, no analytics
- Free and unlimited — no paywalls, no caps, no registration
- Export ready — PNG, SVG, JPEG
- Highly customizable — colors, gradients, logos, shapes, sizes
- Bilingual — English and Spanish with proper SEO

## Tech Stack (standalone)

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (strict mode) |
| Framework | Astro 5 (static site) + React 18 (interactive islands) |
| Styling | Tailwind CSS v4 |
| QR Generation | `qr-code-styling` v1.9.2 |
| QR Validation | `jsQR` v1.4.0 |
| QR Scanning | `html5-qrcode` v2.3.8 |
| Barcode Generation | `JsBarcode` v3.11.5 |
| Barcode Scanning | `@zxing/library` v0.21.0 |
| Deployment | Vercel (static output, with Web Analytics) |
| Fonts | Google Fonts (Space Grotesk, Inter, JetBrains Mono) |

## Project Structure (non-monorepo equivalent)

```
project-root/
├── public/
│   └── og-image.png
├── src/
│   ├── components/
│   │   ├── customizer/
│   │   │   ├── CodeCustomizerPanel.tsx
│   │   │   ├── ColorInput.tsx
│   │   │   ├── FileUpload.tsx
│   │   │   ├── GradientBuilder.tsx
│   │   │   ├── Section.tsx
│   │   │   ├── Select.tsx
│   │   │   ├── Slider.tsx
│   │   │   └── Toggle.tsx
│   │   ├── tools/
│   │   │   ├── QRGenerator.tsx
│   │   │   ├── QRScanner.tsx
│   │   │   ├── BarcodeGenerator.tsx
│   │   │   └── BarcodeScanner.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Input.tsx
│   │       ├── LanguagePicker.astro
│   │       ├── ThemeToggle.astro
│   │       └── ToolCard.astro
│   ├── hooks/
│   │   └── useDebounce.ts
│   ├── i18n/
│   │   ├── translations.ts
│   │   └── utils.ts
│   ├── layouts/
│   │   └── Layout.astro
│   ├── lib/          (formerly packages code)
│   │   ├── qr-tools/
│   │   │   ├── generator.ts
│   │   │   ├── scanner.ts
│   │   │   └── types/
│   │   │       └── jsqr.d.ts
│   │   └── barcode-tools/
│   │       ├── generator.ts
│   │       ├── scanner.ts
│   │       └── types.ts
│   ├── pages/
│   │   ├── index.astro
│   │   ├── es/
│   │   │   ├── index.astro
│   │   │   └── tools/
│   │   │       ├── qr.astro
│   │   │       ├── barcode.astro
│   │   │       ├── scan-qr.astro
│   │   │       └── scan-barcode.astro
│   │   ├── tools/
│   │   │   ├── qr.astro
│   │   │   ├── barcode.astro
│   │   │   ├── scan-qr.astro
│   │   │   └── scan-barcode.astro
│   │   └── ...
│   └── styles/
│       └── global.css
├── astro.config.mjs
├── tsconfig.json
├── package.json
└── ...
```

## Static Page Routes

| Route | Page | Locale |
|-------|------|--------|
| `/` | Home | English (default) |
| `/es/` | Home | Spanish |
| `/tools/qr` | QR Generator | English |
| `/es/tools/qr` | QR Generator | Spanish |
| `/tools/barcode` | Barcode Generator | English |
| `/es/tools/barcode` | Barcode Generator | Spanish |
| `/tools/scan-qr` | QR Scanner | English |
| `/es/tools/scan-qr` | QR Scanner | Spanish |
| `/tools/scan-barcode` | Barcode Scanner | English |
| `/es/tools/scan-barcode` | Barcode Scanner | Spanish |

## Astro Configuration (astro.config.mjs)

- **Output**: `static` (fully static site, no SSR)
- **Adapter**: `@astrojs/vercel` with Web Analytics enabled
- **Integrations**: `@astrojs/react` (for interactive React islands)
- **Styling plugin**: `@tailwindcss/vite` (Tailwind v4 Vite plugin)
- **i18n**: Astro built-in i18n with `en` as default locale (no prefix), `es` with `/es/` prefix
- **JSX**: Uses `react-jsx` transform
- **Path aliases**: `@/*` maps to `./src/*`

## Required npm Dependencies

```json
{
  "dependencies": {
    "@astrojs/react": "^4.0.0",
    "@astrojs/vercel": "^8.0.0",
    "@tailwindcss/vite": "^4.3.2",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "astro": "^5.0.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "qr-code-styling": "^1.9.2",
    "jsqr": "^1.4.0",
    "html5-qrcode": "^2.3.8",
    "jsbarcode": "^3.11.5",
    "@types/jsbarcode": "^3.11.4",
    "@zxing/library": "^0.21.0",
    "tailwindcss": "^4.3.2",
    "typescript": "^5.3.0"
  }
}
```

## Scripts

```bash
npm run dev          # Start Astro dev server
npm run build        # Build static site to dist/
npm run preview      # Preview the built site
npm run astro        # Astro CLI
npm run check-types  # TypeScript type checking
```

## SEO

- Canonical URLs with hreflang annotations for `en` (x-default), `es`
- JSON-LD structured data (WebSite + WebPage schema)
- Open Graph + Twitter Card meta tags
- Robots meta tags (index/follow by default, noindex option available)
- Unique titles and descriptions per page and locale
