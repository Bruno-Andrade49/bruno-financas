<template>
  <Card>
    <CardHeader>
      <CardTitle class="text-2xl font-bold tracking-tight">Entrar</CardTitle>
      <CardDescription>Acesse sua visão financeira.</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" novalidate @submit="onSubmit">
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
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label for="password">Senha</Label>
            <NuxtLink to="/forgot-password" class="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Esqueceu a senha?
            </NuxtLink>
          </div>
          <PasswordInput
            id="password"
            v-model="password"
            v-bind="passwordAttrs"
            autocomplete="current-password"
            :aria-invalid="!!errors.password"
            aria-describedby="password-error"
          />
          <FieldError id="password-error" :message="errors.password" />
        </div>

        <FormAlert :message="formError" />

        <Button ref="submitButton" type="submit" class="press h-11 w-full rounded-xl text-base" :loading="loading">
          {{ loading ? 'Entrando' : 'Entrar' }}
        </Button>
      </form>
    </CardContent>
    <CardFooter class="justify-center text-sm text-muted-foreground">
      Ainda não tem conta?
      <NuxtLink to="/register" class="ml-1 font-medium text-foreground underline-offset-4 hover:underline">
        Criar conta
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
import { authClient } from '@/lib/auth-client'
import { webApplicationJsonLd } from '@/lib/seo'
import { loginSchema } from '#shared/schemas/auth'

definePageMeta({ layout: 'auth', middleware: 'guest' })
const description = 'Entre no Bruno Finanças e veja seu saldo do mês, seus orçamentos e suas metas. Controle financeiro pessoal e gratuito.'
useSeoMeta({
  title: 'Entrar',
  description,
  ogDescription: description,
  twitterDescription: description,
  ogTitle: 'Entre na sua conta | Bruno Finanças',
})
useHead({
  script: [{ type: 'application/ld+json', innerHTML: JSON.stringify(webApplicationJsonLd(String(useRuntimeConfig().public.siteUrl))) }],
})

const portal = useFinancePortal()
const submitButton = ref<{ $el?: HTMLElement } | null>(null)
const { field, submit, errors, formError, loading, showServerError } = useAuthForm(loginSchema)
const [email, emailAttrs] = field('email')
const [password, passwordAttrs] = field('password')

const onSubmit = submit(async (values) => {
  const { error } = await authClient.signIn.email({ email: values.email!, password: values.password! })
  if (error) {
    showServerError(error)
    return
  }
  await portal.enter(submitButton.value?.$el, '/dashboard', 'Entrando no seu mundo financeiro')
})
</script>
