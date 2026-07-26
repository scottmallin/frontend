# @scottmallin/tokens

## 0.1.1

### Patch Changes

- Maintenance release. No runtime changes to the packages; exercises the automated
  GitHub Actions publish pipeline (publish on GitHub Release, with provenance).

## 0.1.0

### Minor Changes

- Initial public release of the registry-governed design system.

  - `@scottmallin/core` — headless primitives and the component registry (`registry.json`), the single source of truth that drives both lint enforcement and the generated prop types.
  - `@scottmallin/tokens` — DTCG design tokens (nova & ember modes) built to CSS custom properties and a NativeWind-compatible preset.
  - `@scottmallin/vue` — Vue 3 SFC components (Button, Input, Card, Badge, Modal) typed from the registry and styled with token-backed utilities only.
  - `@scottmallin/nuxt` — Nuxt module that auto-imports the Vue components and registers the design-token CSS.

  All four packages share a single version number and are published together.
