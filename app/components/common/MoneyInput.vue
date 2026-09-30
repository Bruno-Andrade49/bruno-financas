<template>
  <div class="relative" :class="$attrs.class">
    <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
    <Input
      v-model="model"
      type="text"
      inputmode="decimal"
      autocomplete="off"
      :placeholder="placeholder ?? '0,00'"
      class="bg-background pl-9 text-right tabular-nums"
    />
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input'

defineOptions({ inheritAttrs: false })
defineProps<{ placeholder?: string }>()
const model = defineModel<string>({ default: '' })
</script>
