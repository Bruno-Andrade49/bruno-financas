<template>
  <p v-if="message" :id="id" class="flex items-start gap-1.5 text-sm text-destructive" role="alert">
    <PhWarningCircle weight="fill" class="mt-0.5 size-4 shrink-0" />
    <span>{{ message }}</span>
  </p>
</template>

<script setup lang="ts">
import { PhWarningCircle } from '@phosphor-icons/vue'

defineProps<{ message?: string; id?: string }>()
</script>
