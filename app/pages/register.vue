<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-2xl font-bold tracking-tight">Criar conta</CardTitle>
      <CardDescription>Comece a organizar suas finanças em minutos.</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit="onSubmit">
        <div class="space-y-2">
          <Label for="name">Nome</Label>
          <Input id="name" v-model="name" v-bind="nameAttrs" autocomplete="name" />
          <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
        </div>
        <div class="space-y-2">
          <Label for="email">E-mail</Label>
          <Input id="email" v-model="email" v-bind="emailAttrs" type="email" autocomplete="email" />
          <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
        </div>
        <div class="space-y-2">
          <Label for="password">Senha</Label>
          <Input id="password" v-model="password" v-bind="passwordAttrs" type="password" autocomplete="new-password" />
          <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
        </div>
        <Button type="submit" class="press h-11 w-full rounded-xl text-base" :disabled="loading">
          {{ loading ? 'Criando conta...' : 'Criar conta' }}
        </Button>
      </form>
    </CardContent>
    <CardFooter class="justify-center text-sm text-muted-foreground">
      Já tem conta?
      <NuxtLink to="/login" class="ml-1 font-medium text-foreground underline-offset-4 hover:underline">
        Entrar
      </NuxtLink>
    </CardFooter>
  </Card>
</template>

<script setup lang="ts">
import { webApplicationJsonLd } from '@/lib/seo'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { registerSchema } from '#shared/schemas/auth'

definePageMeta({ layout: 'auth', middleware: 'guest' })
const description = 'Crie sua conta grátis no Bruno Finanças: lance gastos em segundos, controle orçamentos e metas e descubra se uma compra parcelada vale a pena.'
useSeoMeta({
  title: 'Criar conta grátis',
  description,
  ogDescription: description,
  twitterDescription: description,
  ogTitle: 'Crie sua conta grátis | Bruno Finanças',
})
useHead({
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(webApplicationJsonLd(String(useRuntimeConfig().public.siteUrl))) }],
})

const router = useRouter()
const loading = ref(false)

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(registerSchema),
})
const [name, nameAttrs] = defineField('name')
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  const { error } = await authClient.signUp.email(values)
  loading.value = false

  if (error) {
    toast.error(error.message ?? 'Não foi possível criar a conta')
    return
  }

  toast.success('Conta criada com sucesso')
  await router.push('/dashboard')
})
</script>
