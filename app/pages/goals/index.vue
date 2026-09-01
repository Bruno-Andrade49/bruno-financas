<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold tracking-tight">Metas</h1>
        <p class="text-sm text-muted-foreground">Quanto guardar por mês para chegar lá.</p>
      </div>
      <CreateGoalDialog @created="refresh" />
    </div>

    <AsyncState
      :pending="pending"
      :error="error"
      :is-empty="(goals?.length ?? 0) === 0"
      empty-message="Nenhuma meta criada ainda."
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <GoalCard v-for="goal in goals" :key="goal.id" :goal="goal" @changed="refresh" />
      </div>
    </AsyncState>
  </div>
</template>

<script setup lang="ts">
import CreateGoalDialog from '@/components/goals/CreateGoalDialog.vue'
import GoalCard from '@/components/goals/GoalCard.vue'

definePageMeta({ layout: 'app', middleware: 'auth' })

const { data: goals, pending, error, refresh } = await useFetch('/api/v1/goals')
</script>
