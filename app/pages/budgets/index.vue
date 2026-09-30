<template>
  <div class="rise-in space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Orçamentos</h1>
        <p class="text-sm text-muted-foreground">{{ monthLabel }}</p>
      </div>
      <CreateBudgetDialog :month="month" @created="refresh" />
    </div>

    <AsyncState
      :pending="pending"
      :error="error"
      :is-empty="(budgets?.length ?? 0) === 0"
      empty-message="Nenhum orçamento definido para este mês ainda."
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <BudgetCard v-for="budget in budgets" :key="budget.id" :budget="budget" @deleted="refresh" />
      </div>
    </AsyncState>
  </div>
</template>

<script setup lang="ts">
import BudgetCard from '@/components/budgets/BudgetCard.vue'
import CreateBudgetDialog from '@/components/budgets/CreateBudgetDialog.vue'

definePageMeta({ layout: 'app', middleware: 'auth' })
useHead({ title: 'Orçamentos' })

const now = new Date()
const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
const monthLabel = useMonthLabel(now)

const { data: budgets, pending, error, refresh } = await useFetch('/api/v1/budgets', { query: { month } })
</script>
