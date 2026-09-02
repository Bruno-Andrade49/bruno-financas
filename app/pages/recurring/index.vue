<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between gap-3">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Recorrências</h1>
        <p class="text-sm text-muted-foreground">Lançamentos automáticos: assinaturas, salário, aluguel.</p>
      </div>
      <CreateRecurringDialog @created="refresh" />
    </div>

    <AsyncState
      :pending="pending"
      :error="error"
      :is-empty="(items?.length ?? 0) === 0"
      empty-message="Nenhuma recorrência cadastrada ainda."
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RecurringCard v-for="item in items" :key="item.id" :item="item" @changed="refresh" />
      </div>
    </AsyncState>
  </div>
</template>

<script setup lang="ts">
import CreateRecurringDialog from '@/components/recurring/CreateRecurringDialog.vue'
import RecurringCard from '@/components/recurring/RecurringCard.vue'

definePageMeta({ layout: 'app', middleware: 'auth' })

const { data: items, pending, error, refresh } = await useFetch('/api/v1/recurring-transactions')
</script>
