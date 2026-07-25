# @scottmallin/tokens

Design tokens for the **nova** and **ember** demo brands.

In the real system the pipeline is _Figma Variables → Tokens Studio → Style
Dictionary_. This public demo keeps the **Style Dictionary** stage and hand-authors
the source JSON (the Figma/Tokens-Studio export is proprietary and omitted).

## Source

```
src/tokens/
  base/           # brand-agnostic: spacing, radius, shadow
  brands/nova/    # nova colour ramp   (dark theme)
  brands/ember/   # ember colour ramp  (light theme)
```

## Build output

`pnpm --filter @scottmallin/tokens build` produces:

| File | Purpose |
| --- | --- |
| `dist/css/tokens.css` | CSS custom properties, namespaced `--ds-*`. Brand-agnostic tokens on `:root`; **nova** is the default theme (also on `:root`), **ember** is opt-in via `[data-theme="ember"]`. |
| `dist/nativewind/preset.cjs` | A Tailwind v3-shaped preset for React Native / NativeWind. |

Consumers import them by subpath:

```ts
import '@scottmallin/tokens/css'            // web
const preset = require('@scottmallin/tokens/nativewind') // RN
```

## Theming

Web theming is a single attribute flip — the custom properties re-resolve live:

```html
<html data-theme="ember"> … </html>
```

The Tailwind v4 layer (`apps/playground`) adopts these variables with `@theme inline`
so utilities like `bg-action-primary` resolve to the themed value at runtime.

> **NativeWind is a compatibility export only.** The same semantic class names exist
> in RN, but web-style runtime `[data-theme]` swapping is a web concern; the RN side
> would inject the variables through its own provider. This is deliberately **not**
> claimed as runtime parity — see the root README's _Known limitations_.
