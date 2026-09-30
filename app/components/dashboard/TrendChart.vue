<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
      <span class="inline-flex items-center gap-1.5">
        <span class="size-2.5 rounded-[3px] bg-chart-income" aria-hidden="true" />Receitas
      </span>
      <span class="inline-flex items-center gap-1.5">
        <span class="size-2.5 rounded-[3px] bg-chart-expense" aria-hidden="true" />Despesas
      </span>
    </div>

    <div ref="containerRef" class="relative h-52 w-full select-none" @mouseleave="hovered = null">
      <svg v-if="width > 0" :width="width" :height="HEIGHT" class="overflow-visible" role="img" :aria-label="ariaLabel">
        <g v-for="tick in ticks" :key="tick">
          <line :x1="AXIS_W" :x2="width" :y1="y(tick)" :y2="y(tick)" class="stroke-border" stroke-dasharray="2 4" />
          <text :x="AXIS_W - 8" :y="y(tick)" dy="0.32em" text-anchor="end" class="fill-muted-foreground text-[10px] tabular-nums">
            {{ compact(tick) }}
          </text>
        </g>

        <g v-for="(point, i) in data" :key="point.month">
          <rect
            v-if="hovered === i"
            :x="groupX(i) - 4"
            :y="PAD_TOP - 4"
            :width="groupW + 8"
            :height="plotH + 4"
            rx="8"
            class="fill-muted"
          />
          <path :d="barPath(groupX(i), point.income)" class="fill-chart-income transition-opacity" :class="dim(i)" />
          <path :d="barPath(groupX(i) + barW + GAP, point.expense)" class="fill-chart-expense transition-opacity" :class="dim(i)" />
          <text
            :x="groupX(i) + groupW / 2"
            :y="HEIGHT - 6"
            text-anchor="middle"
            class="text-[11px] capitalize"
            :class="hovered === i || i === data.length - 1 ? 'fill-foreground font-semibold' : 'fill-muted-foreground'"
          >
            {{ monthShort(point.month) }}
          </text>
          <rect
            :x="groupX(i) - slotPad"
            :y="0"
            :width="groupW + slotPad * 2"
            :height="HEIGHT"
            fill="transparent"
            @mouseenter="hovered = i"
            @touchstart.passive="hovered = i"
          />
        </g>
        <line :x1="AXIS_W" :x2="width" :y1="baseline" :y2="baseline" class="stroke-border" />
      </svg>

      <div
        v-if="focused"
        class="pointer-events-none absolute top-0 z-10 w-44 -translate-x-1/2 rounded-xl border bg-popover p-3 text-xs shadow-lg"
        :style="{ left: `${tooltipLeft}px` }"
      >
        <p class="mb-2 font-semibold">{{ monthLong(focused.month) }}</p>
        <div class="space-y-1 tabular-nums">
          <p class="flex items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1.5 text-muted-foreground"><span class="size-2 rounded-[2px] bg-chart-income" />Receitas</span>
            <span class="font-medium">{{ format(focused.income) }}</span>
          </p>
          <p class="flex items-center justify-between gap-2">
            <span class="inline-flex items-center gap-1.5 text-muted-foreground"><span class="size-2 rounded-[2px] bg-chart-expense" />Despesas</span>
            <span class="font-medium">{{ format(focused.expense) }}</span>
          </p>
          <p class="mt-1.5 flex items-center justify-between gap-2 border-t pt-1.5">
            <span class="text-muted-foreground">Saldo</span>
            <span class="font-semibold" :class="focused.income - focused.expense >= 0 ? 'text-income' : 'text-expense'">
              {{ format(focused.income - focused.expense) }}
            </span>
          </p>
        </div>
      </div>
    </div>

    <table class="sr-only">
      <caption>Receitas e despesas por mês</caption>
      <thead><tr><th>Mês</th><th>Receitas</th><th>Despesas</th></tr></thead>
      <tbody>
        <tr v-for="point in data" :key="point.month">
          <td>{{ monthLong(point.month) }}</td><td>{{ format(point.income) }}</td><td>{{ format(point.expense) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'

const props = defineProps<{ data: { month: string; income: number; expense: number }[] }>()

const { format } = useCurrencyFormat()
const containerRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(containerRef)
const hovered = ref<number | null>(null)

const HEIGHT = 208
const PAD_TOP = 12
const PAD_BOTTOM = 26
const AXIS_W = 48
const GAP = 2 // espaço entre as duas barras do mês
const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM
const baseline = HEIGHT - PAD_BOTTOM

const max = computed(() => {
  const raw = Math.max(1, ...props.data.flatMap((d) => [d.income, d.expense]))
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  const step = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * magnitude >= raw)! * magnitude
  return step
})
const ticks = computed(() => [0, max.value / 2, max.value])

const slotW = computed(() => (width.value - AXIS_W) / Math.max(1, props.data.length))
const groupW = computed(() => Math.min(44, slotW.value * 0.62))
const barW = computed(() => (groupW.value - GAP) / 2)
const slotPad = computed(() => (slotW.value - groupW.value) / 2)

function groupX(i: number) {
  return AXIS_W + i * slotW.value + slotPad.value
}
function y(value: number) {
  return baseline - (value / max.value) * plotH
}

function barPath(x: number, value: number) {
  const h = Math.max(0, baseline - y(value))
  if (h === 0) return ''
  const w = barW.value
  const r = Math.min(4, w / 2, h)
  return `M${x},${baseline} V${baseline - h + r} Q${x},${baseline - h} ${x + r},${baseline - h} H${x + w - r} Q${x + w},${baseline - h} ${x + w},${baseline - h + r} V${baseline} Z`
}

function dim(i: number) {
  return hovered.value !== null && hovered.value !== i ? 'opacity-40' : ''
}

const focused = computed(() => (hovered.value === null ? null : (props.data[hovered.value] ?? null)))

const tooltipLeft = computed(() => {
  if (hovered.value === null) return 0
  const center = groupX(hovered.value) + groupW.value / 2
  return Math.min(Math.max(center, 88), width.value - 88)
})

const compactFormatter = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })
function compact(value: number) {
  return value === 0 ? '0' : compactFormatter.format(value)
}

const upperFirst = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

function toDate(month: string) {
  const [y, m] = month.split('-').map(Number)
  return new Date(Date.UTC(y!, m! - 1, 1))
}
function monthShort(month: string) {
  return toDate(month).toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '')
}
function monthLong(month: string) {
  return upperFirst(toDate(month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }))
}

const ariaLabel = computed(
  () => `Receitas e despesas dos últimos ${props.data.length} meses. Detalhes na tabela a seguir.`,
)
</script>
