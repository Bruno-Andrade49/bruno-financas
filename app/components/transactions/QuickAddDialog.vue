<template>
  <Dialog v-model:open="isOpen">
    <DialogContent class="gap-5 rounded-2xl p-5 sm:max-w-md">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2 text-lg">
          <PhLightning weight="fill" class="size-5 text-income" />
          Lançamento rápido
        </DialogTitle>
        <DialogDescription>Escreva do seu jeito: valor, o que foi e quando.</DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit.prevent="save">
        <div class="relative">
          <Input
            ref="inputRef"
            v-model="text"
            :placeholder="placeholder"
            class="h-12 rounded-xl pr-4 text-base"
            autocomplete="off"
            aria-label="Descreva o lançamento"
          />
        </div>

        <div v-if="!text.trim()" class="flex flex-wrap gap-2">
          <button
            v-for="example in examples"
            :key="example"
            type="button"
            class="press rounded-lg border border-dashed px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-solid hover:bg-muted hover:text-foreground"
            @click="text = example"
          >
            {{ example }}
          </button>
        </div>

        <div v-else class="rise-in space-y-4 rounded-xl bg-muted/60 p-4">
          <div class="flex items-end justify-between gap-3">
            <div class="min-w-0 shrink-0 basis-2/5">
              <p class="truncate text-sm font-medium">{{ parsed.description }}</p>
              <button
                type="button"
                class="press mt-1 inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-xs font-semibold whitespace-nowrap"
                :class="type === 'income' ? 'bg-income/15 text-income' : 'bg-expense/15 text-expense'"
                title="Trocar entre despesa e receita"
                @click="typeOverride = type === 'income' ? 'expense' : 'income'"
              >
                <component :is="type === 'income' ? PhArrowUpRight : PhArrowDownRight" class="size-3" weight="bold" />
                {{ type === 'income' ? 'Receita' : 'Despesa' }}
                <PhArrowsLeftRight class="size-3 opacity-60" />
              </button>
            </div>
            <p
              class="min-w-0 flex-1 truncate text-right text-xl font-bold tracking-tight tabular-nums sm:text-2xl"
              :title="parsed.amount ? format(parsed.amount) : undefined"
              :class="parsed.amount ? (type === 'income' ? 'text-income' : 'text-expense') : 'text-muted-foreground'"
            >
              {{ parsed.amount ? format(parsed.amount) : 'R$ 0,00' }}
            </p>
          </div>

          <div class="grid grid-cols-[minmax(0,1fr)_auto] gap-2">
            <Select v-model="categoryId">
              <SelectTrigger class="w-full bg-background" aria-label="Categoria">
                <SelectValue placeholder="Escolha a categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="category in categoriesOfType" :key="category.id" :value="category.id">
                  {{ category.name }}
                </SelectItem>
              </SelectContent>
            </Select>
            <Input v-model="date" type="date" class="w-[9.5rem] bg-background" aria-label="Data" />
          </div>

          <p v-if="tooBig" class="text-xs font-medium text-expense">
            Valor acima do limite de {{ format(MAX_AMOUNT) }}.
          </p>
          <p v-else-if="!parsed.amount" class="text-xs text-muted-foreground">
            Inclua um valor, por exemplo <span class="font-medium text-foreground">35</span> ou
            <span class="font-medium text-foreground">42,90</span>.
          </p>
        </div>

        <Button type="submit" class="press h-11 w-full rounded-xl text-base" :disabled="!canSave" :loading="saving">
          {{ saving ? 'Salvando' : 'Lançar' }}
          <kbd v-if="!saving" class="ml-1 hidden rounded border border-current/30 px-1 text-[10px] font-medium opacity-70 sm:inline">Enter</kbd>
        </Button>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import {
  PhArrowDownRight,
  PhArrowsLeftRight,
  PhArrowUpRight,
  PhLightning,
} from '@phosphor-icons/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { normalize, parseQuickAdd } from '#shared/quick-add'
import { MAX_AMOUNT } from '#shared/schemas/money'

