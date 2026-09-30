<template>
  <div class="space-y-6">
    <div class="rise-in flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold tracking-tight">Lançamentos</h1>
        <p class="mt-1 text-sm text-muted-foreground tabular-nums">
          <template v-if="data">{{ countLabel }}</template>
          <template v-else>&nbsp;</template>
        </p>
      </div>
      <CreateTransactionDialog />
    </div>

    <div class="rise-in space-y-3 rounded-2xl bg-card p-3 ring-1 ring-foreground/[0.07] dark:ring-white/[0.08]" style="--i: 1">
      <div class="relative">
        <PhMagnifyingGlass class="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input v-model="search" type="search" placeholder="Buscar pela descrição" class="h-10 rounded-xl pl-9" aria-label="Buscar pela descrição" />
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <TypeFilter v-model="type" />
        <Select v-model="category">
          <SelectTrigger class="h-9 w-auto min-w-40 rounded-xl" aria-label="Categoria"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            <SelectItem v-for="c in visibleCategories" :key="c.id" :value="c.id">{{ c.name }}</SelectItem>
          </SelectContent>
        </Select>
        <Select v-model="period">
          <SelectTrigger class="h-9 w-auto min-w-36 rounded-xl" aria-label="Período"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem v-for="p in periods" :key="p.value" :value="p.value">{{ p.label }}</SelectItem>
          </SelectContent>
        </Select>
        <button
          v-if="hasFilters"
          type="button"
          class="press ml-auto inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium text-muted-foreground hover:text-foreground"
          @click="clearFilters"
        >
          <PhX class="size-3.5" />Limpar filtros
        </button>
      </div>
    </div>

    <AsyncState :pending="pending && !data" :error="error" :is-empty="items.length === 0">
      <template #empty>
        <div class="rounded-2xl border border-dashed">
          <EmptyHint
            :icon="hasFilters ? PhFunnel : PhReceipt"
            :text="hasFilters ? 'Nenhum lançamento com esses filtros.' : 'Nenhum lançamento ainda. Use o botão Lançar pra registrar o primeiro.'"
          />
        </div>
      </template>

      <div class="space-y-3" :class="pending && 'opacity-60 transition-opacity'">
        <TransactionList :items="items" />
        <Button
          v-if="hasMore"
          variant="outline"
          class="press h-11 w-full rounded-xl"
          :loading="loadingMore"
          @click="loadMore"
        >
          {{ loadingMore ? 'Carregando' : `Carregar mais (${remaining} restantes)` }}
        </Button>
        <p v-else-if="items.length > PAGE_SIZE" class="py-2 text-center text-xs text-muted-foreground">Esses são todos.</p>
      </div>
    </AsyncState>
  </div>
</template>

<script setup lang="ts">
import { PhFunnel, PhMagnifyingGlass, PhReceipt, PhX } from '@phosphor-icons/vue'
import { refDebounced } from '@vueuse/core'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import CreateTransactionDialog from '@/components/transactions/CreateTransactionDialog.vue'
import TransactionList from '@/components/transactions/TransactionList.vue'
import TypeFilter from '@/components/transactions/TypeFilter.vue'
import EmptyHint from '@/components/common/EmptyHint.vue'

definePageMeta({ layout: 'app', middleware: 'auth' })
useHead({ title: 'Lançamentos' })

const PAGE_SIZE = 20
type Period = 'this_month' | 'last_month' | 'last_3_months' | 'this_year' | 'all'
const periods: { value: Period; label: string }[] = [
  { value: 'this_month', label: 'Este mês' },
  { value: 'last_month', label: 'Mês passado' },
  { value: 'last_3_months', label: 'Últimos 3 meses' },
  { value: 'this_year', label: 'Este ano' },
  { value: 'all', label: 'Todo o período' },
]

const route = useRoute()
const router = useRouter()
const queryString = (key: string) => (typeof route.query[key] === 'string' ? (route.query[key] as string) : '')

