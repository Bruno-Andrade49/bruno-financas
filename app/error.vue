<template>
  <div class="bg-ambient flex min-h-dvh flex-col items-center justify-center gap-6 bg-background px-6 text-center">
    <BrandLogo size="lg" :with-name="false" />
    <div>
      <p class="text-sm font-semibold text-muted-foreground tabular-nums">{{ error?.statusCode ?? 'Erro' }}</p>
      <h1 class="mt-2 text-3xl font-bold tracking-tight">{{ is404 ? 'Página não encontrada' : 'Algo deu errado' }}</h1>
      <p class="mx-auto mt-3 max-w-sm text-muted-foreground">
        {{ is404 ? 'O endereço pode ter mudado ou nunca ter existido.' : 'Não conseguimos carregar esta página. Tente de novo em instantes.' }}
      </p>
    </div>
    <Button class="press h-11 rounded-xl px-6" @click="clearError({ redirect: '/dashboard' })">Voltar para o início</Button>
  </div>
</template>

<script setup lang="ts">
import type { NuxtError } from '#app'
import { Button } from '@/components/ui/button'
import BrandLogo from '@/components/layout/BrandLogo.vue'

const props = defineProps<{ error: NuxtError }>()
const is404 = computed(() => props.error?.statusCode === 404)
useHead({ titleTemplate: '%s · Bruno Finanças', title: computed(() => (is404.value ? 'Página não encontrada' : 'Erro')) })
useSeoMeta({ robots: 'noindex' })
</script>
