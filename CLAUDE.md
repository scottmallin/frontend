# CLAUDE.md

Guidance for Claude Code (and other agents) working in this repository.

## What this repo is

A small, registry-governed Vue/Nuxt design system. The defining idea: a single
declarative **registry** governs both what lints and what types, so an AI agent editing
components has a machine-checked contract to work against instead of freehanding markup.

## The one rule that matters

**`packages/core/registry/registry.json` is the source of truth.** Change it first, then
let the generated types and the lint rules keep everything in line.

```
registry.json ──┬──▶ eslint-plugin-registry   (author-time enforcement, incl. enum values)
                └──▶ generated/registry-types  (compile-time ButtonProps, InputProps, …)
```

`packages/core/src/generated/registry-types.ts` is **generated** — never edit it by hand.
Regenerate with `pnpm --filter @scottmallin/core build`.

## Workflow for a component change

1. Edit `registry.json` (add the prop / enum value / component).
2. Implement the SFC in `packages/vue/src/components`, typing props with the generated
   `*Props` type. Style with token-backed utilities only.
3. Render it in `apps/playground` if it's new.
4. Run the checks below.

## Commands

```bash
pnpm install                 # Node 26 (see .nvmrc / volta pin)
pnpm build                   # tokens → core (codegen + tsc) → vue (vue-tsc) → nuxt → playground
pnpm lint                    # registry governance rules over packages/** and apps/**
pnpm lint:expect-violations  # asserts examples/bad still correctly FAILS (green = rules work)
pnpm --filter @scottmallin/eslint-plugin-registry test   # RuleTester specs
pnpm dev                     # run the playground
```

## Non-negotiables (all CI-enforced)

- No raw hex outside `packages/tokens` (`registry/no-raw-hex-color`).
- No arbitrary Tailwind values like `p-[13px]` (`registry/no-arbitrary-tailwind`).
- No unregistered props or out-of-range enum values on registered components
  (`registry/registry-only-props`).

If you're tempted to hardcode a colour or pass an unregistered prop: add it to the token
set or the registry instead. That is the whole point of the system.

## What NOT to do

- Don't hand-edit `src/generated/**`.
- Don't "fix" `examples/bad/**` — those files fail on purpose and a CI job asserts it.
- Don't reach for `style="…"` colours or `class="bg-[#…]"` to move fast; it won't pass.
