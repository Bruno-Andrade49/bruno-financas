<!-- Campo de número inteiro (parcelas, dia, porcentagem): só dígitos, com limite. -->
<template>
  <div class="relative min-w-0" :class="$attrs.class">
    <Input
      :id="id"
      :model-value="model ?? ''"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :placeholder="placeholder"
      :aria-invalid="ariaInvalid"
      class="w-full min-w-0 bg-background tabular-nums"
      :class="suffix ? 'pr-9' : ''"
      @input="onInput"
      @keydown="onKeydown"
      @blur="onBlur"
    />
    <span v-if="suffix" class="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-sm text-muted-foreground">{{ suffix }}</span>
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input'

defineOptions({ inheritAttrs: false })
const props = withDefaults(
  defineProps<{ id?: string; min?: number; max: number; suffix?: string; placeholder?: string; ariaInvalid?: boolean }>(),
  { min: 1 },
)
const emit = defineEmits<{ blur: [] }>()
const model = defineModel<number | null | undefined>()

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  const digits = input.value.replace(/\D/g, '').slice(0, String(props.max).length)
  model.value = digits ? Math.min(Number(digits), props.max) : null
  input.value = model.value === null ? '' : String(model.value)
}

function onKeydown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return
  if (!/\d/.test(event.key)) event.preventDefault()
}

// abaixo do mínimo (ex.: 0 parcelas) sobe pro mínimo ao sair do campo
function onBlur() {
  if (model.value !== null && model.value !== undefined && model.value < props.min) model.value = props.min
  emit('blur')
}
</script>
