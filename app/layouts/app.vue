<template>
  <div class="min-h-svh bg-background">
    <header class="sticky top-0 z-30 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div class="flex items-center gap-6">
          <NuxtLink to="/dashboard" class="flex items-center gap-2 font-semibold tracking-tight">
            <span class="flex size-7 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground">
              B
            </span>
            <span class="hidden sm:inline">Bruno Finanças</span>
          </NuxtLink>
          <nav class="hidden items-center gap-1 text-sm md:flex">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              active-class="!text-foreground bg-muted font-medium"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>
        <div class="flex items-center gap-3">
          <span
            v-if="userInitial"
            class="hidden size-8 items-center justify-center rounded-full bg-accent text-sm font-semibold text-accent-foreground sm:flex"
          >
            {{ userInitial }}
          </span>
          <Button as-child variant="ghost" size="icon" class="text-muted-foreground" title="Configurações">
            <NuxtLink to="/settings">
              <PhGearSix class="size-5" />
            </NuxtLink>
          </Button>
          <Button variant="ghost" size="icon" class="text-muted-foreground" title="Sair" @click="handleLogout">
            <PhSignOut class="size-5" />
          </Button>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-5xl px-4 py-6 pb-safe-nav md:py-8 md:pb-8">
      <slot />
    </main>

    <MobileTabBar />
  </div>
</template>

<script setup lang="ts">
import { PhGearSix, PhSignOut } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import MobileTabBar from '@/components/layout/MobileTabBar.vue'
import { authClient, useSession } from '@/lib/auth-client'

const session = useSession()
const router = useRouter()

// A navegação inferior do mobile (MobileTabBar) tem os 5 itens de uso
// diário, incluindo o assistente — recorrências é "configura uma vez e
// esquece", por isso entra só aqui no menu de topo do desktop (tem espaço
// sobrando) e como link a partir do dashboard no mobile.
const navItems = [
  { to: '/dashboard', label: 'Visão geral' },
  { to: '/assistant', label: 'Assistente' },
  { to: '/budgets', label: 'Orçamentos' },
  { to: '/goals', label: 'Metas' },
  { to: '/insights', label: 'Insights' },
  { to: '/recurring', label: 'Recorrências' },
]

const userInitial = computed(() => session.value?.data?.user?.name?.trim()?.charAt(0)?.toUpperCase() ?? '')

async function handleLogout() {
  await authClient.signOut()
  await router.push('/login')
}
</script>
