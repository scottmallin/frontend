# @scottmallin/tokens

Design tokens for the **nova** and **ember** demo modes, authored in **DTCG**
(Design Tokens Community Group, 2025.10) format and built with **Style Dictionary v5**.

In the real system the pipeline is _Figma Variables → Tokens Studio → Style
Dictionary_. This public demo keeps the Style Dictionary stage and ingests the exact
DTCG shape a Figma export produces.

## Source (DTCG)

```
src/tokens/
  base.tokens.json    # spacing / radius / shadow  (mode-less)
  color.tokens.json   # action / surface / text / feedback / scrim (per-mode)
```

The pipeline (`lib/dtcg.mjs`) understands the parts a raw Figma export uses that plain
Style Dictionary sources don't:

- **`$value` / `$type`** DTCG tokens (`usesDtcg`).
- **OKLCH colour objects** — `{ colorSpace, components:[L,C,H], alpha, hex }` → `oklch(L C H / a)`
  (with `{ hex }` and plain-string fallbacks; the demo authors hex for readability).
- **Dimension objects** — `{ value, unit }` → `0.75rem`.
- **Aliases** — `{spacing.6}`, `{color.primary}` (resolved by Style Dictionary).
- **`$extensions.mode` theming** — per-mode values become `[data-theme]` scopes.

> Drop a raw Figma DTCG export straight into `src/tokens/` and it builds — OKLCH,
> dimensions, aliases and light/dark modes included. The transforms are unit-tested in
> `tests/dtcg.test.mjs`.

## Build output

`pnpm --filter @scottmallin/tokens build` produces:

| File | Purpose |
| --- | --- |
| `dist/css/tokens.css` | CSS custom properties, namespaced `--ds-*`. Mode-less tokens on `:root`; the default mode **nova** on `:root` (and `[data-theme="nova"]`), **ember** on `[data-theme="ember"]`. |
| `dist/nativewind/preset.cjs` | A Tailwind v3-shaped preset for React Native / NativeWind. |

```ts
import '@scottmallin/tokens/css'            // web
const preset = require('@scottmallin/tokens/nativewind') // RN
```

## Theming

A single attribute flip; the custom properties re-resolve live:

```html
<html data-theme="ember"> … </html>
```

The Tailwind v4 layer (`apps/playground`) adopts these variables with `@theme inline`
so utilities like `bg-action-primary` resolve to the current mode's value at runtime.

> **NativeWind is a compatibility export only** — the same semantic class names exist in
> RN, but runtime `[data-theme]` swapping is a web concern. Not claimed as parity (see the
> root README's _Known limitations_).

## Test

```bash
pnpm --filter @scottmallin/tokens test   # node --test, DTCG transform + mode unit tests
```
