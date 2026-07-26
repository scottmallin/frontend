---
name: figma-audit
description: Audit a Figma design for design-to-code readiness against this repo's registry-governed system. Use when the user shares a Figma design or URL and asks whether it is wired up for code, aligned with the design system, or ready to implement. Judges structural fit only — variable naming, component props vs the registry, Code Connect — and treats a novel palette or component as normal input to ingest, never as a violation and never measured against the demo tokens.
---

# Figma design-to-code audit

Answer one question: **does this design ingest into the `@scottmallin/*` packages with
zero translation loss?** Translation loss comes only from *structural* mismatch between the
Figma file and the contract — never from novel values. Judge shape, not values.

Sort every finding into one of two buckets:

- **Blocker** — a structural mismatch that forces the code generator to freehand markup,
  which then fails `no-raw-hex-color` / `no-arbitrary-tailwind` / `registry-only-props`.
  Fixed in Figma.
- **Ingest work** — a new colour, spacing value, or component. This is the *normal input*
  to the system (design → code; see `AGENTS.md`, "two sources of truth"), not a violation.
  Run it through the pipeline.

**Cardinal rule:** a novel palette or component is expected. Measure the design against the
registry's *structure*, never against the demo `nova`/`ember` token *values* — those are
demo data, not authority. `#0048fd` is not "wrong"; an *unnamed* `#0048fd` is just ingest
work.

## Steps

### 1. Ground in the contract
Read `AGENTS.md` (the two sources of truth), `packages/core/registry/registry.json`
(components, props, `allowedValues`), and `packages/tokens/src/tokens` (the token naming
structure, e.g. `color/action/*/bg`, `spacing/control/*`).

**Done when** you can name every registered component with its props and enum values, and
the shape of the token names.

### 2. Pull the design
Load the figma-design-to-code guidance, then call `get_design_context` on the target node.
Also gather `get_variable_defs` (the Figma variables) and `get_code_connect_map` (binding
status).

**Done when** you hold the node's reference code, its variable definitions, and its Code
Connect status.

### 3. Run the alignment checks
Give every check a verdict — **aligned**, **blocker**, or **ingest work** — each backed by a
specific name or value from the design.

Structural — a fail here is a **blocker**:

- **Variable shape** — Figma variables mirror the semantic token structure
  (`color/action/primary/bg`), not per-component names (`button/primary/background`).
  Per-component names give codegen nothing to map onto `--ds-*`.
- **Themes as modes** — each themed value is one variable carrying a mode per theme, not
  separate `-light` / `-dark` variables.
- **Component contract** — each component's property *names and enum values* equal the
  registry's props and `allowedValues`, spelled identically (`variant` not `colour`;
  `Primary` not `Default`).
- **Bound values** — colour / spacing / radius come from bound variables, not one-off
  literals typed into an instance (a literal predicts a `no-raw-hex-color` /
  `no-arbitrary-tailwind` failure downstream).
- **Code Connect** — a mapping binds each component to its SFC so codegen emits the real
  component instead of re-deriving markup. Note if it is seat-gated rather than absent.

Novelty — a fail here is **ingest work**, never a blocker to scold:

- **Unregistered components** — a Figma component with no `registry.json` entry needs
  adding to the registry first.
- **Novel values** — colours or spacing not yet in tokens need running through the token
  pipeline (Figma Variables → Tokens Studio → DTCG → Style Dictionary).

**Done when** every check has a verdict backed by concrete evidence from the design.

### 4. Report
Produce two separate lists — **Blockers to fix in Figma** and **Ingest work** — each item
naming the specific Figma variable or component and the concrete fix. Lead with the single
highest-leverage move.

**Done when** the two buckets are distinct and no novel value or component is framed as a
violation.
