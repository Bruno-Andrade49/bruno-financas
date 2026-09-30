<template>
  <div class="bg-ambient grid min-h-dvh bg-background lg:grid-cols-[1.05fr_1fr]">
    <aside class="surface-hero relative hidden overflow-hidden p-12 lg:flex lg:flex-col lg:justify-between">
      <div class="pointer-events-none absolute -right-24 -bottom-24 size-[28rem] rounded-full border border-white/10" aria-hidden="true" />
      <div class="pointer-events-none absolute -right-8 -bottom-8 size-72 rounded-full border border-white/10" aria-hidden="true" />

      <NuxtLink to="/" class="relative inline-flex w-fit items-center gap-3">
        <span class="flex size-12 items-center justify-center rounded-[28%] bg-white p-1.5 shadow-lg shadow-black/20">
          <img src="/logo.png" alt="" class="size-full object-contain" width="48" height="48">
        </span>
        <span class="text-xl leading-none">
          <span class="font-bold tracking-tight">Bruno</span>
          <span class="font-medium tracking-tight text-[#7ef0b4]">Finanças</span>
        </span>
      </NuxtLink>

      <div class="relative max-w-md">
        <h2 class="text-4xl font-bold leading-[1.1] tracking-tight">Seu dinheiro, com clareza.</h2>
        <p class="mt-4 text-base text-white/70">
          Lance um gasto em segundos, acompanhe o orçamento do mês e veja quanto falta pra cada meta.
        </p>

        <ul class="mt-10 space-y-4">
          <li v-for="(feature, i) in features" :key="feature.title" class="rise-in flex gap-3" :style="{ '--i': i + 1 }">
            <span class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/15">
              <component :is="feature.icon" weight="fill" class="size-4 text-[#7ef0b4]" />
            </span>
            <div>
              <p class="font-semibold">{{ feature.title }}</p>
              <p class="text-sm text-white/65">{{ feature.text }}</p>
            </div>
          </li>
        </ul>
      </div>

      <p class="relative text-xs text-white/50">Gratuito. Seus dados ficam só na sua conta.</p>
    </aside>

    <main class="relative flex flex-col px-4 py-6">
      <div class="flex items-center justify-between lg:justify-end">
        <NuxtLink to="/" class="lg:hidden" aria-label="Ir para o início">
          <BrandLogo />
        </NuxtLink>
        <ThemeCoinToggle />
      </div>
      <div class="flex flex-1 items-center justify-center py-10">
        <div class="rise-in w-full max-w-sm">
          <slot />
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { PhChartLineUp, PhLightning, PhTarget } from '@phosphor-icons/vue'
import BrandLogo from '@/components/layout/BrandLogo.vue'
import ThemeCoinToggle from '@/components/layout/ThemeCoinToggle.vue'

const features = [
  { icon: PhLightning, title: 'Lançamento rápido', text: 'Escreva "35 almoço" e pronto: categoria e data vêm sozinhas.' },
  { icon: PhChartLineUp, title: 'Orçamentos que avisam', text: 'Alerta antes de estourar o limite da categoria.' },
  { icon: PhTarget, title: 'Metas com projeção', text: 'Quanto guardar por mês pra chegar lá no prazo.' },
]
</script>
