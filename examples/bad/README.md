# examples/bad — intentional violations

These `.vue` files are **supposed to fail linting**. They are the live proof that the
governance rules actually reject bad code.

- `RawHex.vue` → `registry/no-raw-hex-color`
- `ArbitraryTailwind.vue` → `registry/no-arbitrary-tailwind`
- `UnregisteredProps.vue` → `registry/registry-only-props`

The root `eslint.config.js` ignores this folder, so `pnpm lint` stays green. Instead:

```bash
pnpm lint:expect-violations
```

runs ESLint over just these files (using `examples/bad/eslint.config.js`) and **asserts
that each rule fires**. A non-zero ESLint result is the *passing* condition — if a rule
silently stops working, this check goes red. CI runs both, so the green pipeline
depends on the governance rules correctly rejecting this code.
