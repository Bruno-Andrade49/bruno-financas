<template>
  <Card v-if="invalidToken">
    <CardHeader>
      <CardTitle class="text-2xl font-bold tracking-tight">Link inválido ou expirado</CardTitle>
      <CardDescription>Os links de recuperação valem por 1 hora e só podem ser usados uma vez. Peça um novo.</CardDescription>
    </CardHeader>
    <CardFooter>
      <Button as-child class="press h-11 w-full rounded-xl"><NuxtLink to="/forgot-password">Pedir novo link</NuxtLink></Button>
    </CardFooter>
  </Card>

  <Card v-else-if="done">
    <CardHeader>
      <CardTitle class="text-2xl font-bold tracking-tight">Senha redefinida</CardTitle>
      <CardDescription>Pronto. Já pode entrar com a nova senha.</CardDescription>
    </CardHeader>
    <CardFooter>
      <Button as-child class="press h-11 w-full rounded-xl"><NuxtLink to="/login">Ir para o login</NuxtLink></Button>
    </CardFooter>
  </Card>

  <Card v-else>
    <CardHeader>
      <CardTitle class="text-2xl font-bold tracking-tight">Nova senha</CardTitle>
      <CardDescription>Escolha uma nova senha para sua conta.</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" novalidate @submit="onSubmit">
        <div class="space-y-2">
          <Label for="password">Nova senha</Label>
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

        <Button type="submit" class="press h-11 w-full rounded-xl text-base" :loading="loading">
          {{ loading ? 'Salvando' : 'Redefinir senha' }}
        </Button>
      </form>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import FieldError from '@/components/auth/FieldError.vue'
import FormAlert from '@/components/auth/FormAlert.vue'
import PasswordInput from '@/components/auth/PasswordInput.vue'
import PasswordStrength from '@/components/auth/PasswordStrength.vue'
import { authClient } from '@/lib/auth-client'
import { resetPasswordSchema } from '#shared/schemas/auth'

definePageMeta({ layout: 'auth' })
// link com token de uso único, não deve ser indexado
useSeoMeta({ title: 'Redefinir senha', robots: 'noindex, nofollow' })

const route = useRoute()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const tokenRejected = ref(false)
const invalidToken = computed(() => Boolean(route.query.error) || !token.value || tokenRejected.value)
const done = ref(false)

const { field, submit, errors, formError, loading, showServerError } = useAuthForm(resetPasswordSchema)
const [password, passwordAttrs] = field('password')

const onSubmit = submit(async (values) => {
  const { error } = await authClient.resetPassword({ newPassword: values.password!, token: token.value })
  if (error) {
    if (error.code === 'INVALID_TOKEN' || error.code === 'TOKEN_EXPIRED') {
      tokenRejected.value = true
      return
    }
    showServerError(error)
    return
  }
  done.value = true
})
</script>
