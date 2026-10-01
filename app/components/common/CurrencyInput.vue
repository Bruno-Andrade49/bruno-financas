<!--
  Campo de dinheiro com máscara de R$. Só aceita dígitos e preenche da direita
  pra esquerda pelos centavos, como app de banco: 1, 2, 5 → 0,01 → 0,12 → 1,25.
  O v-model é um número em reais (ou null quando vazio).
-->
<template>
  <div class="relative min-w-0" :class="$attrs.class">
    <span class="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
    <Input
      :id="id"
      :model-value="display"
      type="text"
      inputmode="numeric"
      autocomplete="off"
      :placeholder="placeholder"
      :aria-invalid="ariaInvalid"
      class="w-full min-w-0 bg-background pl-10 text-right tabular-nums"
      @input="onInput"
      @keydown="onKeydown"
      @paste="onPaste"
      @blur="$emit('blur')"
    />
  </div>
</template>

<script setup lang="ts">
import { Input } from '@/components/ui/input'
import { MAX_AMOUNT } from '#shared/schemas/money'

defineOptions({ inheritAttrs: false })
withDefaults(defineProps<{ id?: string; placeholder?: string; ariaInvalid?: boolean }>(), { placeholder: '0,00' })
defineEmits<{ blur: [] }>()

const model = defineModel<number | null | undefined>()

const MAX_CENTS = Math.round(MAX_AMOUNT * 100)
const formatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

const display = computed(() => (model.value === null || model.value === undefined || Number.isNaN(model.value) ? '' : formatter.format(model.value)))

function fromDigits(digits: string): number | null {
  const clean = digits.replace(/\D/g, '').replace(/^0+/, '')
  if (!clean) return null
  return Math.min(Number(clean), MAX_CENTS) / 100
}

function onInput(event: Event) {
  const input = event.target as HTMLInputElement
  model.value = fromDigits(input.value)
  // reescreve o campo com a máscara e deixa o cursor no fim
  input.value = display.value
  requestAnimationFrame(() => input.setSelectionRange(input.value.length, input.value.length))
}

// bloqueia letras e símbolos já na tecla. Teclas especiais (e o "Unidentified"
// que alguns teclados de Android mandam) passam, e o onInput limpa depois.
function onKeydown(event: KeyboardEvent) {
  if (event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return
  if (!/\d/.test(event.key)) event.preventDefault()
}

// colar "1.234,56", "1.234,5" ou "R$ 1234": aproveita os dígitos e entende os centavos
function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const text = (event.clipboardData?.getData('text') ?? '').trim()
  const cents = text.match(/[.,](\d{1,2})$/)?.[1]
  const whole = (cents ? text.slice(0, -cents.length - 1) : text).replace(/\D/g, '')
  model.value = fromDigits(`${whole}${(cents ?? '').padEnd(2, '0')}`)
}
</script>
