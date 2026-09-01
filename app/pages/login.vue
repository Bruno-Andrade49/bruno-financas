<template>
  <Card>
    <CardHeader>
      <CardTitle>Entrar</CardTitle>
      <CardDescription>Acesse sua visão financeira.</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit="onSubmit">
        <div class="space-y-2">
          <Label for="email">E-mail</Label>
          <Input id="email" v-model="email" v-bind="emailAttrs" type="email" autocomplete="email" />
          <p v-if="errors.email" class="text-sm text-destructive">{{ errors.email }}</p>
        </div>
        <div class="space-y-2">
          <div class="flex items-center justify-between">
            <Label for="password">Senha</Label>
            <NuxtLink to="/forgot-password" class="text-xs text-muted-foreground underline-offset-4 hover:underline">
              Esqueceu a senha?
            </NuxtLink>
          </div>
          <Input id="password" v-model="password" v-bind="passwordAttrs" type="password" autocomplete="current-password" />
          <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
        </div>
        <Button type="submit" class="w-full" :disabled="loading">
          {{ loading ? 'Entrando...' : 'Entrar' }}
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
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authClient } from '@/lib/auth-client'
import { loginSchema } from '#shared/schemas/auth'

definePageMeta({ layout: 'auth', middleware: 'guest' })

const router = useRouter()
const loading = ref(false)

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(loginSchema),
})
const [email, emailAttrs] = defineField('email')
const [password, passwordAttrs] = defineField('password')

// Mensagem genérica de propósito — não revelar se o e-mail existe ou não
// (ARCHITECTURE.md, seção H, mitigação de credential stuffing).
const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  const { error } = await authClient.signIn.email(values)
  loading.value = false

  if (error) {
    toast.error('E-mail ou senha incorretos')
    return
  }

  await router.push('/dashboard')
})
</script>
