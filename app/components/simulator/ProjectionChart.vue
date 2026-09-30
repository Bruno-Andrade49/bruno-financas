<template>
  <div class="space-y-4">
    <div class="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      <span class="inline-flex items-center gap-1.5"><span class="size-2.5 rounded-[3px] bg-chart-muted" />Gastos habituais</span>
      <span class="inline-flex items-center gap-1.5"><span class="size-2.5 rounded-[3px] bg-status-good" />Parcelas que cabem</span>
      <span class="inline-flex items-center gap-1.5"><span class="size-2.5 rounded-[3px] bg-status-bad" />Parcelas que não cabem</span>
      <span class="inline-flex items-center gap-1.5"><span class="h-0 w-4 border-t-2 border-foreground/50" />Renda</span>
      <span class="inline-flex items-center gap-1.5"><span class="h-0 w-4 border-t-2 border-dashed border-foreground/50" />Limite pra guardar</span>
    </div>

    <div class="-mx-1 overflow-x-auto px-1 pb-1">
      <div ref="containerRef" class="relative h-64 select-none" :style="{ minWidth: `${minWidth}px` }" @mouseleave="hovered = null">
        <svg v-if="width > 0" :width="width" :height="HEIGHT" class="overflow-visible" role="img" :aria-label="ariaLabel">
          <g v-for="tick in ticks" :key="tick">
            <line :x1="AXIS_W" :x2="width" :y1="y(tick)" :y2="y(tick)" class="stroke-border" stroke-dasharray="2 4" />
            <text :x="AXIS_W - 8" :y="y(tick)" dy="0.32em" text-anchor="end" class="fill-muted-foreground text-[10px] tabular-nums">{{ compact(tick) }}</text>
          </g>

          <g v-for="(m, i) in months" :key="m.month">
            <rect v-if="hovered === i" :x="barX(i) - 5" :y="PAD_TOP - 4" :width="barW + 10" :height="plotH + 4" rx="8" class="fill-muted" />
            <path :d="segment(barX(i), 0, m.expenses, m.installments === 0)" class="fill-chart-muted transition-opacity" :class="dim(i)" />
            <path
              v-if="m.installments > 0"
              :d="segment(barX(i), m.expenses, m.installments, true, GAP)"
              class="transition-opacity"
              :class="[m.status === 'ok' ? 'fill-status-good' : 'fill-status-bad', dim(i)]"
            />
            <text :x="barX(i) + barW / 2" :y="HEIGHT - 20" text-anchor="middle" class="text-[11px] capitalize" :class="hovered === i ? 'fill-foreground font-semibold' : 'fill-muted-foreground'">
              {{ monthShort(m.month) }}
            </text>
            <text
              :x="barX(i) + barW / 2"
              :y="HEIGHT - 4"
              text-anchor="middle"
              class="text-[11px] font-bold"
              :class="m.status === 'ok' ? 'fill-status-good' : 'fill-status-bad'"
              :aria-label="m.status === 'ok' ? 'cabe' : 'não cabe'"
            >
              {{ m.status === 'ok' ? '✓' : '✕' }}
            </text>
            <rect :x="barX(i) - slotPad" y="0" :width="barW + slotPad * 2" :height="HEIGHT" fill="transparent" @mouseenter="hovered = i" @touchstart.passive="hovered = i" />
          </g>

          <line :x1="AXIS_W" :x2="width" :y1="y(income)" :y2="y(income)" class="stroke-foreground/50" stroke-width="2" />
          <line :x1="AXIS_W" :x2="width" :y1="y(limit)" :y2="y(limit)" class="stroke-foreground/50" stroke-width="2" stroke-dasharray="6 5" />
          <line :x1="AXIS_W" :x2="width" :y1="baseline" :y2="baseline" class="stroke-border" />
        </svg>

        <div
          v-if="focused"
          class="pointer-events-none absolute top-0 z-10 w-56 -translate-x-1/2 rounded-xl border bg-popover p-3 text-xs shadow-lg"
          :style="{ left: `${tooltipLeft}px` }"
        >
          <p class="mb-2 flex items-center justify-between gap-2 font-semibold">
            {{ monthLong(focused.month) }}
            <span class="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold normal-case" :class="focused.status === 'ok' ? 'bg-status-good/15 text-income' : 'bg-status-bad/15 text-expense'">
              {{ statusLabel[focused.status] }}
            </span>
          </p>
          <div class="space-y-1 tabular-nums">
            <p class="flex justify-between gap-2"><span class="text-muted-foreground">Renda</span><span class="font-medium">{{ format(focused.income) }}</span></p>
            <p class="flex justify-between gap-2"><span class="text-muted-foreground">Gastos habituais</span><span class="font-medium">−{{ format(focused.expenses) }}</span></p>
            <p v-for="item in focused.items" :key="item.purchaseId" class="flex justify-between gap-2">
              <span class="truncate text-muted-foreground">{{ item.name }} <span class="opacity-70">{{ item.number }}/{{ item.of }}</span></span>
              <span class="font-medium">−{{ format(item.amount) }}</span>
            </p>
            <p class="mt-1.5 flex justify-between gap-2 border-t pt-1.5">
              <span class="text-muted-foreground">Sobra</span>
              <span class="font-semibold" :class="focused.leftover < 0 ? 'text-expense' : ''">{{ format(focused.leftover) }}</span>
            </p>
            <p class="flex justify-between gap-2">
              <span class="text-muted-foreground">Meta de guardar</span>
              <span class="font-medium">{{ format(savingsTarget) }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>

    <table class="sr-only">
      <caption>Projeção mensal com as compras simuladas</caption>
      <thead><tr><th>Mês</th><th>Parcelas</th><th>Sobra</th><th>Situação</th></tr></thead>
      <tbody>
        <tr v-for="m in months" :key="m.month">
          <td>{{ monthLong(m.month) }}</td><td>{{ format(m.installments) }}</td><td>{{ format(m.leftover) }}</td><td>{{ statusLabel[m.status] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
import { useElementSize } from '@vueuse/core'
import type { MonthStatus, SimulatedMonth } from '#shared/purchase-simulator'

const props = defineProps<{ months: SimulatedMonth[]; savingsTarget: number }>()

const { format } = useCurrencyFormat()
const containerRef = ref<HTMLElement | null>(null)
const { width } = useElementSize(containerRef)
const hovered = ref<number | null>(null)

const statusLabel: Record<MonthStatus, string> = { ok: 'Cabe', tight: 'Sem guardar a meta', negative: 'No vermelho' }

const HEIGHT = 256
const PAD_TOP = 12
const PAD_BOTTOM = 40
const AXIS_W = 48
const GAP = 2
const MIN_SLOT = 34
const plotH = HEIGHT - PAD_TOP - PAD_BOTTOM
const baseline = HEIGHT - PAD_BOTTOM

const minWidth = computed(() => AXIS_W + props.months.length * MIN_SLOT)

const income = computed(() => props.months[0]?.income ?? 0)
const limit = computed(() => Math.max(0, income.value - props.savingsTarget))

const max = computed(() => {
  const raw = Math.max(1, income.value, ...props.months.map((m) => m.expenses + m.installments))
  const magnitude = 10 ** Math.floor(Math.log10(raw))
  return [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10].find((s) => s * magnitude >= raw * 1.05)! * magnitude
})
const ticks = computed(() => [0, max.value / 2, max.value])

const slotW = computed(() => (width.value - AXIS_W) / Math.max(1, props.months.length))
const barW = computed(() => Math.min(30, slotW.value * 0.6))
const slotPad = computed(() => (slotW.value - barW.value) / 2)

function barX(i: number) {
  return AXIS_W + i * slotW.value + slotPad.value
}
function y(value: number) {
  return baseline - (value / max.value) * plotH
}

function segment(x: number, from: number, value: number, roundTop: boolean, gapBelow = 0) {
  const bottom = y(from) - gapBelow
  const top = y(from + value)
  const h = bottom - top
  if (h <= 0) return ''
  const w = barW.value
  const r = roundTop ? Math.min(4, w / 2, h) : 0
  return `M${x},${bottom} V${top + r} Q${x},${top} ${x + r},${top} H${x + w - r} Q${x + w},${top} ${x + w},${top + r} V${bottom} Z`
}

function dim(i: number) {
  return hovered.value !== null && hovered.value !== i ? 'opacity-40' : ''
}

const focused = computed(() => (hovered.value === null ? null : (props.months[hovered.value] ?? null)))
const tooltipLeft = computed(() => {
  if (hovered.value === null) return 0
  const center = barX(hovered.value) + barW.value / 2
  return Math.min(Math.max(center, 116), width.value - 116)
})

const compactFormatter = new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })
const compact = (value: number) => (value === 0 ? '0' : compactFormatter.format(value))

const upperFirst = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)

function toDate(month: string) {
  const [yy, mm] = month.split('-').map(Number)
  return new Date(Date.UTC(yy!, mm! - 1, 1))
}
const monthShort = (month: string) => toDate(month).toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '')
const monthLong = (month: string) => upperFirst(toDate(month).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }))

const ariaLabel = computed(() => {
  const bad = props.months.filter((m) => m.status !== 'ok').length
  return `Projeção de ${props.months.length} meses: ${bad} meses sem conseguir guardar a meta. Detalhes na tabela a seguir.`
})
</script>
