# Designing for the registry

A guide for designers building a design system that flows cleanly into the
`@scottmallin/*` packages. Read this before you draw the first component.

## The one idea

**The design leads. The registry ratifies. The lint keeps them honest.**

You are free to invent any colour, any spacing, any type ramp, any new
component you like — that is what designing *is*. Nothing in these packages
tells you what your system should look like. What the packages give you is a
place to **write your decisions down once** so that types and lint rules can
hold the code to them automatically.

So the job is not "obey the tokens that already exist." The job is: **make your
Figma file shaped like the contract, so your decisions can be ingested without
translation loss.** A new blue is not a violation. An *un-named* blue is.

## The three artifacts (and who owns each)

| Artifact | Lives in | Owns | Analogy |
|---|---|---|---|
| **Design tokens** | `packages/tokens` | Every raw value — the *only* place a hex/px literal is allowed | Your paint |
| **The registry** | `packages/core/registry/registry.json` | The component contract: names, props, enum sets, slots, a11y | Your grammar |
| **The Figma file** | Figma | The proposal — variables + components that *mirror* the two above | Your sketch |

`AGENTS.md` names **two** sources of truth, and which is which matters:
**Figma owns the design *values*** (colour, spacing, type — they flow
Figma → tokens → code) and **`registry.json` owns the component *contract***
(which components exist and what props they take). Neither is a cage on what you
may propose — both just *record* your decisions so types and lint can enforce
them. The arrow always runs **design → code**: you decide in Figma, those
decisions are ingested into the token pipeline and `registry.json`, and from
there the code is governed.

## Rule 1 — Mirror the token structure in Figma variables

The code consumes tokens by **semantic name**, not by value:

```
registry/tokens  →  --ds-color-action-primary-bg  →  Tailwind util  bg-action-primary
```

So name your Figma variables the same way the tokens are named. Match the
*shape*, not necessarily today's values:

| Do this (semantic, matches tokens) | Not this (per-component, opaque to code) |
|---|---|
| `color/action/primary/bg` | `button/primary/background` |
| `color/surface/raised` | `card/background` |
| `color/text/default` | `heading-colour` |
| `spacing/control/lg` | `button/padding-right` |
| `radius/control` | `button/corner` |

When the names line up, `get_variable_defs` hands the code generator token
names it already implements, and the output is real utilities. When they don't,
the generator falls back to raw hex and you get lint failures downstream.

## Rule 2 — Themes are Figma variable *modes*

The tokens ship multiple themes as modes on each value (the repo's `nova` /
`ember` are **demo modes** — you'll replace them with your own). Build the same
modes into your Figma variable collection. One variable,
`color/surface/raised`, with a value per mode — never two separate variables
`surface-dark` / `surface-light`. That is how a single design maps to a
themeable, multi-brand implementation instead of a hard-coded one.

## Rule 3 — Component props must equal registry props

A Figma component's **properties and their enum values are a contract**. The
lint rule `registry/registry-only-props` rejects any prop or out-of-range enum
the registry doesn't declare, and the generated `*Props` types make the
compiler do the same. So a Figma property called `colour: Default | Secondary`
can't bind to a registry `variant: primary | secondary | danger` — the names
have to match for the mapping to be lossless.

For every component you draw:
- **Property name = registry prop name** (`variant`, `size`, `disabled`).
- **Enum values = the registry's `allowedValues`**, spelled identically.
- Model states that are props as **variant properties**, not detached copies
  (e.g. `disabled`, `invalid`).
- Build padding/radius/colour off the variables from Rules 1–2 so the component
  sits on the token scale — never type a one-off `48px` into one instance.

If you need a value or a variant the registry doesn't have yet, that's fine —
it just means the registry needs an entry. Which is Rule 4.

## Rule 4 — New things go into the registry *first*

Inventing a component or a variant is normal. The workflow to keep it governed:

1. Add the component / prop / enum value to `registry.json`.
2. Regenerate types: `pnpm --filter @scottmallin/core build`.
3. Implement the SFC against the generated `*Props` type, styled with
   token-backed utilities only.
4. In Figma, the component now has a contract to mirror.

Skipping step 1 is the only real mistake — an ungoverned component is one the
types and lint can't protect. A *new* one is expected.

## Rule 5 — Bind Figma to code with Code Connect

Once names line up, add a Code Connect mapping per component so Figma points at
the real SFC (`Button` → `packages/vue/src/components/Button.vue`) with its prop
mappings. This is the payoff: pulling a frame then emits
`<Button variant="secondary" size="lg">Dismiss</Button>` against your actual
component, instead of re-deriving markup (and re-introducing raw hex) every
time. (Requires a Figma Dev/Full seat.)

## The greenfield workflow (new system, nothing exists yet)

You are *not* expected to start from the demo palette. Start from your design:

1. **Design freely in Figma.** Pick your palette, spacing, type, components.
2. **Extract the primitives.** Promote your raw choices into a Figma variable
   collection using the semantic naming from Rule 1, with a mode per theme.
3. **Export, don't hand-copy.** The token pipeline is *Figma Variables → Tokens
   Studio → Style Dictionary*. Export your variables as a DTCG file and drop it
   straight into `packages/tokens/src/tokens/` — the build ingests a raw Figma
   export unchanged (OKLCH, dimensions, aliases, per-mode theming). Then encode
   each component's props as entries in `registry.json`. That is the one-time
   step that turns a mockup into a governed system. The `nova`/`ember` values in
   the repo are demo data — replace them wholesale.
4. **Generate + implement.** Build the types, implement the SFCs.
5. **Govern from here on.** Now lint and types hold the code to your system, and
   every future change starts by editing `registry.json` / tokens.

The demo tokens (`nova`/`ember`, `#3B5BDB`, etc.) are an *example* of a
populated system, not a required starting point. Replace them wholesale.

## Anti-patterns checklist

- [ ] Figma variables named per-component (`button/bg`) instead of semantic
      (`color/action/primary/bg`).
- [ ] One-off literal values typed into a single instance (`pr-48`, `#0048fd`)
      instead of bound variables — becomes `no-arbitrary-tailwind` /
      `no-raw-hex-color` failures.
- [ ] Component property names/enums that don't match registry props — becomes
      `registry-only-props` failures.
- [ ] Separate light/dark variables instead of modes on one variable.
- [ ] A new component drawn in Figma with no matching `registry.json` entry.
- [ ] Colours living anywhere other than `packages/tokens`.

If every box is unchecked, your design ingests into the packages with zero
translation loss — which is the whole point of the registry.

## See also

- [`AGENTS.md`](../AGENTS.md) — the canonical, tool-agnostic agent contract,
  including the "two sources of truth" rule this guide is built on.
- [`packages/tokens/README.md`](../packages/tokens/README.md) — the token
  pipeline in detail (DTCG, OKLCH, per-mode theming, the raw-Figma-export
  drop-in).
