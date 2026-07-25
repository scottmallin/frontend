# @scottmallin/playground

The demo app. It does two jobs:

1. **Shows the system working.** Every component rendered in both brand themes, with a
   live `nova ⇄ ember` toggle that flips `[data-theme]` on `<html>` — no re-render, the
   token-backed utilities just re-resolve.
2. **Is the real lint target.** `pnpm lint` runs the registry governance rules over
   this app's source, so the demo can't drift out of compliance.

## Run it

```bash
pnpm --filter @scottmallin/playground dev   # or: pnpm dev
```

## How the styling is wired

- `@scottmallin/nuxt` injects `@scottmallin/tokens/css` (the `--ds-*` custom properties).
- `app/assets/css/main.css` imports Tailwind v4 and uses `@theme inline` to map semantic
  utilities (`bg-action-primary`, `rounded-control`, `p-card`, …) onto those variables.
- `@source` points Tailwind at the `@scottmallin/vue` source so the utilities used inside
  the library components are generated.

Nothing here hardcodes a colour or an arbitrary Tailwind value — and the lint rules make
sure it stays that way.
