# qr.crobf.tech

Privacy-first QR code and barcode generator/scanner. Everything runs client-side — no backend, no database, no tracking.

**[qr.crobf.tech](https://qr.crobf.tech)**

## Features

- **QR Generator** — customizable QR codes with colors, gradients, dot shapes, and logos. Export as PNG, SVG, or JPEG.
- **QR Scanner** — read QR codes with your device camera, instantly and locally.
- **Barcode Generator** — standard barcodes (EAN, UPC, CODE128, CODE39, ITF14, MSI, pharmacode).
- **Barcode Scanner** — scan barcodes with your camera.
- **Bilingual** — English and Spanish with full SEO (hreflang, Open Graph, JSON-LD).
- **Dark mode** — auto-detected via `prefers-color-scheme`, persisted in `localStorage`.

## Tech Stack

| Layer | Technology |
|---|---|
| Language | TypeScript (strict mode) |
| Framework | [Astro 7](https://astro.build) (static output) + React 19 (interactive islands) |
| Styling | Tailwind CSS v4 |
| QR Generation | `qr-code-styling` v1.9 |
| QR Validation | `jsQR` v1.4 |
| QR Scanning | `html5-qrcode` v2.3 |
| Barcode Generation | `JsBarcode` v3.12 |
| Barcode Scanning | `@zxing/library` + `@zxing/browser` |
| Deployment | Vercel (static, with Web Analytics) |

## Project Structure

```
src/
├── components/    # React islands & Astro components
├── hooks/         # Shared React hooks
├── i18n/          # Translations & locale utilities
├── layouts/       # Page layout (SEO, dark mode, fonts)
├── lib/           # QR and barcode generation/scanning logic
├── pages/         # Astro page routes
└── styles/        # Global CSS & Tailwind theme
docs/              # Technical documentation
```

## Routes

| Route | Page |
|---|---|
| `/` | Home (English) |
| `/es/` | Home (Spanish) |
| `/tools/qr` | QR Generator |
| `/tools/barcode` | Barcode Generator |
| `/tools/scan-qr` | QR Scanner |
| `/tools/scan-barcode` | Barcode Scanner |
| `/es/tools/*` | Spanish equivalents |

## Getting Started

Requires **Node.js >= 22.12.0** and **pnpm**.

```bash
pnpm install
pnpm dev        # Start dev server
pnpm build      # Production build
pnpm preview    # Preview built site
```

### Camera in local development

Camera scanning requires a secure context (`https://` or `localhost`). If testing on a phone over LAN (e.g. `http://192.168.x.x:4321`), camera access will be blocked. Use `mkcert` for local HTTPS or a tunnel (`cloudflared`, `ngrok`). See `docs/08-CAMERA-USE.md` for details.

## Verification

```bash
pnpm astro check   # Type-check Astro & TS
pnpm build         # Full production build
```

`astro dev` and `astro build` use different bundling pipelines — a clean dev server doesn't guarantee a passing build.

## Design System

A quiet, technical aesthetic with warm paper tones and terracotta accents. Key tokens:

| Token | Light | Dark |
|---|---|---|
| Background | `#f8f6f1` | `#121210` |
| Surface | `#f2efe8` | `#1c1b19` |
| Text | `#1a1917` | `#f0ede6` |
| Accent (terracotta) | `#c45c3e` | `#d97757` |

Full design system documentation in `docs/02-DESIGN-SYSTEM.md`.

## Documentation

- `docs/01-PROJECT-OVERVIEW.md` — full overview, routes, deps, SEO
- `docs/02-DESIGN-SYSTEM.md` — color palette, typography, components, spacing
- `docs/03-LIBRARY-USAGE.md` — how each library is used, race conditions, fixes
- `docs/04-INTERNATIONALIZATION.md` — i18n architecture
- `docs/05-COMPONENT-ARCHITECTURE.md` — component tree, data flow, state patterns
- `docs/06-COMPLETE-COPYWRITING.md` — all UI strings in English and Spanish
- `docs/07-TYPESCRIPT-CONFIG.md` — compiler options and strictness settings
- `docs/08-CAMERA-USE.md` — camera API reference, mobile quirks, troubleshooting
