# AGENTS.md

Project: `qr.crobf.tech` — Astro + React QR/barcode tool. Single-project repo, no monorepo.

## Development

`astro dev` detecta automáticamente cuando lo corre un agente de IA y arranca en background por sí solo — no hace falta pasar `--background` explícitamente en la mayoría de los casos, aunque hacerlo no molesta y deja la intención clara:

```bash
pnpm astro dev --background
```

Gestioná el servidor en background:

```bash
pnpm astro dev status         # chequea si está corriendo y en qué puerto
pnpm astro dev logs           # ver logs acumulados
pnpm astro dev logs --follow  # (-f) seguir logs en vivo, tipo tail -f
pnpm astro dev stop           # apagarlo
```

Para desactivar el modo background por completo (poco común), seteá `ASTRO_DEV_BACKGROUND=0` antes de correr `astro dev`.

**Siempre corré `pnpm astro dev status` antes de arrancar un servidor nuevo** — puede que ya haya uno corriendo de una sesión anterior en el puerto que esperás, y levantar uno segundo desperdicia el puerto y mezcla los logs.

## Build & Verify

Antes de dar una tarea por terminada:

```bash
pnpm astro check   # type-check de archivos .astro + referencias de proyecto TS
pnpm build         # build de producción completo — acá aparecen errores de
                    # SSR/prerender que en dev mode no se ven
```

`astro dev` y `astro build` usan pipelines de bundling distintos (Vite/esbuild vs Rollup) — código que anda perfecto en dev puede romperse en build, sobre todo con dependencias CJS-only o código que asume que existe `document`/`window` fuera de un hook de ciclo de vida del cliente. Un dev server sin errores no es garantía de que el build vaya a pasar.

## Project conventions

- **Package manager: siempre `pnpm`.** Nunca uses `npm install` ni `yarn` — generan un lockfile conflictivo con `pnpm-lock.yaml`. Si por error aparece un `package-lock.json` o `yarn.lock` en el repo, borralo.
- Proyecto único (no monorepo/Turborepo) — los comandos van directo en la raíz, sin flags de workspace como `-C` o `--filter`.
- Deploy: `qr.crobf.tech`, servido por HTTPS — el problema de secure context (cámara bloqueada) solo aplica en desarrollo local por LAN, no en producción.
- Componentes/librerías que tocan `document`/`window` (canvas, `getUserMedia`, decodificadores de QR/barcode) tienen que cargarse dentro de una isla `client:only` o un hook de ciclo de vida (`useEffect`) — nunca en el nivel superior de un `.astro` o el cuerpo de un componente React, o el build estático falla con `document is not defined`.

## Documentation

Astro mantiene un índice de documentación optimizado para LLMs — consultalo primero para cualquier duda específica de Astro, es más liviano y más actualizado que el conocimiento de entrenamiento:

- [Índice de docs para LLMs](https://docs.astro.build/llms.txt) — consultar primero
- [Documentación completa](https://docs.astro.build) — si el índice no tiene el detalle que necesitás

Consultá estas guías antes de trabajar en tareas relacionadas:
- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)