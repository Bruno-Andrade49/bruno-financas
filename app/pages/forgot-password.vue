<template>
  <Card v-if="!sent">
    <CardHeader>
      <CardTitle class="text-2xl font-bold tracking-tight">Recuperar senha</CardTitle>
      <CardDescription>Informe seu e-mail e mandamos um link para redefinir a senha.</CardDescription>
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

        <FormAlert :message="formError" />

        <Button type="submit" class="press h-11 w-full rounded-xl text-base" :loading="loading">
          {{ loading ? 'Enviando' : 'Enviar link de recuperação' }}
        </Button>
      </form>
    </CardContent>
    <CardFooter class="justify-center text-sm text-muted-foreground">
      <NuxtLink to="/login" class="font-medium text-foreground underline-offset-4 hover:underline">
        Voltar para o login
      </NuxtLink>
    </CardFooter>
  </Card>

  <Card v-else>
    <CardHeader>
      <CardTitle class="text-2xl font-bold tracking-tight">Verifique seu e-mail</CardTitle>
      <CardDescription>
        Se existir uma conta com <span class="font-medium text-foreground">{{ sentTo }}</span>, enviamos um link de
        recuperação. Ele vale por 1 hora. Confira também a caixa de spam.
      </CardDescription>
    </CardHeader>
    <CardFooter class="flex-col gap-3 text-sm text-muted-foreground">
      <Button variant="outline" class="press w-full rounded-xl" @click="sent = false">Usar outro e-mail</Button>
      <NuxtLink to="/login" class="font-medium text-foreground underline-offset-4 hover:underline">
        Voltar para o login
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
import { authClient } from '@/lib/auth-client'
import { forgotPasswordSchema } from '#shared/schemas/auth'

definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Recuperar senha', robots: 'noindex' })

const sent = ref(false)
const sentTo = ref('')

const { field, submit, errors, formError, loading, showServerError } = useAuthForm(forgotPasswordSchema)
const [email, emailAttrs] = field('email')

// A resposta é a mesma exista ou não a conta, pra não revelar quem é cadastrado.
const onSubmit = submit(async (values) => {
  const { error } = await authClient.requestPasswordReset({ email: values.email!, redirectTo: '/reset-password' })
  if (error) {
    showServerError(error)
    return
  }
  sentTo.value = values.email!
  sent.value = true
})
</script>
