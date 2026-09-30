import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@pinia/nuxt'],

  components: [
    { path: '~/components', pathPrefix: false, ignore: ['ui/**'] },
  ],

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      siteUrl: 'http://localhost:3000',
    },
  },

  app: {
    head: {
      htmlAttrs: { lang: 'pt-BR' },
      meta: [
        { name: 'theme-color', content: '#f6f8fb', media: '(prefers-color-scheme: light)' },
        { name: 'theme-color', content: '#0b1222', media: '(prefers-color-scheme: dark)' },
        { name: 'color-scheme', content: 'light dark' },
        { name: 'format-detection', content: 'telephone=no' },
        { name: 'apple-mobile-web-app-title', content: 'Bruno Finanças' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', sizes: '64x64', href: '/favicon.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/site.webmanifest' },
      ],
      // aplica o tema salvo antes da página aparecer, pra não piscar
      script: [
        {
          tagPosition: 'head',
          innerHTML:
            "(function(){try{var m=localStorage.getItem('bf-theme')||'system';var d=m==='dark'||(m==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d)}catch(e){}})()",
        },
      ],
    },
  },

  vite: {
    plugins: [tailwindcss()],
  },

  routeRules: {
    '/**': {
      headers: {
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin',
        'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
        // em dev o Vite precisa de websocket e scripts extras, por isso só em produção
        ...(process.env.NODE_ENV === 'production'
          ? {
              'Strict-Transport-Security': 'max-age=63072000; includeSubDomains',
              'Content-Security-Policy': [
                "default-src 'self'",
                "script-src 'self' 'unsafe-inline'",
                "style-src 'self' 'unsafe-inline'",
                "img-src 'self' data: blob:",
                "font-src 'self' data:",
                "connect-src 'self'",
                "frame-ancestors 'none'",
                "base-uri 'self'",
                "form-action 'self'",
                "object-src 'none'",
              ].join('; '),
            }
          : {}),
      },
    },
  },

  nitro: {
    esbuild: {
      options: {
        target: 'es2022',
      },
    },
  },
})
