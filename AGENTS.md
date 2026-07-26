# AGENTS.md

Guidance for coding agents (Claude Code, Cursor, Copilot, and any other) working in this
repository. Tool-agnostic and canonical — `CLAUDE.md` and other tool-specific files just
point here so the guidance never forks.

## What this repo is

A small, registry-governed Vue/Nuxt design system. The defining idea: a single
declarative **registry** governs both what lints and what types, so an AI agent editing
components has a machine-checked contract to work against instead of freehanding markup.

## Two sources of truth — know which governs what

Design **values** and the component **contract** have separate sources of truth, and both
flow one direction: **design → code**. Confusing them is the classic mistake — treating the
checked-in demo tokens as the authority a design must obey. It is the other way around: the
design leads, these artifacts record it.

**1. Figma is the source of truth for design values** (colour, spacing, radius, type):

```
Figma Variables ─▶ Tokens Studio ─▶ DTCG (packages/tokens/src) ─▶ Style Dictionary ─▶ --ds-* vars ─▶ Tailwind utils
```

The `nova`/`ember` values in `packages/tokens/src` are **demo data**, not canonical. A real
consumer replaces them wholesale with their own Figma-generated DTCG export — the pipeline
ingests a raw export unchanged (see `packages/tokens/README.md`). Never treat these sample
values as authority, and never author a colour outside `packages/tokens`.

**2. `registry.json` is the source of truth for the component contract** (which components
exist, and their props/enums). Change it first; the generated types and lint rules follow:

```
registry.json ──┬──▶ eslint-plugin-registry   (author-time enforcement, incl. enum values)
                └──▶ generated/registry-types  (compile-time ButtonProps, InputProps, …)
```

`packages/core/src/generated/registry-types.ts` is **generated** — never edit it by hand.
Regenerate with `pnpm --filter @scottmallin/core build`.

A new palette or a new component is the **normal input**, never a violation: run the values
through the token pipeline and the contract into `registry.json`. Designer-facing setup for
that flow lives in `docs/designing-for-the-registry.md`.

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

## Skills

Reusable, tool-agnostic procedures live in `skills/` (plain `SKILL.md` files any agent can
read). Follow the matching one when its task comes up:

- [`skills/figma-audit`](skills/figma-audit/SKILL.md) — audit a Figma design for
  design-to-code readiness. Sorts findings into structural **blockers** vs **ingest work**
  (a new palette/component is normal input, never a violation).
