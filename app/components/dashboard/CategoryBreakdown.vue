<template>
  <ul class="space-y-3.5">
    <li v-for="(row, i) in rows" :key="row.name" class="rise-in" :style="{ '--i': i }">
      <div class="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span class="truncate font-medium">{{ row.name }}</span>
        <span class="shrink-0 tabular-nums">
          <span class="font-semibold">{{ format(row.total) }}</span>
          <span class="ml-1.5 text-xs text-muted-foreground">{{ percent(row.total) }}</span>
        </span>
      </div>
      <div class="h-2 overflow-hidden rounded-full bg-muted">
        <div
          class="bar h-full rounded-full bg-chart-seq"
          :class="row.isRest && 'opacity-50'"
          :style="{ '--w': `${(row.total / max) * 100}%` }"
        />
      </div>
    </li>
  </ul>
</template>

<script setup lang="ts">
const props = defineProps<{ data: { name: string; total: number }[] }>()
const { format } = useCurrencyFormat()

const TOP = 5

const rows = computed(() => {
  const sorted = [...props.data].sort((a, b) => b.total - a.total)
  if (sorted.length <= TOP + 1) return sorted.map((r) => ({ ...r, isRest: false }))
  const rest = sorted.slice(TOP).reduce((sum, r) => sum + r.total, 0)
  return [...sorted.slice(0, TOP).map((r) => ({ ...r, isRest: false })), { name: 'Outras', total: rest, isRest: true }]
})

const total = computed(() => props.data.reduce((sum, r) => sum + r.total, 0))
const max = computed(() => Math.max(1, ...rows.value.map((r) => r.total)))

function percent(value: number) {
  if (!total.value) return '0%'
  return `${((value / total.value) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`
}
</script>

<style scoped>
.bar {
  width: var(--w);
  animation: grow 700ms var(--ease-out-expo) both;
  transform-origin: left;
}
@keyframes grow {
  from { transform: scaleX(0); }
}
</style>
