<template>
  <div class="rise-in space-y-8">
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Insights</h1>
        <p class="text-sm text-muted-foreground">Leituras automáticas sobre os seus gastos deste mês.</p>
      </div>

      <div class="relative">
        <Button class="press rounded-xl" :disabled="generating || cooldown > 0" @click="handleGenerate">
          <PhArrowsClockwise class="size-4" :class="{ 'animate-spin': generating }" />
          <template v-if="generating">Gerando</template>
          <template v-else-if="cooldown > 0">Aguarde {{ cooldown }}s</template>
          <template v-else>Gerar insights</template>
        </Button>

        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 -translate-y-1"
          leave-active-class="transition duration-150 ease-in"
          leave-to-class="opacity-0 -translate-y-1"
        >
          <div
            v-if="feedback"
            role="status"
            class="absolute top-full left-0 z-20 mt-2.5 flex w-max max-w-[18rem] sm:right-0 sm:left-auto items-start gap-2 rounded-xl px-3 py-2 text-sm font-medium shadow-lg"
            :class="feedback.ok ? 'bg-foreground text-background' : 'bg-destructive text-white'"
          >
            <span
              class="absolute -top-1 left-6 size-2.5 rotate-45 sm:right-6 sm:left-auto"
              :class="feedback.ok ? 'bg-foreground' : 'bg-destructive'"
              aria-hidden="true"
            />
            <PhCheckCircle v-if="feedback.ok" weight="fill" class="mt-0.5 size-4 shrink-0 text-income" />
            <PhWarningCircle v-else weight="fill" class="mt-0.5 size-4 shrink-0" />
            <span>{{ feedback.message }}</span>
          </div>
        </Transition>
      </div>
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
import { PhArrowsClockwise, PhCheckCircle, PhWarningCircle } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import InsightCard from '@/components/insights/InsightCard.vue'

definePageMeta({ layout: 'app', middleware: 'auth' })
useHead({ title: 'Insights' })

const COOLDOWN_SECONDS = 10

const { data: insights, pending, error, refresh } = await useFetch('/api/v1/insights')
const generating = ref(false)
const cooldown = ref(0)
const feedback = ref<{ ok: boolean; message: string } | null>(null)

let feedbackTimer: ReturnType<typeof setTimeout> | undefined
let cooldownTimer: ReturnType<typeof setInterval> | undefined

function showFeedback(ok: boolean, message: string) {
  clearTimeout(feedbackTimer)
  feedback.value = { ok, message }
  feedbackTimer = setTimeout(() => (feedback.value = null), ok ? 3000 : 5000)
}

function startCooldown(seconds: number) {
  clearInterval(cooldownTimer)
  cooldown.value = seconds
  cooldownTimer = setInterval(() => {
    cooldown.value--
    if (cooldown.value <= 0) clearInterval(cooldownTimer)
  }, 1000)
}

async function handleGenerate() {
  generating.value = true
  feedback.value = null
  try {
    await $fetch('/api/v1/insights/generate', { method: 'POST' })
    await refresh()
    showFeedback(true, 'Insights atualizados')
    startCooldown(COOLDOWN_SECONDS)
  } catch (err) {
    const fetchError = err as { statusCode?: number; data?: { error?: { message?: string } } }
    showFeedback(false, fetchError.data?.error?.message ?? 'Não foi possível gerar os insights agora')
    if (fetchError.statusCode === 429) startCooldown(COOLDOWN_SECONDS)
  } finally {
    generating.value = false
  }
}

onBeforeUnmount(() => {
  clearTimeout(feedbackTimer)
  clearInterval(cooldownTimer)
})
</script>
