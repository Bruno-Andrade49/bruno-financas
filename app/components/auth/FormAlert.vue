<template>
  <div
    v-if="message"
    role="alert"
    class="rise-in flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm"
    :class="variant === 'success' ? 'border-status-good/30 bg-status-good/10 text-foreground' : 'border-destructive/30 bg-destructive/10 text-foreground'"
  >
    <PhCheckCircle v-if="variant === 'success'" weight="fill" class="mt-0.5 size-4 shrink-0 text-income" />
    <PhWarningCircle v-else weight="fill" class="mt-0.5 size-4 shrink-0 text-destructive" />
    <span><slot>{{ message }}</slot></span>
  </div>
</template>

<script setup lang="ts">
import { PhCheckCircle, PhWarningCircle } from '@phosphor-icons/vue'

withDefaults(defineProps<{ message?: string | null; variant?: 'error' | 'success' }>(), { variant: 'error' })
</script>
