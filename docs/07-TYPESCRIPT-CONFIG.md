# TypeScript Configuration

## Compiler Options

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "Preserve",        // For Astro (uses bundler module resolution)
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "allowJs": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "jsx": "react-jsx",           // For React components
    "lib": ["es2022", "dom", "dom.iterable"],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

## Path Aliases

- `@/*` → `./src/*` — Used in the web app for clean imports

## Key Strictness Settings

- `strict: true` — Full strict mode
- `noUncheckedIndexedAccess: true` — Forces checking for undefined on indexed access
- `noImplicitOverride: true` — Requires `override` keyword when overriding methods
- `verbatimModuleSyntax: true` — TypeScript preserves import/export syntax as-is
