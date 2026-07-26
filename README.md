# Registry-governed design system — a portfolio case study

A small, self-contained Vue 3 / Nuxt / TypeScript design-system monorepo that
demonstrates one idea properly: **a single component registry that governs both what
the linter enforces and what TypeScript generates**, so humans *and* AI agents build
against a machine-checked contract instead of freehanding markup, colours, and props.

> This is a sanitised portfolio demo built around two **fictional** brands (`nova`,
> `ember`). It mirrors the *architecture* of a private design system I work on, but
> contains none of that system's code, tokens, client names, or component catalogue.

---

## Problem

Design systems rot at the edges. The primitives are fine; the drift happens at the
call-sites — a one-off `#3B5BDB` here, a `class="p-[13px]"` there, a `<Button
variant="ghost">` that was never a real variant. Code review catches some of it. Most of
it ships. And once you add AI agents generating components, the volume of plausible-looking
but off-system markup goes up sharply.

The usual answer is documentation and discipline. This repo's answer is **enforcement from
a single source of truth**: declare the contract once, then make violating it a build
failure — for people and agents alike.

## Architecture

A pnpm + Turborepo monorepo:

| Package | Role |
| --- | --- |
| [`packages/tokens`](packages/tokens) | **DTCG** design tokens (Style Dictionary v5) → CSS custom properties + a NativeWind preset. Ingests OKLCH objects, dimensions, aliases, and `$extensions.mode` theming. Two modes: `nova` (dark), `ember` (light). |
| [`packages/core`](packages/core) | Headless primitives **and the registry** (`registry.json` + schema). Generates prop types from the registry. |
| [`packages/vue`](packages/vue) | Vue 3 SFC wrappers. Props typed from the registry; styling is token-backed Tailwind utilities only. |
| [`packages/nuxt`](packages/nuxt) | Thin Nuxt module that auto-imports the components and registers the token CSS. |
| [`apps/playground`](apps/playground) | Nuxt demo — every component in both themes, live theme toggle. Also the lint target. |
| [`tooling/eslint-plugin-registry`](tooling/eslint-plugin-registry) | The governance layer: three flat-config ESLint rules. |
| [`examples/bad`](examples/bad) | Intentional violations, asserted to fail (see Governance). |

```mermaid
flowchart LR
  T[tokens<br/>Style Dictionary] -->|--ds-* CSS vars| V[vue<br/>SFCs]
  R[registry.json] -->|codegen| TY[generated<br/>prop types]
  TY --> V
  R -->|reads| L[eslint-plugin-registry]
  C[core<br/>headless] --> V
  V --> N[nuxt module] --> P[playground]
  T -->|@theme inline| P
  L -.enforces.-> P
  L -.enforces.-> V
```

### Token flow

Style Dictionary emits namespaced custom properties (`--ds-color-action-primary-bg`),
themed per brand. The playground's Tailwind v4 layer adopts them with `@theme inline`, so
utilities like `bg-action-primary` resolve to the *current* theme's variable. Switching
theme is one attribute flip on `<html>` — nothing re-renders, the variables just re-resolve.

## Governance

Three ESLint rules ([`tooling/eslint-plugin-registry`](tooling/eslint-plugin-registry))
turn the contract into build failures:

- **`registry/no-raw-hex-color`** — no raw hex outside `packages/tokens`.
- **`registry/no-arbitrary-tailwind`** — no Tailwind arbitrary values (`bg-[#…]`, `p-[13px]`).
- **`registry/registry-only-props`** — on registered components, no unregistered props
  **and** no enum values outside `allowedValues`.

### The registry is a single source of truth, not just a lint oracle

`packages/core/registry/registry.json` drives **two** consumers from one file:

1. the ESLint rules above (author-time), and
2. `scripts/generate-types.mjs`, which generates the `*Props` TypeScript interfaces the
   Vue package builds against (compile-time).

So "what is registered", "what lints", and "what TypeScript accepts" cannot drift apart.
Add a prop to a component without adding it to the registry and `vue-tsc` rejects it; pass
an unregistered prop at a call-site and ESLint rejects it.

### The bad examples are a *passing* test

[`examples/bad`](examples/bad) contains files that are supposed to fail linting. Rather
than let them turn CI red, a dedicated check asserts they fail **as expected**:

```bash
pnpm lint:expect-violations
```

A non-zero ESLint result is the passing condition. If a governance rule silently stops
firing, this check goes red. CI runs it alongside a normal green `pnpm lint`, so the
pipeline's green-ness *depends on the rules correctly rejecting bad code*.

### The rules are tested

The template rules use `vue-eslint-parser`'s `defineTemplateBodyVisitor` and are pinned by
ESLint `RuleTester` specs ([`tooling/eslint-plugin-registry/tests`](tooling/eslint-plugin-registry/tests)),
including the fiddly Vue attribute shapes (plain vs `:bound` vs `v-bind` spread vs directives).

## Run it

Requires Node 26 (see [`.nvmrc`](.nvmrc) / the Volta pin) and pnpm.

```bash
pnpm install
pnpm build       # tokens → core (codegen + tsc) → vue (vue-tsc) → nuxt → playground
pnpm lint
pnpm lint:expect-violations
pnpm dev         # open the playground
```

## Outcome

The result is a system where the guard-rails are structural, not aspirational: a new
contributor — or an AI agent following [`CLAUDE.md`](CLAUDE.md) / the
[Cursor rules](.cursor/rules/design-system.mdc) — gets immediate, specific feedback when
they step outside the system, and the same JSON that documents the API is the thing that
enforces it.

## Known limitations

Stated plainly, because "here's what's real vs. aspirational" is more useful to a reviewer
than a repo that implies everything is finished.

1. **`registry-only-props` validates enum values only for *static* literals.**
   `variant="ghost"` and `:variant="'ghost'"` are caught. A **dynamic** binding
   (`:variant="someRef"`) is *not* — its value isn't knowable at lint time, and
   false-positiving on every dynamic binding would be worse than the gap. (Prop-*name*
   checking applies to dynamic bindings; only the value check is skipped.)

2. **`no-arbitrary-tailwind` is a regex heuristic, not a real Tailwind AST parse.**
   It matches the `-[…]` arbitrary-value shape and inspects strings that look like class
   lists. It does not understand variants, `theme()`, config safelists, or `cva`/`clsx`
   composition. A production version would parse the class list properly rather than
   string-match.

3. **The registry drives codegen, but only prop *types*.** `registry.json` → generated
   `*Props` interfaces consumed by the Vue package is wired and runs in `pnpm build`.
   What it does **not** yet do: emit runtime prop validators, generate the components'
   default values or emits, or enforce required-prop *presence* at call-sites (that's
   beyond what the current lint rule checks). Those are natural next steps, not
   done-and-hidden.

4. **NativeWind is a compatibility export, not runtime parity.** The RN preset exposes the
   same semantic class names, but web theming (live `[data-theme]` + CSS custom
   properties) and RN theming are different mechanisms; this repo does not claim runtime
   theme-switching parity on React Native.

## Stack

Vue 3.5 · Nuxt 4 · TypeScript 5 (strict) · Tailwind CSS v4 · Style Dictionary v5 ·
ESLint 10 (flat config) · pnpm + Turborepo · Node 26.

## License

[MIT](LICENSE) © Scott Mallin
