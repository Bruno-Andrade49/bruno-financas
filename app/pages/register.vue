<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-2xl font-bold tracking-tight">Criar conta</CardTitle>
      <CardDescription>Comece a organizar suas finanças em minutos.</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-2">
          <Label for="name">Nome</Label>
          <Input
            id="name"
            v-model="name"
            v-bind="nameAttrs"
            autocomplete="name"
            placeholder="Como quer ser chamado"
            class="h-11 rounded-xl"
            :aria-invalid="!!errors.name"
            aria-describedby="name-error"
          />
          <FieldError id="name-error" :message="errors.name" />
        </div>

        <div class="space-y-2">
          <Label for="email">E-mail</Label>
          <Input
            id="email"
            v-model="email"
            v-bind="emailAttrs"
            type="email"
            inputmode="email"
            autocomplete="email"
            placeholder="nome@email.com"
            class="h-11 rounded-xl"
            :aria-invalid="!!errors.email"
            aria-describedby="email-error"
          />
          <FieldError id="email-error" :message="errors.email" />
          <p v-if="emailTaken" class="text-sm text-muted-foreground">
            É você?
            <NuxtLink to="/login" class="font-medium text-foreground underline-offset-4 hover:underline">Entre na sua conta</NuxtLink>
            ou
            <NuxtLink to="/forgot-password" class="font-medium text-foreground underline-offset-4 hover:underline">recupere a senha</NuxtLink>.
          </p>
        </div>

        <div class="space-y-2">
          <Label for="password">Senha</Label>
          <PasswordInput
            id="password"
            v-model="password"
            v-bind="passwordAttrs"
            autocomplete="new-password"
            :aria-invalid="!!errors.password"
            aria-describedby="password-error password-strength"
          />
          <FieldError id="password-error" :message="errors.password" />
          <PasswordStrength id="password-strength" :password="password ?? ''" />
        </div>

        <FormAlert :message="formError" />

        <Button ref="submitButton" type="submit" class="press h-11 w-full rounded-xl text-base" :loading="loading">
          {{ loading ? 'Criando sua conta' : 'Criar conta' }}
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
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import FieldError from '@/components/auth/FieldError.vue'
import FormAlert from '@/components/auth/FormAlert.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import PasswordStrength from '@/components/auth/PasswordStrength.vue'
import { authClient } from '@/lib/auth-client'
import { webApplicationJsonLd } from '@/lib/seo'
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

const portal = useFinancePortal()
const submitButton = ref<{ $el?: HTMLElement } | null>(null)
const { field, submit, errors, formError, loading, showServerError } = useAuthForm(registerSchema)
const [name, nameAttrs] = field('name')
const [email, emailAttrs] = field('email')
const [password, passwordAttrs] = field('password')

const emailTaken = ref(false)
watch(email, () => {
  emailTaken.value = false
})

const onSubmit = submit(async (values) => {
  const { error } = await authClient.signUp.email({ name: values.name!, email: values.email!, password: values.password! })
  if (error) {
    const info = showServerError(error)
    emailTaken.value = info.field === 'email' && /já existe/i.test(info.message)
    return
  }
  await portal.enter(submitButton.value?.$el, '/dashboard', 'Preparando seu mundo financeiro')
})
</script>
