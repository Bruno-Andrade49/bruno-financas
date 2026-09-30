<template>
  <div class="space-y-2.5" aria-live="polite">
    <div class="flex items-center gap-3">
      <div class="grid flex-1 grid-cols-4 gap-1" aria-hidden="true">
        <span
          v-for="i in 4"
          :key="i"
          class="h-1.5 rounded-full transition-colors duration-300"
          :class="i <= strength.score ? barColor : 'bg-muted'"
        />
      </div>
      <span class="w-20 text-right text-xs font-semibold" :class="textColor">
        <span class="sr-only">Força da senha: </span>{{ password ? (strength.common ? 'Muito comum' : strength.label) : '' }}
      </span>
    </div>

    <ul class="grid gap-1 text-xs sm:grid-cols-2">
      <li
        v-for="check in strength.checks"
        :key="check.id"
        class="flex items-center gap-1.5 transition-colors"
        :class="check.ok ? 'text-income' : 'text-muted-foreground'"
      >
        <PhCheckCircle v-if="check.ok" weight="fill" class="size-3.5 shrink-0" />
        <PhCircle v-else class="size-3.5 shrink-0" />
        <span>{{ check.label }}<span v-if="!check.required" class="opacity-70"> (recomendado)</span></span>
        <span class="sr-only">{{ check.ok ? ', ok' : ', pendente' }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { PhCheckCircle, PhCircle } from '@phosphor-icons/vue'
import { passwordStrength } from '#shared/password-strength'

const props = defineProps<{ password: string }>()

const strength = computed(() => passwordStrength(props.password ?? ''))

const barColor = computed(() => ['bg-status-bad', 'bg-status-bad', 'bg-warning', 'bg-status-good', 'bg-status-good'][strength.value.score])
const textColor = computed(() => ['text-expense', 'text-expense', 'text-warning', 'text-income', 'text-income'][strength.value.score])
</script>
