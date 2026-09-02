<!--
  Navegação inferior fixa, só no mobile (md:hidden) — o padrão que qualquer
  usuário de app financeiro já reconhece (Nubank, Revolut, Mercury). No
  desktop a navegação continua no topo (ver app/layouts/app.vue).
-->
<template>
  <nav
    class="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 md:hidden"
    aria-label="Navegação principal"
  >
    <div class="mx-auto flex h-safe-nav max-w-md items-stretch justify-around px-2">
      <NuxtLink
        v-for="item in items"
        :key="item.to"
        :to="item.to"
        class="flex min-w-16 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg text-muted-foreground transition-colors active:scale-95"
        :class="isActive(item.to) ? 'text-primary' : 'hover:text-foreground'"
      >
        <component :is="item.icon" :weight="isActive(item.to) ? 'fill' : 'regular'" class="size-6" />
        <span class="text-[11px] font-medium leading-none">{{ item.label }}</span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { PhChatCircleDots, PhHouse, PhSparkle, PhTarget, PhWallet } from '@phosphor-icons/vue'

const route = useRoute()

const items = [
  { to: '/dashboard', label: 'Início', icon: PhHouse },
  { to: '/budgets', label: 'Orçamentos', icon: PhWallet },
  { to: '/goals', label: 'Metas', icon: PhTarget },
  { to: '/insights', label: 'Insights', icon: PhSparkle },
  { to: '/assistant', label: 'Assistente', icon: PhChatCircleDots },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>
