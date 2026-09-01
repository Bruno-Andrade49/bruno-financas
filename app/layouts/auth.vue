<template>
  <div class="flex min-h-svh items-center justify-center bg-muted/30 px-4 py-10">
    <div class="w-full max-w-sm">
      <div class="mb-8 flex flex-col items-center gap-3 text-center">
        <NuxtLink to="/" class="flex size-11 items-center justify-center rounded-2xl bg-primary text-lg font-bold text-primary-foreground">
          B
        </NuxtLink>
        <NuxtLink to="/" class="text-base font-semibold tracking-tight text-foreground">
          Bruno Finanças
        </NuxtLink>
      </div>
      <slot />
    </div>
  </div>
</template>
