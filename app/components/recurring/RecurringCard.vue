<template>
  <Card>
    <CardHeader class="flex items-center gap-3 space-y-0 pb-2">
      <span
        class="flex size-9 shrink-0 items-center justify-center rounded-[30%]"
        :class="item.type === 'income' ? 'bg-income/12 text-income' : 'bg-expense/10 text-expense'"
      >
        <PhArrowsClockwise class="size-4" />
      </span>
      <div class="min-w-0 flex-1">
        <CardTitle class="truncate text-base font-medium">{{ item.description }}</CardTitle>
        <CardDescription>{{ item.category.name }} · {{ frequencyLabel }}</CardDescription>
      </div>
      <Badge :variant="item.active ? 'secondary' : 'outline'">{{ item.active ? 'Ativa' : 'Pausada' }}</Badge>
    </CardHeader>
    <CardContent class="space-y-3">
      <p
        class="text-xl font-semibold tabular-nums"
        :class="item.type === 'income' ? 'text-income' : 'text-expense'"
      >
        {{ item.type === 'income' ? '+' : '-' }}{{ format(item.amount) }}
      </p>
      <div class="flex items-center justify-between text-sm text-muted-foreground">
        <span>Desde {{ new Date(item.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) }}</span>
        <div class="flex gap-1">
          <Button variant="ghost" size="sm" :loading="toggling" @click="handleToggle">
            {{ item.active ? 'Pausar' : 'Reativar' }}
          </Button>
          <Button variant="ghost" size="sm" :loading="deleting" @click="handleDelete">
            Remover
          </Button>
        </div>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { PhArrowsClockwise } from '@phosphor-icons/vue'
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type RecurringItem = {
  id: string
  description: string
  amount: number | string
  type: 'income' | 'expense'
  frequency: 'weekly' | 'monthly' | 'yearly'
  startDate: string
  active: boolean
  category: { name: string }
}

const props = defineProps<{ item: RecurringItem }>()
const emit = defineEmits<{ changed: [] }>()

const { format } = useCurrencyFormat()
const toggling = ref(false)
const deleting = ref(false)

const frequencyLabel = computed(() => ({ weekly: 'Semanal', monthly: 'Mensal', yearly: 'Anual' })[props.item.frequency])

async function handleToggle() {
  toggling.value = true
  try {
    await $fetch(`/api/v1/recurring-transactions/${props.item.id}`, {
      method: 'PATCH',
      body: { active: !props.item.active },
    })
    toast.success(props.item.active ? 'Recorrência pausada' : 'Recorrência reativada')
    emit('changed')
  } catch {
    toast.error('Não foi possível atualizar a recorrência')
  } finally {
    toggling.value = false
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    await $fetch(`/api/v1/recurring-transactions/${props.item.id}`, { method: 'DELETE' })
    toast.success('Recorrência removida')
    emit('changed')
  } catch {
    toast.error('Não foi possível remover a recorrência')
  } finally {
    deleting.value = false
  }
}
</script>
