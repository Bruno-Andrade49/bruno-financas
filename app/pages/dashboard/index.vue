<template>
  <div class="space-y-8">
    <div class="rise-in flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-sm font-medium text-muted-foreground">{{ monthLabel }}</p>
        <h1 class="mt-1 text-3xl font-bold tracking-tight md:text-4xl">{{ greeting }}</h1>
      </div>
      <div class="flex items-center gap-2">
        <NuxtLink
          to="/recurring"
          class="press inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground xl:hidden"
        >
          <PhArrowsClockwise class="size-4" />Recorrências
        </NuxtLink>
        <CreateTransactionDialog />
      </div>
    </div>

    <section class="rise-in surface-hero relative overflow-hidden rounded-2xl p-6 md:p-8" style="--i: 1" aria-labelledby="saldo-titulo">
      <div class="pointer-events-none absolute -right-10 -bottom-16 size-64 rounded-full border border-white/10" aria-hidden="true" />
      <div class="pointer-events-none absolute -right-2 -bottom-8 size-40 rounded-full border border-white/10" aria-hidden="true" />

      <div class="relative grid gap-8 md:grid-cols-[1.4fr_1fr] md:items-end">
        <div>
          <p id="saldo-titulo" class="text-sm font-medium text-white/70">Saldo do mês</p>
          <p v-if="summaryPending && !summary" class="mt-2 h-12 w-56 animate-pulse rounded-lg bg-white/15" />
          <p v-else class="mt-1 text-4xl font-bold tracking-tight tabular-nums md:text-5xl">
            {{ format(animatedSavings) }}
          </p>
          <p class="mt-3 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white/85">
            <component :is="savingsRate >= 0 ? PhTrendUp : PhTrendDown" class="size-3.5" weight="bold" />
            {{ savingsMessage }}
          </p>
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-xl bg-white/[0.07] p-4 ring-1 ring-white/10">
            <p class="flex items-center gap-1.5 text-xs font-medium text-white/70">
              <span class="flex size-5 items-center justify-center rounded-md bg-[#22c47a]/25 text-[#7ef0b4]"><PhArrowUpRight class="size-3" weight="bold" /></span>
              Entrou
            </p>
            <p class="mt-2 text-lg font-semibold tabular-nums">{{ format(income) }}</p>
          </div>
          <div class="rounded-xl bg-white/[0.07] p-4 ring-1 ring-white/10">
            <p class="flex items-center gap-1.5 text-xs font-medium text-white/70">
              <span class="flex size-5 items-center justify-center rounded-md bg-[#e0739f]/25 text-[#ffb3cf]"><PhArrowDownRight class="size-3" weight="bold" /></span>
              Saiu
            </p>
            <p class="mt-2 text-lg font-semibold tabular-nums">{{ format(expense) }}</p>
          </div>
        </div>
      </div>

      <Button
        variant="secondary"
        class="press relative mt-6 w-full rounded-xl bg-white text-[oklch(0.28_0.1_263)] hover:bg-white/90 md:hidden"
        @click="openQuickAdd"
      >
        <PhLightning weight="fill" class="size-4" />Lançar agora
      </Button>
    </section>

    <div class="grid gap-4 lg:grid-cols-5">
      <Card class="rise-in rounded-2xl lg:col-span-3" style="--i: 2">
        <CardHeader>
          <CardTitle class="text-base font-semibold">Últimos 6 meses</CardTitle>
          <CardDescription>Quanto entrou e quanto saiu, mês a mês.</CardDescription>
        </CardHeader>
        <CardContent>
          <AsyncState :pending="trendPending" :error="trendError" :is-empty="!hasTrend">
            <template #empty>
              <EmptyHint :icon="PhChartBar" text="Seus meses aparecem aqui depois do primeiro lançamento." />
            </template>
            <TrendChart :data="trend ?? []" />
          </AsyncState>
        </CardContent>
      </Card>

      <Card class="rise-in rounded-2xl lg:col-span-2" style="--i: 3">
        <CardHeader>
          <CardTitle class="text-base font-semibold">Para onde foi o dinheiro</CardTitle>
          <CardDescription>Despesas de {{ monthName }} por categoria.</CardDescription>
        </CardHeader>
        <CardContent>
          <AsyncState :pending="summaryPending" :error="summaryError" :is-empty="!summary?.byCategory.length">
            <template #empty>
              <EmptyHint :icon="PhChartPieSlice" text="Nenhuma despesa neste mês ainda." />
            </template>
            <CategoryBreakdown :data="summary?.byCategory ?? []" />
          </AsyncState>
        </CardContent>
      </Card>
    </div>

    <section class="rise-in" style="--i: 4" aria-labelledby="ultimos-titulo">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <h2 id="ultimos-titulo" class="text-lg font-semibold tracking-tight">Últimos lançamentos</h2>
        <TypeFilter v-model="typeFilter" />
      </div>

      <AsyncState
        :pending="transactionsPending"
        :error="transactionsError"
        :is-empty="(transactions?.items.length ?? 0) === 0"
      >
        <template #empty>
          <div v-if="typeFilter" class="rounded-2xl border border-dashed">
            <EmptyHint :icon="PhFunnel" :text="typeFilter === 'income' ? 'Nenhuma entrada lançada ainda.' : 'Nenhuma saída lançada ainda.'" />
          </div>
          <div v-else class="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-10 text-center">
            <span class="flex size-12 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
              <PhLightning weight="fill" class="size-6" />
            </span>
            <div>
              <p class="font-medium">Nenhum lançamento ainda</p>
              <p class="mt-1 text-sm text-muted-foreground">Experimente escrever <span class="font-medium text-foreground">"35 almoço"</span>.</p>
            </div>
            <Button class="press rounded-xl" @click="openQuickAdd"><PhLightning weight="fill" class="size-4" />Primeiro lançamento</Button>
          </div>
        </template>

        <TransactionList :items="transactions?.items ?? []" />
        <Button
          v-if="(transactions?.total ?? 0) > PREVIEW_SIZE"
          as-child
          variant="outline"
          class="press mt-3 h-11 w-full rounded-xl"
        >
          <NuxtLink :to="{ path: '/transactions', query: typeFilter ? { type: typeFilter } : {} }">
            Ver todos os {{ transactions?.total }} lançamentos<PhArrowRight class="size-4" />
          </NuxtLink>
        </Button>
      </AsyncState>
    </section>

    <NuxtLink
      to="/vale-a-pena"
      class="press rise-in group relative flex items-center gap-4 overflow-hidden rounded-2xl bg-card p-5 ring-1 ring-foreground/[0.07] transition-shadow hover:shadow-lg dark:ring-white/[0.08]"
      style="--i: 5"
    >
      <span class="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <PhScales weight="fill" class="size-6" />
      </span>
      <span class="min-w-0 flex-1">
        <span class="block font-semibold">Vale a pena?</span>
        <span class="block text-sm text-muted-foreground">Simule uma compra parcelada e veja se ela cabe nos seus próximos meses.</span>
      </span>
      <PhArrowRight class="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import {
  PhArrowDownRight,
  PhArrowRight,
  PhArrowsClockwise,
  PhArrowUpRight,
  PhChartBar,
  PhChartPieSlice,
  PhFunnel,
  PhLightning,
  PhScales,
  PhTrendDown,
  PhTrendUp,
} from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CreateTransactionDialog from '@/components/transactions/CreateTransactionDialog.vue'
import TrendChart from '@/components/dashboard/TrendChart.vue'
import CategoryBreakdown from '@/components/dashboard/CategoryBreakdown.vue'
import EmptyHint from '@/components/common/EmptyHint.vue'
import TransactionList from '@/components/transactions/TransactionList.vue'
import TypeFilter from '@/components/transactions/TypeFilter.vue'
import { useSession } from '@/lib/auth-client'

