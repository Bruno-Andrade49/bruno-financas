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
import { PhSignOut } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import MobileTabBar from '@/components/layout/MobileTabBar.vue'
import { authClient, useSession } from '@/lib/auth-client'

const session = useSession()
const router = useRouter()

const navItems = [
  { to: '/dashboard', label: 'Visão geral' },
  { to: '/budgets', label: 'Orçamentos' },
  { to: '/goals', label: 'Metas' },
  { to: '/insights', label: 'Insights' },
]

const userInitial = computed(() => session.value?.data?.user?.name?.trim()?.charAt(0)?.toUpperCase() ?? '')

async function handleLogout() {
  await authClient.signOut()
  await router.push('/login')
}
</script>
