<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Visão geral</h1>
        <p class="text-sm text-muted-foreground">{{ monthLabel }}</p>
        <NuxtLink to="/recurring" class="mt-0.5 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground md:hidden">
          <PhArrowsClockwise class="size-3" />Recorrências
        </NuxtLink>
      </div>
      <CreateTransactionDialog @created="refreshAll" />
    </div>

    <AsyncState :pending="summaryPending" :error="summaryError">
      <div class="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card>
          <CardHeader class="flex items-center gap-3 space-y-0 pb-2">
            <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <PhTrendUp class="size-5" />
            </span>
            <div class="min-w-0">
              <CardDescription>Receitas do mês</CardDescription>
              <CardTitle class="text-xl font-semibold tabular-nums text-emerald-600 dark:text-emerald-400">
                {{ format(summary?.totalIncome ?? 0) }}
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="flex items-center gap-3 space-y-0 pb-2">
            <span class="flex size-9 shrink-0 items-center justify-center rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <PhTrendDown class="size-5" />
            </span>
            <div class="min-w-0">
              <CardDescription>Despesas do mês</CardDescription>
              <CardTitle class="text-xl font-semibold tabular-nums text-rose-600 dark:text-rose-400">
                {{ format(summary?.totalExpense ?? 0) }}
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader class="flex items-center gap-3 space-y-0 pb-2">
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-full"
              :class="isPositiveSavings ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'"
            >
              <PhPiggyBank class="size-5" />
            </span>
            <div class="min-w-0">
              <CardDescription>Economia do mês</CardDescription>
              <CardTitle
                class="text-xl font-semibold tabular-nums"
                :class="isPositiveSavings ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
              >
                {{ format(summary?.savings ?? 0) }}
              </CardTitle>
            </div>
          </CardHeader>
        </Card>
      </div>
    </AsyncState>

    <div>
      <h2 class="mb-3 text-lg font-medium tracking-tight">Últimos lançamentos</h2>
      <AsyncState
        :pending="transactionsPending"
        :error="transactionsError"
        :is-empty="(transactions?.items.length ?? 0) === 0"
        empty-message="Nenhuma transação ainda. Registre a primeira acima."
      >
        <!-- Mobile: lista empilhada (uma tabela de 4 colunas não cabe numa tela de 375px). -->
        <ul class="divide-y rounded-xl border sm:hidden">
          <li v-for="transaction in transactions?.items" :key="transaction.id" class="flex items-center gap-3 px-4 py-3">
            <span
              class="flex size-9 shrink-0 items-center justify-center rounded-full"
              :class="transaction.type === 'income' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'"
            >
              <component :is="transaction.type === 'income' ? PhArrowUpRight : PhArrowDownRight" class="size-4" />
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate font-medium">{{ transaction.description }}</p>
              <p class="truncate text-xs text-muted-foreground">
                {{ transaction.category.name }} · {{ new Date(transaction.date).toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: 'short' }) }}
              </p>
            </div>
            <span
              class="shrink-0 tabular-nums font-medium"
              :class="transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
            >
              {{ transaction.type === 'income' ? '+' : '-' }}{{ format(transaction.amount) }}
            </span>
          </li>
        </ul>

        <!-- sm+: tabela, com espaço de sobra pra todas as colunas. -->
        <div class="hidden overflow-x-auto rounded-xl border sm:block">
          <table class="w-full text-sm">
            <thead class="bg-muted/50 text-left text-muted-foreground">
              <tr>
                <th class="px-4 py-2 font-medium">Data</th>
                <th class="px-4 py-2 font-medium">Descrição</th>
                <th class="px-4 py-2 font-medium">Categoria</th>
                <th class="px-4 py-2 text-right font-medium">Valor</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in transactions?.items" :key="transaction.id" class="border-t">
                <td class="px-4 py-2 tabular-nums text-muted-foreground">
                  {{ new Date(transaction.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) }}
                </td>
                <td class="px-4 py-2">{{ transaction.description }}</td>
                <td class="px-4 py-2">
                  <Badge variant="secondary">{{ transaction.category.name }}</Badge>
                </td>
                <td
                  class="px-4 py-2 text-right tabular-nums font-medium"
                  :class="transaction.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'"
                >
                  {{ transaction.type === 'income' ? '+' : '-' }}{{ format(transaction.amount) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </AsyncState>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhArrowDownRight, PhArrowsClockwise, PhArrowUpRight, PhPiggyBank, PhTrendDown, PhTrendUp } from '@phosphor-icons/vue'
import { Badge } from '@/components/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import CreateTransactionDialog from '@/components/transactions/CreateTransactionDialog.vue'

definePageMeta({ layout: 'app', middleware: 'auth' })

const { format } = useCurrencyFormat()

const now = new Date()
const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const monthLabel = useMonthLabel(now)

const {
  data: summary,
  pending: summaryPending,
  error: summaryError,
  refresh: refreshSummary,
} = await useFetch('/api/v1/transactions/summary', { query: { month } })

const {
  data: transactions,
  pending: transactionsPending,
  error: transactionsError,
  refresh: refreshTransactions,
} = await useFetch('/api/v1/transactions', { query: { pageSize: 10 } })

const isPositiveSavings = computed(() => (summary.value?.savings ?? 0) >= 0)

function refreshAll() {
  refreshSummary()
  refreshTransactions()
}
</script>
