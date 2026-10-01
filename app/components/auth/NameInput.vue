<!-- Nome de pessoa: só letras (com acento), espaço, apóstrofo e hífen. -->
<template>
  <Input v-bind="$attrs" :model-value="model ?? ''" autocapitalize="words" @input="onInput" />
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input'

defineOptions({ inheritAttrs: false })
const model = defineModel<string>()

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  const clean = input.value.replace(/[^\p{L}\s'-]/gu, '').replace(/\s{2,}/g, ' ').slice(0, 100)
  model.value = clean
  if (input.value !== clean) input.value = clean
}
</script>
