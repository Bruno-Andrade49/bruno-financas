<template>
  <Card v-if="!sent">
    <CardHeader>
      <CardTitle class="text-2xl font-bold tracking-tight">Recuperar senha</CardTitle>
      <CardDescription>Informe seu e-mail e mandamos um link para redefinir a senha.</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit="onSubmit">
        <div class="space-y-2">
          <Label for="email">E-mail</Label>
          <Input id="email" v-model="email" v-bind="emailAttrs" type="email" autocomplete="email" />
          <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
        </div>
        <Button type="submit" class="press h-11 w-full rounded-xl text-base" :disabled="loading">
          {{ loading ? 'Enviando...' : 'Enviar link de recuperação' }}
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
        Se existir uma conta com esse e-mail, enviamos um link de recuperação. Ele expira em 1 hora.
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
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { forgotPasswordSchema } from '#shared/schemas/auth'

definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Recuperar senha', robots: 'noindex' })

const loading = ref(false)
const sent = ref(false)

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(forgotPasswordSchema),
})
const [email, emailAttrs] = defineField('email')

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  const { error } = await authClient.requestPasswordReset({
    email: values.email,
    redirectTo: '/reset-password',
  })
  loading.value = false

  if (error) {
    toast.error('Não foi possível enviar o e-mail agora. Tente de novo em instantes.')
    return
  }

  sent.value = true
})
</script>