const search = ref(queryString('q'))
const debouncedSearch = refDebounced(search, 300)
const type = ref<'income' | 'expense' | null>(['income', 'expense'].includes(queryString('type')) ? (queryString('type') as 'income' | 'expense') : null)
const category = ref(queryString('category') || 'all')
const period = ref<Period>(periods.some((p) => p.value === queryString('period')) ? (queryString('period') as Period) : 'all')

const hasFilters = computed(() => !!search.value || !!type.value || category.value !== 'all' || period.value !== 'all')
function clearFilters() {
  search.value = ''
  type.value = null
  category.value = 'all'
  period.value = 'all'
}

const { data: categories } = await useFetch<{ id: string; name: string; type: 'income' | 'expense' }[]>('/api/v1/categories')
const visibleCategories = computed(() => (categories.value ?? []).filter((c) => !type.value || c.type === type.value))
watch(type, () => {
  if (category.value !== 'all' && !visibleCategories.value.some((c) => c.id === category.value)) category.value = 'all'
})

function iso(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function periodRange(value: Period): { from?: string; to?: string } {
  const now = new Date()
  const y = now.getFullYear()
  const m = now.getMonth()
  switch (value) {
    case 'this_month': return { from: iso(new Date(y, m, 1)), to: iso(new Date(y, m + 1, 0)) }
    case 'last_month': return { from: iso(new Date(y, m - 1, 1)), to: iso(new Date(y, m, 0)) }
    case 'last_3_months': return { from: iso(new Date(y, m - 2, 1)), to: iso(new Date(y, m + 1, 0)) }
    case 'this_year': return { from: iso(new Date(y, 0, 1)), to: iso(new Date(y, 11, 31)) }
    default: return {}
  }
}

const baseQuery = computed(() => ({
  pageSize: PAGE_SIZE,
  ...(debouncedSearch.value.trim() ? { q: debouncedSearch.value.trim() } : {}),
  ...(type.value ? { type: type.value } : {}),
  ...(category.value !== 'all' ? { categoryId: category.value } : {}),
  ...periodRange(period.value),
}))

watch([debouncedSearch, type, category, period], () => {
  router.replace({
    query: {
      ...(debouncedSearch.value.trim() ? { q: debouncedSearch.value.trim() } : {}),
      ...(type.value ? { type: type.value } : {}),
      ...(category.value !== 'all' ? { category: category.value } : {}),
      ...(period.value !== 'all' ? { period: period.value } : {}),
    },
  })
})

const { data, pending, error, refresh } = await useFetch('/api/v1/transactions', { query: computed(() => ({ ...baseQuery.value, page: 1 })) })

const extra = ref<NonNullable<typeof data.value>['items']>([])
const nextPage = ref(2)
const loadingMore = ref(false)
watch(baseQuery, () => {
  extra.value = []
  nextPage.value = 2
})

const items = computed(() => [...(data.value?.items ?? []), ...extra.value])
const total = computed(() => data.value?.total ?? 0)
const remaining = computed(() => Math.max(0, total.value - items.value.length))
const hasMore = computed(() => remaining.value > 0)
const countLabel = computed(() => (total.value === 1 ? '1 lançamento' : `${total.value.toLocaleString('pt-BR')} lançamentos`) + (hasFilters.value ? ' com esses filtros' : ''))

async function loadMore() {
  loadingMore.value = true
  try {
    const page = await $fetch('/api/v1/transactions', { query: { ...baseQuery.value, page: nextPage.value } })
    extra.value.push(...page.items)
    nextPage.value++
  } catch {
    toast.error('Não foi possível carregar mais lançamentos')
  } finally {
    loadingMore.value = false
  }
}

const { version } = useQuickAdd()
watch(version, async () => {
  extra.value = []
  nextPage.value = 2
  await refresh()
})
</script>
