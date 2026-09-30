<template>
  <div class="bg-ambient min-h-dvh bg-background">
    <a
      href="#conteudo"
      class="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-3 focus:py-2 focus:text-primary-foreground"
    >
      Pular para o conteúdo
    </a>

    <header class="glass sticky top-0 z-30 border-b border-border/60">
      <div class="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <div class="flex items-center gap-6">
          <NuxtLink to="/dashboard" class="press rounded-lg" aria-label="Ir para o início">
            <BrandLogo :with-name="true" />
          </NuxtLink>

          <nav class="hidden items-center gap-0.5 rounded-xl bg-muted/70 p-1 text-sm xl:flex" aria-label="Navegação principal">
            <NuxtLink
              v-for="item in navItems"
              :key="item.to"
              :to="item.to"
              class="press rounded-lg px-2.5 py-1.5 font-medium whitespace-nowrap text-muted-foreground transition-all duration-200 hover:text-foreground"
              active-class="!text-foreground bg-card shadow-sm"
            >
              {{ item.label }}
            </NuxtLink>
          </nav>
        </div>

        <div class="flex items-center gap-1.5">
          <Button class="press hidden rounded-xl xl:inline-flex" @click="openQuickAdd">
            <PhLightning weight="fill" class="size-4" />
            Lançar
            <kbd class="ml-0.5 rounded border border-current/25 px-1 text-[10px] font-medium opacity-70">N</kbd>
          </Button>

          <ThemeCoinToggle />

          <Button as-child variant="ghost" size="icon" class="press rounded-full text-muted-foreground" title="Configurações">
            <NuxtLink to="/settings" aria-label="Configurações">
              <PhGearSix class="size-5" />
            </NuxtLink>
          </Button>

          <span
            v-if="userInitial"
            class="ml-1 hidden size-9 items-center justify-center rounded-[30%] bg-primary text-sm font-semibold text-primary-foreground sm:flex xl:hidden 2xl:flex"
            :title="userName"
          >
            {{ userInitial }}
          </span>

          <Button variant="ghost" size="icon" class="press rounded-full text-muted-foreground" title="Sair" :loading="loggingOut" @click="handleLogout">
            <PhSignOut class="size-5" />
            <span class="sr-only">Sair</span>
          </Button>
        </div>
      </div>
    </header>

    <main id="conteudo" class="mx-auto max-w-6xl px-4 pt-6 pb-safe-nav md:pt-10 xl:pb-16">
      <slot />
    </main>

    <MobileTabBar />
    <QuickAddDialog />
  </div>
</template>

<script setup lang="ts">
import { PhGearSix, PhLightning, PhSignOut } from '@phosphor-icons/vue'
import { Button } from '@/components/ui/button'
import BrandLogo from '@/components/layout/BrandLogo.vue'
import MobileTabBar from '@/components/layout/MobileTabBar.vue'
import ThemeCoinToggle from '@/components/layout/ThemeCoinToggle.vue'
import QuickAddDialog from '@/components/transactions/QuickAddDialog.vue'
import { authClient, useSession } from '@/lib/auth-client'

const session = useSession()
const router = useRouter()
const { open: openQuickAdd } = useQuickAdd()

// área logada não deve aparecer no Google
useSeoMeta({ robots: 'noindex, nofollow' })

const navItems = [
  { to: '/dashboard', label: 'Visão geral' },
  { to: '/transactions', label: 'Lançamentos' },
  { to: '/budgets', label: 'Orçamentos' },
  { to: '/goals', label: 'Metas' },
  { to: '/insights', label: 'Insights' },
  { to: '/recurring', label: 'Recorrências' },
  { to: '/vale-a-pena', label: 'Vale a pena?' },
]

const userName = computed(() => session.value?.data?.user?.name ?? '')
const userInitial = computed(() => userName.value.trim().charAt(0).toUpperCase())

function onKeydown(event: KeyboardEvent) {
  if (event.key.toLowerCase() !== 'n' || event.metaKey || event.ctrlKey || event.altKey) return
  const target = event.target as HTMLElement | null
  if (target?.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]')) return
  event.preventDefault()
  openQuickAdd()
}
onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))

const loggingOut = ref(false)
async function handleLogout() {
  loggingOut.value = true
  try {
    await authClient.signOut()
    await router.push('/login')
  } finally {
    loggingOut.value = false
  }
}
</script>
