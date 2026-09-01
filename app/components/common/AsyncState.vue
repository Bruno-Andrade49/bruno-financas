<!--
  Padrão único de loading/error/empty usado em qualquer tela que consome
  useFetch/useAsyncData (ARCHITECTURE.md, seção G) — evita cada página
  reinventar seu próprio spinner e mensagem de erro genérica.
-->
<template>
  <div v-if="pending" class="space-y-2">
    <div class="h-10 animate-pulse rounded-md bg-muted" />
    <div class="h-10 animate-pulse rounded-md bg-muted" />
    <div class="h-10 animate-pulse rounded-md bg-muted" />
  </div>
  <div v-else-if="error" class="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
    {{ errorMessage }}
  </div>
  <div v-else-if="isEmpty" class="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">
    <slot name="empty">{{ emptyMessage }}</slot>
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
