<template>
  <div class="flex flex-col items-center gap-3 px-4 py-8 text-center">
    <span class="flex size-11 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
      <component :is="icon" class="size-5" />
    </span>
    <p class="max-w-[28ch] text-sm text-muted-foreground">{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{ icon: Component; text: string }>()
</script>
