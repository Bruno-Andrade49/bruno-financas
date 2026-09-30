<template>
  <nav class="fixed inset-x-0 bottom-0 z-40 px-3 pb-2 xl:hidden" aria-label="Navegação principal">
    <div class="glass mx-auto flex h-safe-nav max-w-md items-stretch justify-around rounded-2xl border border-border/60 px-1 shadow-lg shadow-black/5">
      <template v-for="(item, index) in items" :key="item.to">
        <button
          v-if="index === 2"
          type="button"
          class="press -mt-5 flex flex-1 flex-col items-center justify-start"
          aria-label="Lançar transação"
          @click="openQuickAdd"
        >
          <span class="flex size-14 items-center justify-center rounded-[38%] bg-primary text-primary-foreground shadow-lg shadow-primary/30 ring-4 ring-background">
            <PhPlus weight="bold" class="size-6" />
          </span>
        </button>
        <NuxtLink
          :to="item.to"
          class="press flex min-w-14 flex-1 flex-col items-center justify-center gap-1 rounded-xl text-muted-foreground transition-colors"
          :class="isActive(item.to) ? 'text-foreground' : 'hover:text-foreground'"
          :aria-current="isActive(item.to) ? 'page' : undefined"
        >
          <span class="relative flex h-7 w-11 items-center justify-center rounded-full transition-colors" :class="isActive(item.to) && 'bg-accent text-accent-foreground'">
            <component :is="item.icon" :weight="isActive(item.to) ? 'fill' : 'regular'" class="size-5" />
          </span>
          <span class="text-[11px] font-medium leading-none">{{ item.label }}</span>
        </NuxtLink>
      </template>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { PhHouse, PhPlus, PhSparkle, PhTarget, PhWallet } from '@phosphor-icons/vue'

const route = useRoute()
const { open: openQuickAdd } = useQuickAdd()

const items = [
  { to: '/dashboard', label: 'Início', icon: PhHouse },
  { to: '/budgets', label: 'Orçamentos', icon: PhWallet },
  { to: '/goals', label: 'Metas', icon: PhTarget },
  { to: '/insights', label: 'Insights', icon: PhSparkle },
]

function isActive(to: string) {
  return route.path === to || route.path.startsWith(`${to}/`)
}
</script>
