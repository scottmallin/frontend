// Standalone flat config for the intentional-violation fixtures.
//
// The ROOT eslint.config.js deliberately ignores examples/**, so `pnpm lint` stays
// green. These files are linted only by `pnpm lint:expect-violations`, which asserts
// they DO trip the governance rules (a non-zero result is the passing case).
import vueParser from 'vue-eslint-parser'
import registry from '@scottmallin/eslint-plugin-registry'

export default [
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      ecmaVersion: 2022,
      sourceType: 'module',
    },
    plugins: { registry },
    rules: {
      'registry/no-raw-hex-color': 'error',
      'registry/no-arbitrary-tailwind': 'error',
      'registry/registry-only-props': 'error',
    },
  },
]
