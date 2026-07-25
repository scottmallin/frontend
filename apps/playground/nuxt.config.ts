import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-01',
  devtools: { enabled: false },

  // One line wires in the whole design system (auto-imported components + token CSS).
  modules: ['@scottmallin/nuxt'],

  css: ['~/assets/css/main.css'],

  // Tailwind v4 via its official Vite plugin.
  vite: {
    plugins: [tailwindcss()],
  },
})
