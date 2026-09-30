<template>
  <div class="overflow-hidden rounded-2xl border bg-card">
    <div v-for="group in groups" :key="group.day" class="border-t first:border-t-0">
      <h3 class="bg-muted/40 px-4 py-1.5 text-xs font-semibold text-muted-foreground">{{ group.label }}</h3>
      <ul class="divide-y divide-border/60">
        <li v-for="transaction in group.items" :key="transaction.id" class="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted/50">
          <span
            class="flex size-10 shrink-0 items-center justify-center rounded-[30%]"
            :class="transaction.type === 'income' ? 'bg-income/12 text-income' : 'bg-expense/10 text-expense'"
          >
            <component :is="transaction.type === 'income' ? PhArrowUpRight : PhArrowDownRight" class="size-4" weight="bold" />
            <span class="sr-only">{{ transaction.type === 'income' ? 'Receita' : 'Despesa' }}</span>
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium">{{ transaction.description }}</p>
            <p class="flex items-center gap-1.5 truncate text-xs text-muted-foreground">
              {{ transaction.category.name }}
              <span v-if="transaction.source === 'quick_add'" class="inline-flex items-center gap-0.5" title="Lançamento rápido">
                · <PhLightning weight="fill" class="size-3" />
              </span>
              <span v-else-if="transaction.source === 'recurring'" class="inline-flex items-center gap-0.5" title="Recorrência">
                · <PhArrowsClockwise class="size-3" />
              </span>
            </p>
          </div>
          <span class="shrink-0 font-semibold tabular-nums" :class="transaction.type === 'income' ? 'text-income' : 'text-foreground'">
            {{ transaction.type === 'income' ? '+' : '−' }}{{ format(transaction.amount) }}
          </span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhArrowDownRight, PhArrowsClockwise, PhArrowUpRight, PhLightning } from '@phosphor-icons/vue'

interface ListItem {
  id: string
  description: string
  type: 'income' | 'expense' | string
  amount: string | number
  date: string | Date
  source: string
  category: { name: string }
}

const props = defineProps<{ items: ListItem[] }>()
const { format } = useCurrencyFormat()

function localIso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

const dayFormatter = new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: 'numeric', month: 'short', timeZone: 'UTC' })
const yearFormatter = new Intl.DateTimeFormat('pt-BR', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })

function dayLabel(day: string) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (day === localIso(today)) return 'Hoje'
  if (day === localIso(yesterday)) return 'Ontem'
  const date = new Date(`${day}T00:00:00Z`)
  const label = (date.getUTCFullYear() === today.getFullYear() ? dayFormatter : yearFormatter).format(date).replace('.', '')
  return label.charAt(0).toUpperCase() + label.slice(1)
}

const groups = computed(() => {
  const result: { day: string; label: string; items: ListItem[] }[] = []
  for (const item of props.items) {
    const day = String(item.date instanceof Date ? item.date.toISOString() : item.date).slice(0, 10)
    const last = result.at(-1)
    if (last?.day === day) last.items.push(item)
    else result.push({ day, label: dayLabel(day), items: [item] })
  }
  return result
})
</script>
