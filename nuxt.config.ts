import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  // Componentes shadcn-vue (app/components/ui) são sempre importados
  // explicitamente — evita colisão de nome entre o arquivo do componente e
  // seu index.ts no auto-import do Nuxt.
  components: [
    { path: '~/components', pathPrefix: false, ignore: ['ui/**'] },
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [tailwindcss()],
  },

  // server/lib/auth.ts usa top-level await para resolver o PrismaClient
  // (driver adapter) uma única vez no boot do processo.
  nitro: {
    esbuild: {
      options: {
        target: 'es2022',
      },
    },
  },
})
