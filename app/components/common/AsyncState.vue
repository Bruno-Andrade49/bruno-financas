<template>
  <div v-if="pending" class="space-y-2.5" aria-busy="true" aria-label="Carregando">
    <div class="h-12 animate-pulse rounded-xl bg-muted" />
    <div class="h-12 animate-pulse rounded-xl bg-muted [animation-delay:120ms]" />
    <div class="h-12 animate-pulse rounded-xl bg-muted [animation-delay:240ms]" />
  </div>
  <div v-else-if="error" role="alert" class="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
    {{ errorMessage }}
  </div>
  <slot v-else-if="isEmpty && $slots.empty" name="empty" />
  <div v-else-if="isEmpty" class="rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
    {{ emptyMessage }}
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    pending?: boolean
    error?: unknown
    isEmpty?: boolean
    emptyMessage?: string
  }>(),
  {
    pending: false,
    error: undefined,
    isEmpty: false,
    emptyMessage: 'Nada por aqui ainda.',
  },
)

const errorMessage = computed(() => {
  if (!props.error) return ''
  const err = props.error as { data?: { error?: { message?: string } } }
  return err.data?.error?.message ?? 'Não foi possível carregar os dados. Tente novamente.'
})
</script>
