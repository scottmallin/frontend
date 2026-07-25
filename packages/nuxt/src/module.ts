import { addComponent, defineNuxtModule } from '@nuxt/kit'

export interface ModuleOptions {
  /**
   * Prefix for the registered component names. Defaults to '' (no prefix) so the
   * tags are the bare registry names (`<Button>`, `<Card>`, …) — which is what lets
   * the registry ESLint rules match call-sites in consuming apps.
   */
  prefix: string
}

// Kept in lockstep with the registry; each maps to a named export of @scottmallin/vue.
const COMPONENTS = ['Button', 'Input', 'Card', 'Badge', 'Modal'] as const

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: '@scottmallin/nuxt',
    configKey: 'scottmallin',
    compatibility: { nuxt: '>=3.0.0' },
  },
  defaults: { prefix: '' },
  setup(options, nuxt) {
    // Nuxt must transpile the source SFCs shipped by the Vue package.
    nuxt.options.build.transpile.push('@scottmallin/vue')

    // Ship the design tokens as global CSS so [data-theme] switching just works.
    nuxt.options.css.push('@scottmallin/tokens/css')

    for (const name of COMPONENTS) {
      addComponent({
        name: `${options.prefix}${name}`,
        export: name,
        filePath: '@scottmallin/vue',
      })
    }
  },
})