interface Category {
  id: string
  name: string
  type: 'income' | 'expense'
}

const { isOpen, notifySaved } = useQuickAdd()
const { format } = useCurrencyFormat()

const examples = ['35 almoço', 'gastei 42,90 no uber ontem', 'recebi 1.200 de salário', '59,90 netflix']
const placeholder = 'Ex.: 35 almoço ontem'

const text = ref('')
const typeOverride = ref<'income' | 'expense' | null>(null)
const categoryOverride = ref<string | null>(null)
const dateOverride = ref<string | null>(null)
const saving = ref(false)
const inputRef = ref<{ $el?: HTMLInputElement } | null>(null)

const categories = ref<Category[]>([])
const financialAccountId = ref<string | null>(null)
const paymentMethodId = ref<string | null>(null)
let loaded = false

async function loadReferences() {
  if (loaded) return
  const [cats, accounts, methods] = await Promise.all([
    $fetch<Category[]>('/api/v1/categories'),
    $fetch<{ id: string }[]>('/api/v1/financial-accounts'),
    $fetch<{ id: string }[]>('/api/v1/payment-methods'),
  ])
  categories.value = cats
  financialAccountId.value = accounts[0]?.id ?? null
  paymentMethodId.value = methods[0]?.id ?? null
  loaded = true
}

const parsed = computed(() => parseQuickAdd(text.value, { categories: categories.value }))
const type = computed(() => typeOverride.value ?? parsed.value.type)
const categoriesOfType = computed(() => categories.value.filter((c) => c.type === type.value))

const suggestedCategoryId = computed(() => {
  const byName = (name: string) =>
    categoriesOfType.value.find((c) => normalize(c.name) === normalize(name))?.id ?? null
  return (parsed.value.categoryName && byName(parsed.value.categoryName)) || byName('Outros')
})

const categoryId = computed({
  get: () =>
    categoryOverride.value && categoriesOfType.value.some((c) => c.id === categoryOverride.value)
      ? categoryOverride.value
      : suggestedCategoryId.value,
  set: (value) => {
    categoryOverride.value = value
  },
})

const date = computed({
  get: () => dateOverride.value ?? parsed.value.date,
  set: (value) => {
    dateOverride.value = value
  },
})

const tooBig = computed(() => (parsed.value.amount ?? 0) > MAX_AMOUNT)
const canSave = computed(() => !!parsed.value.amount && !tooBig.value && !!categoryId.value && !!financialAccountId.value)

watch(text, (value, previous) => {
  if (!value.trim() || !previous?.trim()) {
    typeOverride.value = null
    categoryOverride.value = null
    dateOverride.value = null
  }
})

watch(isOpen, async (open) => {
  if (!open) return
  try {
    await loadReferences()
  } catch {
    toast.error('Não foi possível carregar suas categorias')
  }
  await nextTick()
  inputRef.value?.$el?.focus?.()
})

async function save() {
  if (!canSave.value || saving.value) return
  saving.value = true
  try {
    await $fetch('/api/v1/transactions', {
      method: 'POST',
      body: {
        type: type.value,
        amount: parsed.value.amount,
        description: parsed.value.description,
        date: date.value,
        categoryId: categoryId.value,
        financialAccountId: financialAccountId.value,
        paymentMethodId: paymentMethodId.value,
        source: 'quick_add',
      },
    })
    toast.success(`${type.value === 'income' ? 'Receita' : 'Despesa'} de ${format(parsed.value.amount!)} lançada`)
    text.value = ''
    isOpen.value = false
    notifySaved()
  } catch (error) {
    const message = (error as { data?: { error?: { message?: string } } })?.data?.error?.message
    toast.error(message ?? 'Não foi possível salvar o lançamento')
  } finally {
    saving.value = false
  }
}
</script>
