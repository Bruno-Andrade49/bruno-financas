<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster />
  </div>
</template>

<script setup lang="ts">
import { Toaster } from '@/components/ui/sonner'
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/seo'

const route = useRoute()
const { siteUrl } = useRuntimeConfig().public
const base = String(siteUrl).replace(/\/$/, '')
const canonical = computed(() => `${base}${route.path === '/' ? '' : route.path}`)
const ogImage = `${base}/og-image.jpg`

useHead({
  titleTemplate: (title) => (title ? `${title} · ${SITE_NAME}` : `${SITE_NAME} | Controle financeiro pessoal`),
  link: [{ rel: 'canonical', href: canonical }],
})

useSeoMeta({
  description: SITE_DESCRIPTION,
  ogSiteName: SITE_NAME,
  ogType: 'website',
  ogLocale: 'pt_BR',
  ogUrl: canonical,
  ogTitle: SITE_NAME,
  ogDescription: SITE_DESCRIPTION,
  ogImage,
  ogImageSecureUrl: ogImage.startsWith('https') ? ogImage : undefined,
  ogImageWidth: 1200,
  ogImageHeight: 630,
  ogImageType: 'image/jpeg',
  ogImageAlt: 'Bruno Finanças: seu dinheiro, com clareza',
  twitterCard: 'summary_large_image',
  twitterTitle: SITE_NAME,
  twitterDescription: SITE_DESCRIPTION,
  twitterImage: ogImage,
  twitterImageAlt: 'Bruno Finanças: seu dinheiro, com clareza',
})
</script>
