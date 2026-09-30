<template>
  <div class="space-y-8">
    <div class="rise-in">
      <h1 class="text-3xl font-bold tracking-tight">Configurações</h1>
      <p class="mt-1 text-sm text-muted-foreground">Aparência e dados da sua conta.</p>
    </div>

    <Card class="rise-in" style="--i: 1">
      <CardHeader>
        <CardTitle class="text-base font-semibold">Aparência</CardTitle>
        <CardDescription>O tema também pode ser trocado pela moeda no topo da tela.</CardDescription>
      </CardHeader>
      <CardContent>
        <ClientOnly>
          <div class="grid grid-cols-3 gap-3" role="radiogroup" aria-label="Tema">
            <button
              v-for="option in options"
              :key="option.value"
              type="button"
              role="radio"
              :aria-checked="mode === option.value"
              class="press group rounded-2xl border-2 p-2 text-left transition-colors"
              :class="mode === option.value ? 'border-primary' : 'border-transparent hover:border-border'"
              @click="(event) => select(option.value, event)"
            >
              <span
                class="relative block aspect-[4/3] overflow-hidden rounded-xl ring-1 ring-black/5"
                :class="option.preview"
              >
                <span class="absolute inset-x-2 top-2 h-2 rounded-full" :class="option.bar" />
                <span class="absolute top-6 left-2 h-6 w-1/2 rounded-md bg-[#1f3b73]" />
                <span class="absolute right-2 bottom-2 left-2 h-3 rounded-md" :class="option.bar" />
              </span>
              <span class="mt-2 flex items-center gap-1.5 px-1 text-sm font-medium">
                <component :is="option.icon" class="size-4 text-muted-foreground" />
                {{ option.label }}
              </span>
            </button>
          </div>
          <template #fallback>
            <div class="h-32 animate-pulse rounded-2xl bg-muted" />
          </template>
        </ClientOnly>
      </CardContent>
    </Card>

    <Card class="rise-in" style="--i: 2">
      <CardHeader>
        <CardTitle class="text-base font-semibold">Conta</CardTitle>
      </CardHeader>
      <CardContent>
        <dl class="divide-y text-sm">
          <div class="flex items-center justify-between gap-4 py-3 first:pt-0">
            <dt class="text-muted-foreground">Nome</dt>
            <dd class="truncate font-medium">{{ user?.name ?? 'Não informado' }}</dd>
          </div>
          <div class="flex items-center justify-between gap-4 py-3">
            <dt class="text-muted-foreground">E-mail</dt>
            <dd class="truncate font-medium">{{ user?.email ?? 'Não informado' }}</dd>
          </div>
          <div class="flex items-center justify-between gap-4 pt-3">
            <dt class="text-muted-foreground">Senha</dt>
            <dd>
              <NuxtLink to="/forgot-password" class="font-medium text-primary underline-offset-4 hover:underline">
                Redefinir por e-mail
              </NuxtLink>
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { PhDesktop, PhMoonStars, PhSun } from '@phosphor-icons/vue'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useSession } from '@/lib/auth-client'
import type { ThemeMode } from '@/composables/useThemeMode'

definePageMeta({ layout: 'app', middleware: 'auth' })
useHead({ title: 'Configurações' })

const { mode, setMode } = useThemeMode()
const session = useSession()
const user = computed(() => session.value?.data?.user)

const options: { value: ThemeMode; label: string; icon: typeof PhSun; preview: string; bar: string }[] = [
  { value: 'light', label: 'Claro', icon: PhSun, preview: 'bg-[#f6f8fb]', bar: 'bg-[#dfe5ef]' },
  { value: 'dark', label: 'Escuro', icon: PhMoonStars, preview: 'bg-[#0b1222]', bar: 'bg-[#1d2740]' },
  {
    value: 'system',
    label: 'Sistema',
    icon: PhDesktop,
    preview: 'bg-[linear-gradient(135deg,#f6f8fb_50%,#0b1222_50%)]',
    bar: 'bg-[#8a97ae]/50',
  },
]

function select(value: ThemeMode, event: MouseEvent) {
  setMode(value, { x: event.clientX, y: event.clientY })
}
</script>
