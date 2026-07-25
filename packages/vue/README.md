# @scottmallin/vue

Vue 3 SFC wrappers around the `@scottmallin/core` primitives.

Two rules hold across every component here, and both are **machine-enforced**:

1. **Props are typed from the registry.** Each component's `defineProps` uses the
   generated `*Props` type from `@scottmallin/core` (e.g. `ButtonProps`). Add a prop
   the registry doesn't declare and the build fails — the same contract the ESLint
   `registry-only-props` rule enforces on template call-sites.

2. **Styling is token-backed Tailwind utilities only.** No hex, no arbitrary
   `[…]` values — colours, radii, spacing and shadow all come through utilities that
   resolve to `--ds-*` custom properties (`bg-action-primary`, `rounded-control`,
   `p-card`, `shadow-overlay`, `bg-scrim`). Theme switching is a `[data-theme]` flip;
   nothing in these files hardcodes a brand.

The package ships source SFCs; the consuming app (see `apps/playground`) runs Tailwind
v4 and generates the utilities from the token `@theme`. `pnpm build` here runs
`vue-tsc`, so a component that violates the registry-generated prop types can't ship.
