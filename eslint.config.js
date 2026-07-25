import eslint from '@eslint/js'
import tseslint from 'typescript-eslint'
import pluginVue from 'eslint-plugin-vue'
import registry from '@scottmallin/eslint-plugin-registry'

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/.turbo/**',
      '**/.nuxt/**',
      '**/.output/**',
      '**/node_modules/**',
      // Generated from registry.json at build time — linting it is meaningless.
      'packages/core/src/generated/**',
      // The ESLint plugin self-lints with its own CommonJS-aware config.
      'tooling/**',
      // The intentional-violations fixtures are linted by their OWN config via
      // `pnpm lint:expect-violations`, where a non-zero exit is the passing case.
      // Keeping them out of the main graph is what lets `pnpm lint` stay green.
      'examples/**',
    ],
  },

  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/recommended'],

  // Vue SFCs: use vue-eslint-parser for the template, typescript-eslint for <script>.
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
      },
    },
    rules: {
      // SFC scripts are TypeScript (which already catches undefined references) and
      // use DOM globals + Nuxt auto-imports (useHead, ref, …). no-undef only
      // false-positives here.
      'no-undef': 'off',
      // Design-system primitives are intentionally single-word (Button, Input, …).
      'vue/multi-word-component-names': 'off',
      // Purely stylistic template-formatting rules — out of scope for this repo.
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
    },
  },

  // Registry governance rules. Applied across the component/app surface; the
  // no-raw-hex rule internally exempts packages/tokens (the one place raw hex
  // is legitimate — it's the source of the tokens).
  {
    files: ['packages/**/*.{vue,ts,js}', 'apps/**/*.{vue,ts}'],
    plugins: { registry },
    rules: {
      'registry/no-raw-hex-color': 'error',
      'registry/no-arbitrary-tailwind': 'error',
      'registry/registry-only-props': 'error',
    },
  },

  // Style Dictionary token sources are JSON-driven; the build scripts legitimately
  // reference Node globals.
  {
    files: ['**/*.mjs', '**/scripts/**/*.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
        console: 'readonly',
      },
    },
  },
)
