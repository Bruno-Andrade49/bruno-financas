<template>
  <Card :class="{ 'border-primary/40': isUnread }">
    <CardHeader class="pb-2">
      <div class="flex items-start justify-between gap-2">
        <div class="space-y-1">
          <p class="text-xs font-medium text-muted-foreground">{{ typeLabel }}</p>
          <CardTitle class="text-base font-medium">{{ insight.title }}</CardTitle>
        </div>
        <Badge v-if="insight.severity === 'warning'" variant="outline" class="text-warning border-warning/40 shrink-0">
          Atenção
        </Badge>
        <Badge v-else variant="secondary" class="shrink-0">Info</Badge>
      </div>
    </CardHeader>
    <CardContent class="space-y-3">
      <CardDescription>{{ insight.description }}</CardDescription>
      <div class="flex items-center justify-between text-xs text-muted-foreground">
        <span>{{ new Date(insight.createdAt).toLocaleDateString('pt-BR') }}</span>
        <Button v-if="isUnread" variant="ghost" size="sm" :loading="marking" @click="handleMarkRead">
          {{ marking ? 'Marcando...' : 'Marcar como lida' }}
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

type Insight = {
  id: string
  type: 'top_expense' | 'category_increase' | 'budget_alert' | 'general'
  severity: 'info' | 'warning'
  title: string
  description: string
  createdAt: string
  readAt: string | null
}

const props = defineProps<{ insight: Insight }>()
const emit = defineEmits<{ read: [] }>()

const marking = ref(false)
const isUnread = computed(() => !props.insight.readAt)

const typeLabel = computed(
  () =>
    ({
      top_expense: 'Maior gasto',
      category_increase: 'Alta de gasto',
      budget_alert: 'Orçamento',
      general: 'Geral',
    })[props.insight.type],
)

async function handleMarkRead() {
  marking.value = true
  try {
    await $fetch(`/api/v1/insights/${props.insight.id}/read`, { method: 'PATCH' })
    emit('read')
  } catch {
    toast.error('Não foi possível marcar como lida')
  } finally {
    marking.value = false
  }
}
</script>
