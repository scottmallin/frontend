# @scottmallin/core

Headless primitives + **the component registry**.

## The registry is the source of truth

`registry/registry.json` (validated by `registry/registry.schema.json`) is the single
declaration of every component's public API — props, allowed enum values, slots,
consumed tokens, and a11y contract. It drives **two** things from one file:

1. **Lint enforcement** — `@scottmallin/eslint-plugin-registry` reads it to reject
   unregistered props and out-of-range enum values in templates.
2. **Compile-time types** — `scripts/generate-types.mjs` turns it into
   `src/generated/registry-types.ts` (`ButtonProps`, `InputProps`, …), which the Vue
   package builds against.

Because both come from the same JSON, "what is registered", "what lints", and "what
TypeScript accepts" cannot drift apart.

```
registry/registry.json ──┬──▶ eslint-plugin-registry   (author-time enforcement)
                         └──▶ generated/registry-types  (compile-time prop types)
```

> `src/generated/registry-types.ts` is generated and git-ignored. `pnpm build` (or
> `pnpm --filter @scottmallin/core build`) regenerates it before `tsc` runs.

## Headless helpers

`src/a11y.ts` carries the framework-agnostic behaviour each primitive needs
(`getButtonAttrs`, `getInputAttrs`, `getDialogAttrs`, …). The Vue package spreads
these onto real elements and adds token-backed styling.
