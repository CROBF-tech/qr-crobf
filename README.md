# crobf · qr.crobf.tech

Free, unlimited QR codes and barcodes generated entirely in your browser. No backend, no login, no pricing.

## Estructura

```
.
├── apps/
│   └── web/                    # Astro + React frontend
├── packages/
│   ├── typescript-config/      # Configuración TypeScript compartida
│   ├── qr-tools/              # QR: node-qrcode + html5-qrcode
│   └── barcode-tools/         # Barcode: JsBarcode + @zxing/library
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

## Tecnologías

- **Turborepo**: Pipeline de builds con caching
- **TypeScript**: Configuración compartida, imports sin `.js`
- **pnpm**: Workspace monorepo
- **Astro + React**: Frontend estático con componentes interactivos
- **Vercel**: Adaptador de deployment
- **Tailwind v4**: CSS-first configuration

## Scripts

```bash
# Instalar dependencias
pnpm install

# Desarrollo
pnpm dev

# Build
pnpm build

# Type checking
pnpm check-types

# Lint
pnpm lint
```

## Herramientas disponibles

| Herramienta | Package | Librería |
|-------------|---------|----------|
| Generador QR | `@crobf/qr-tools` | `node-qrcode` |
| Lector QR | `@crobf/qr-tools` | `html5-qrcode` |
| Generador Barcode | `@crobf/barcode-tools` | `JsBarcode` |
| Lector Barcode | `@crobf/barcode-tools` | `@zxing/library` |

## Diseño

Estética **minimalista técnica-vintage**:

- Paleta: `#f8f6f1` (papel), `#1a1917` (texto), `#c45c3e` (acento terracota), `#3d5a5b` (verde pizarra)
- Tipografía: Space Grotesk (display), Inter (body), JetBrains Mono (datos)
- Sin sombras, bordes finos, inputs estilo formulario técnico
- Firma visual: scan line animada en el hero

## TypeScript

La configuración usa `module: "Preserve"` y `moduleResolution: "bundler"` para permitir imports sin extensión `.js`.

## Tailwind v4

Configuración completamente en CSS (`apps/web/src/styles/global.css`) usando `@import "tailwindcss"` y `@theme`.
