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
    server: {
      // Permite acessar o dev server por um túnel ngrok (webhook do WhatsApp
      // precisa de HTTPS público) — Vite bloqueia hosts externos por padrão.
      // Sufixo com "." cobre qualquer subdomínio aleatório que o ngrok gerar.
      allowedHosts: ['.ngrok-free.dev', '.ngrok-free.app'],
    },
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
