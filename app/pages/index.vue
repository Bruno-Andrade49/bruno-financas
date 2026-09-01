<template>
  <div />
</template>

<script setup lang="ts">
// Landing simples: manda para /dashboard (autenticado) ou /login.
definePageMeta({ middleware: 'index-redirect' })
</script>
