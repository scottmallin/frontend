# @scottmallin/eslint-plugin-registry

The governance layer. Three flat-config rules that make the component registry and
the token layer enforceable at author-time.

| Rule | What it does |
| --- | --- |
| `registry/no-raw-hex-color` | Flags raw hex (`#rgb`/`#rrggbb`) anywhere outside `packages/tokens` (the one legitimate source of raw colour). Checks `<script>`, plain `.ts/.js`, and template attribute values. |
| `registry/no-arbitrary-tailwind` | Flags Tailwind arbitrary-value syntax (`bg-[#…]`, `p-[13px]`). **Regex heuristic** — see limitations. |
| `registry/registry-only-props` | On registered components (`<Button>`, `<Card>`, …), flags props not in `registry.json` **and** enum values outside their `allowedValues`. |

## How the template rules work

Vue template nodes are only visited through
`parserServices.defineTemplateBodyVisitor` — a bare `{ VElement }` visitor never
fires on the template body. Each rule uses it when the file was parsed by
`vue-eslint-parser`, and falls back to a script-only visitor for plain `.ts/.js`.

`registry-only-props` correctly distinguishes attribute shapes:

- plain `variant="primary"` → prop `variant`, static value `"primary"`
- bound `:variant="'primary'"` → prop `variant` (from `key.argument.name`), static `"primary"`
- dynamic `:variant="intent"` → prop `variant`, value **unknowable** → enum check skipped
- `v-if` / `@click` / `v-model` / `v-bind="obj"` / `class` / `data-*` / `aria-*` → **not props**, ignored

All of the above is pinned by `tests/registry-only-props.test.js` (ESLint `RuleTester`).

## Known limitations (also surfaced in the root README)

1. **`no-arbitrary-tailwind` is a regex heuristic**, not a real Tailwind class-list
   AST parse. It doesn't understand variants, `theme()`, or safelists, and only
   inspects strings that look like class lists. A production version would parse
   properly.
2. **Enum validation is static-literal-only.** `variant="ghost"` and
   `:variant="'ghost'"` are caught; `:variant="someRef"` is not — its value isn't
   knowable at lint time, and false-positiving on every dynamic binding would be
   worse than the gap.

## Tests

```bash
pnpm --filter @scottmallin/eslint-plugin-registry test   # node --test + RuleTester
```
