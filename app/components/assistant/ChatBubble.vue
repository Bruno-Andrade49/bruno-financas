<template>
  <div class="flex" :class="isUser ? 'justify-end' : 'justify-start'">
    <div class="flex max-w-[85%] flex-col gap-1" :class="isUser ? 'items-end' : 'items-start'">
      <div
        class="whitespace-pre-wrap rounded-2xl px-4 py-2.5 text-sm leading-relaxed"
        :class="isUser
          ? 'rounded-br-md bg-primary text-primary-foreground'
          : 'rounded-bl-md bg-muted text-foreground'"
      >
        {{ message.content }}
      </div>
      <p v-if="message.toolsUsed?.length" class="flex items-center gap-1 px-1 text-xs text-muted-foreground">
        <PhMagnifyingGlass class="size-3" />
        Consultou: {{ toolLabels }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { PhMagnifyingGlass } from '@phosphor-icons/vue'

export type ChatDisplayMessage = {
  role: 'user' | 'assistant'
  content: string
  toolsUsed?: string[]
}

const props = defineProps<{ message: ChatDisplayMessage }>()

const isUser = computed(() => props.message.role === 'user')

const TOOL_LABELS: Record<string, string> = {
  get_expenses_by_category: 'gastos por categoria',
  get_income_vs_expenses: 'receitas x despesas',
  compare_periods: 'comparação de períodos',
  get_budget_status: 'status de orçamento',
  get_goal_projection: 'projeção de meta',
  create_transaction: 'novo lançamento',
}

const toolLabels = computed(
  () => [...new Set(props.message.toolsUsed ?? [])].map((name) => TOOL_LABELS[name] ?? name).join(', '),
)
</script>
