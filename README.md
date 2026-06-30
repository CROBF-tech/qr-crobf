# qr.crobf.tech

Free, unlimited QR codes and barcodes — generated entirely in your browser. No accounts, no tracking, no server.

qr.crobf.tech is a privacy-first toolkit for creating and reading QR codes and barcodes. Every generation and scan happens locally in the browser. Your data never leaves the device.

## What it does

- **QR Generator** — Turn links, text, phone numbers, emails, or Wi-Fi details into custom QR codes. Change colors, add gradients, pick dot shapes, and place a logo in the center.
- **QR Scanner** — Read any QR code with the camera, instantly and locally.
- **Barcode Generator** — Create standard barcodes for products, books, inventory, and packaging. Supports EAN, UPC, CODE128, CODE39, and more.
- **Barcode Scanner** — Scan barcodes with the camera without uploading anything.

## Highlights

- **Private by design** — No backend, no database, no analytics. Everything runs client-side.
- **Free and unlimited** — No paywalls, no daily caps, no registration.
- **Export ready** — Download codes as high-resolution PNG, scalable SVG, or compact JPEG.
- **Customizable** — Colors, gradients, logos, sizing, and correction levels for QR codes; colors, dimensions, and text for barcodes.
- **Bilingual** — English and Spanish with proper SEO metadata for each locale.

## Tech stack

| Layer | Tool |
|-------|------|
| Monorepo | Turborepo + pnpm workspaces |
| Language | TypeScript |
| Frontend | Astro + React |
| Styling | Tailwind CSS v4 |
| QR generation | `qr-code-styling` + `jsqr` validation |
| QR scanning | `html5-qrcode` |
| Barcode generation | `JsBarcode` |
| Barcode scanning | `@zxing/library` |

## Project structure

```
.
├── apps/
│   └── web/                    # Astro frontend (qr.crobf.tech)
├── packages/
│   ├── qr-tools/               # QR generation, validation, and scanning
│   ├── barcode-tools/          # Barcode generation and scanning
│   └── typescript-config/      # Shared TypeScript configuration
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Scripts

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev

# Build the project
pnpm build

# Type check
pnpm check-types

# Lint
pnpm lint
```

## Design

A quiet, technical aesthetic built around clarity and function:

- Palette: warm paper `#f8f6f1`, near-black `#1a1917`, terracotta `#c45c3e`, slate green `#3d5a5b`
- Typography: Space Grotesk for headings, Inter for body text, JetBrains Mono for data
- Thin borders, generous spacing, and a single animated scan line as the visual signature

## License

MIT — use it, fork it, improve it.
