<template>
  <Card>
    <CardHeader>
      <CardTitle>Recuperar senha</CardTitle>
      <CardDescription>
        Envio de e-mail de recuperação ainda não está configurado neste ambiente
        (depende de um provedor de e-mail configurado, veja ARCHITECTURE.md, seção 7).
      </CardDescription>
    </CardHeader>
    <CardFooter class="justify-center text-sm text-muted-foreground">
      <NuxtLink to="/login" class="font-medium text-foreground underline-offset-4 hover:underline">
        Voltar para o login
      </NuxtLink>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

definePageMeta({ layout: 'auth' })
</script>
