<template>
  <Card>
    <CardHeader class="pb-2">
      <div class="flex items-center justify-between">
        <CardTitle class="text-base font-medium">{{ budget.category.name }}</CardTitle>
        <Badge :variant="badgeVariant">{{ statusLabel }}</Badge>
      </div>
      <CardDescription>
        {{ format(budget.spent) }} de {{ format(budget.limitAmount) }}
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-3">
      <Progress :model-value="Math.min(budget.progressPct, 100)" :class="progressColorClass" />
      <div class="flex items-center justify-between text-sm text-muted-foreground">
        <span>{{ budget.progressPct }}% do limite</span>
        <Button variant="ghost" size="sm" :loading="deleting" @click="handleDelete">
          {{ deleting ? 'Removendo...' : 'Remover' }}
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

type BudgetWithProgress = {
  id: string
  limitAmount: number | string
  spent: number
  progressPct: number
  status: 'ok' | 'warning' | 'exceeded'
  category: { name: string }
}

const props = defineProps<{ budget: BudgetWithProgress }>()
const emit = defineEmits<{ deleted: [] }>()

const { format } = useCurrencyFormat()
const deleting = ref(false)

const statusLabel = computed(() => ({ ok: 'Em dia', warning: 'Perto do limite', exceeded: 'Estourado' })[props.budget.status])
const badgeVariant = computed(() => ({ ok: 'secondary', warning: 'outline', exceeded: 'destructive' })[props.budget.status] as 'secondary' | 'outline' | 'destructive')
const progressColorClass = computed(
  () => ({ ok: '', warning: '[&>div]:bg-warning', exceeded: '[&>div]:bg-destructive' })[props.budget.status],
)

async function handleDelete() {
  deleting.value = true
  try {
    await $fetch(`/api/v1/budgets/${props.budget.id}`, { method: 'DELETE' })
    toast.success('Orçamento removido')
    emit('deleted')
  } catch {
    toast.error('Não foi possível remover o orçamento')
  } finally {
    deleting.value = false
  }
}
</script>
