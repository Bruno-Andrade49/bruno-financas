<template>
  <span class="inline-flex items-center gap-2.5">
    <span
      class="flex shrink-0 items-center justify-center rounded-[28%] transition-colors dark:bg-white dark:shadow-[0_0_0_1px_oklch(1_0_0/0.1)]"
      :class="size === 'lg' ? 'size-14 dark:p-2' : 'size-9 dark:p-1.5'"
    >
      <img src="/logo.png" alt="" class="size-full object-contain" width="56" height="56">
    </span>
    <span v-if="withName" class="leading-none" :class="size === 'lg' ? 'text-2xl' : 'text-[1.05rem]'">
      <span class="font-bold tracking-tight">Bruno</span>
      <span class="font-medium tracking-tight text-income">Finanças</span>
    </span>
    <span v-else class="sr-only">Bruno Finanças</span>
  </span>
</template>

<script setup lang="ts">
withDefaults(defineProps<{ size?: 'md' | 'lg'; withName?: boolean }>(), {
  size: 'md',
  withName: true,
})
</script>
