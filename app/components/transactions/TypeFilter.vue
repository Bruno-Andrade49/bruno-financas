<template>
  <div class="inline-flex rounded-xl bg-muted p-1 text-sm" role="radiogroup" aria-label="Filtrar por tipo">
    <button
      v-for="option in options"
      :key="option.label"
      type="button"
      role="radio"
      :aria-checked="model === option.value"
      class="press rounded-lg px-3 py-1 font-medium transition-all duration-200"
      :class="model === option.value ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'"
      @click="model = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
const model = defineModel<'income' | 'expense' | null>({ default: null })

const options = [
  { label: 'Tudo', value: null },
  { label: 'Entradas', value: 'income' as const },
  { label: 'Saídas', value: 'expense' as const },
]
</script>
