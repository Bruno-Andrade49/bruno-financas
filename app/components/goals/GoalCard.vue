<template>
  <Card>
    <CardHeader class="pb-2">
      <div class="flex items-center justify-between">
        <CardTitle class="text-base font-medium">{{ goal.name }}</CardTitle>
        <Badge :variant="badgeVariant">{{ statusLabel }}</Badge>
      </div>
      <CardDescription>
        {{ format(goal.currentAmount) }} de {{ format(goal.targetAmount) }}
      </CardDescription>
    </CardHeader>
    <CardContent class="space-y-4">
      <Progress :model-value="goal.progressPct" />

      <div class="grid grid-cols-2 gap-2 text-sm">
        <div>
          <p class="text-muted-foreground">Prazo</p>
          <p class="font-medium" :class="{ 'text-destructive': goal.isOverdue }">
            {{ new Date(goal.targetDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) }}
          </p>
        </div>
        <div>
          <p class="text-muted-foreground">Sugestão/mês</p>
          <p class="font-medium">
            {{ goal.status === 'completed' ? '-' : format(goal.suggestedMonthlyContribution) }}
          </p>
        </div>
      </div>

      <form v-if="goal.status === 'active'" class="flex items-center gap-2" @submit.prevent="handleContribute">
        <Input v-model="contributionAmount" type="number" step="0.01" min="0" placeholder="Valor do aporte" class="h-9" />
        <Button type="submit" size="sm" variant="secondary" :disabled="contributing">
          {{ contributing ? '...' : 'Aportar' }}
        </Button>
      </form>

      <div class="flex justify-end">
        <Button variant="ghost" size="sm" :disabled="deleting" @click="handleDelete">
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
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'

type GoalWithProgress = {
  id: string
  name: string
  targetAmount: number | string
  currentAmount: number | string
  targetDate: string
  status: 'active' | 'completed' | 'abandoned'
  progressPct: number
  suggestedMonthlyContribution: number
  isOverdue: boolean
}

const props = defineProps<{ goal: GoalWithProgress }>()
const emit = defineEmits<{ changed: [] }>()

const { format } = useCurrencyFormat()
const contributionAmount = ref('')
const contributing = ref(false)
const deleting = ref(false)

const statusLabel = computed(() => ({ active: 'Ativa', completed: 'Concluída', abandoned: 'Abandonada' })[props.goal.status])
const badgeVariant = computed(() => ({ active: 'secondary', completed: 'default', abandoned: 'outline' })[props.goal.status] as 'secondary' | 'default' | 'outline')

async function handleContribute() {
  const amount = Number(contributionAmount.value)
  if (!amount || amount <= 0) {
    toast.error('Informe um valor de aporte válido')
    return
  }

  contributing.value = true
  try {
    await $fetch(`/api/v1/goals/${props.goal.id}/contribute`, { method: 'POST', body: { amount } })
    toast.success('Aporte registrado')
    contributionAmount.value = ''
    emit('changed')
  } catch {
    toast.error('Não foi possível registrar o aporte')
  } finally {
    contributing.value = false
  }
}

async function handleDelete() {
  deleting.value = true
  try {
    await $fetch(`/api/v1/goals/${props.goal.id}`, { method: 'DELETE' })
    toast.success('Meta removida')
    emit('changed')
  } catch {
    toast.error('Não foi possível remover a meta')
  } finally {
    deleting.value = false
  }
}
</script>
