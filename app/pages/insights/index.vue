<template>
  <div class="rise-in space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Insights</h1>
        <p class="text-sm text-muted-foreground">Leituras automáticas sobre os seus gastos deste mês.</p>
      </div>
      <Button :disabled="generating" @click="handleGenerate">
        <PhArrowsClockwise class="size-4" :class="{ 'animate-spin': generating }" />
        {{ generating ? 'Gerando...' : 'Gerar insights' }}
      </Button>
    </div>

    <AsyncState
      :pending="pending"
      :error="error"
      :is-empty="(insights?.length ?? 0) === 0"
      empty-message='Nenhum insight ainda. Clique em "Gerar insights" para analisar o mês atual.'
    >
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <InsightCard v-for="insight in insights" :key="insight.id" :insight="insight" @read="refresh" />
      </div>
    </AsyncState>
  </div>
</template>

<script setup lang="ts">
import { PhArrowsClockwise } from '@phosphor-icons/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import InsightCard from '@/components/insights/InsightCard.vue'

definePageMeta({ layout: 'app', middleware: 'auth' })
useHead({ title: 'Insights' })

const { data: insights, pending, error, refresh } = await useFetch('/api/v1/insights')
const generating = ref(false)

async function handleGenerate() {
  generating.value = true
  try {
    await $fetch('/api/v1/insights/generate', { method: 'POST' })
    toast.success('Insights atualizados')
    await refresh()
  } catch {
    toast.error('Não foi possível gerar os insights')
  } finally {
    generating.value = false
  }
}
</script>
