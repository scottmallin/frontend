# @scottmallin/nuxt

A thin Nuxt module that wires the design system into an app in one line.

```ts
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@scottmallin/nuxt'],
})
```

It does three things:

- **Auto-imports** the `@scottmallin/vue` components (`<Button>`, `<Input>`, `<Card>`,
  `<Badge>`, `<Modal>`) — no manual `import` in pages.
- **Registers the token CSS** (`@scottmallin/tokens/css`) globally, so `[data-theme]`
  switching works app-wide.
- **Transpiles** the source SFCs shipped by the Vue package.

Components are registered **unprefixed by default** (configurable via `scottmallin.prefix`)
so tags are the bare registry names — which is what lets the registry ESLint rules
match call-sites. The module is consumed as TypeScript source (Nuxt loads it via jiti).
