<template>
  <Card v-if="invalidToken">
    <CardHeader>
      <CardTitle class="text-2xl font-bold tracking-tight">Link inválido ou expirado</CardTitle>
      <CardDescription>Peça um novo link de recuperação de senha.</CardDescription>
    </CardHeader>
    <CardFooter class="justify-center text-sm text-muted-foreground">
      <NuxtLink to="/forgot-password" class="font-medium text-foreground underline-offset-4 hover:underline">
        Pedir novo link
      </NuxtLink>
    </CardFooter>
  </Card>

  <Card v-else-if="done">
    <CardHeader>
      <CardTitle class="text-2xl font-bold tracking-tight">Senha redefinida</CardTitle>
      <CardDescription>Já pode entrar com a nova senha.</CardDescription>
    </CardHeader>
    <CardFooter class="justify-center">
      <Button as-child class="w-full"><NuxtLink to="/login">Ir para o login</NuxtLink></Button>
    </CardFooter>
  </Card>

  <Card v-else>
    <CardHeader>
      <CardTitle class="text-2xl font-bold tracking-tight">Nova senha</CardTitle>
      <CardDescription>Escolha uma nova senha para sua conta.</CardDescription>
    </CardHeader>
    <CardContent>
      <form class="space-y-4" @submit="onSubmit">
        <div class="space-y-2">
          <Label for="password">Nova senha</Label>
          <Input id="password" v-model="password" v-bind="passwordAttrs" type="password" autocomplete="new-password" />
          <p v-if="errors.password" class="text-sm text-destructive">{{ errors.password }}</p>
        </div>
        <Button type="submit" class="press h-11 w-full rounded-xl text-base" :disabled="loading">
          {{ loading ? 'Salvando...' : 'Redefinir senha' }}
        </Button>
      </form>
    </CardContent>
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
import { resetPasswordSchema } from '#shared/schemas/auth'

definePageMeta({ layout: 'auth' })
useSeoMeta({ title: 'Redefinir senha', robots: 'noindex, nofollow' })

const route = useRoute()
const token = computed(() => (typeof route.query.token === 'string' ? route.query.token : ''))
const invalidToken = computed(() => Boolean(route.query.error) || !token.value)

const loading = ref(false)
const done = ref(false)

const { handleSubmit, errors, defineField } = useForm({
  validationSchema: toTypedSchema(resetPasswordSchema),
})
const [password, passwordAttrs] = defineField('password')

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  const { error } = await authClient.resetPassword({
    newPassword: values.password,
    token: token.value,
  })
  loading.value = false

  if (error) {
    toast.error('Não foi possível redefinir a senha. O link pode ter expirado.')
    return
  }

  done.value = true
})
</script>