definePageMeta({ layout: 'app', middleware: 'auth' })
useHead({ title: 'Visão geral' })

const { format } = useCurrencyFormat()
const { open: openQuickAdd, version } = useQuickAdd()
const session = useSession()

const PREVIEW_SIZE = 6
const typeFilter = ref<'income' | 'expense' | null>(null)

const now = new Date()
const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const monthLabel = useMonthLabel(now)
const monthName = now.toLocaleDateString('pt-BR', { month: 'long' })

// avisa o portal do login que a página já está pronta na tela
const { markReady } = useFinancePortal()
onMounted(() => markReady('/dashboard'))

const period = ref('Olá')
onMounted(() => {
  const hour = new Date().getHours()
  period.value = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'
})
const greeting = computed(() => {
  const firstName = session.value?.data?.user?.name?.trim().split(/\s+/)[0]
  return firstName ? `${period.value}, ${firstName}` : period.value
})

// as três buscas saem juntas, em vez de uma esperar a outra
const [summaryFetch, transactionsFetch, trendFetch] = await Promise.all([
  useFetch('/api/v1/transactions/summary', { query: { month } }),
  useFetch('/api/v1/transactions', {
    query: computed(() => ({ pageSize: PREVIEW_SIZE, ...(typeFilter.value ? { type: typeFilter.value } : {}) })),
  }),
  useFetch('/api/v1/transactions/trend', { query: { months: 6 } }),
])

const { data: summary, pending: summaryPending, error: summaryError, refresh: refreshSummary } = summaryFetch
const { data: transactions, pending: transactionsPending, error: transactionsError, refresh: refreshTransactions } = transactionsFetch
const { data: trend, pending: trendPending, error: trendError, refresh: refreshTrend } = trendFetch

const income = computed(() => Number(summary.value?.totalIncome ?? 0))
const expense = computed(() => Number(summary.value?.totalExpense ?? 0))
const savings = computed(() => income.value - expense.value)
const animatedSavings = useCountUp(savings)
const hasTrend = computed(() => (trend.value ?? []).some((m: { income: number; expense: number }) => m.income > 0 || m.expense > 0))

const savingsRate = computed(() => (income.value > 0 ? savings.value / income.value : savings.value >= 0 ? 0 : -1))
const savingsMessage = computed(() => {
  if (income.value === 0 && expense.value === 0) return 'Nenhum lançamento neste mês ainda'
  if (income.value === 0) return 'Sem receitas lançadas neste mês'
  const pct = Math.abs(savingsRate.value * 100).toLocaleString('pt-BR', { maximumFractionDigits: 0 })
  return savingsRate.value >= 0 ? `Você guardou ${pct}% do que entrou` : `Gastou ${pct}% a mais do que entrou`
})

function refreshAll() {
  refreshSummary()
  refreshTransactions()
  refreshTrend()
}

watch(version, refreshAll)
</script>
