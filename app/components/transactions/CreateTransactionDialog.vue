<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button><PhPlus class="size-4" />Nova transação</Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Nova transação</DialogTitle>
        <DialogDescription>Registre uma receita ou despesa.</DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit="onSubmit">
        <div class="grid grid-cols-2 gap-2">
          <Button
            type="button"
            :variant="type === 'expense' ? 'default' : 'outline'"
            @click="type = 'expense'"
          >
            Despesa
          </Button>
          <Button
            type="button"
            :variant="type === 'income' ? 'default' : 'outline'"
            @click="type = 'income'"
          >
            Receita
          </Button>
        </div>

        <div class="space-y-2">
          <Label for="amount">Valor</Label>
          <Input id="amount" v-model="amount" v-bind="amountAttrs" type="number" step="0.01" min="0" />
          <p v-if="errors.amount" class="text-sm text-destructive">{{ errors.amount }}</p>
        </div>

        <div class="space-y-2">
          <Label for="description">Descrição</Label>
          <Input id="description" v-model="description" v-bind="descriptionAttrs" placeholder="Ex.: Almoço" />
          <p v-if="errors.description" class="text-sm text-destructive">{{ errors.description }}</p>
        </div>

        <div class="space-y-2">
          <Label>Categoria</Label>
          <Select v-model="categoryId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Selecione uma categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="category in filteredCategories" :key="category.id" :value="category.id">
                {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.categoryId" class="text-sm text-destructive">{{ errors.categoryId }}</p>
        </div>

        <div class="space-y-2">
          <Label for="date">Data</Label>
          <Input id="date" v-model="date" v-bind="dateAttrs" type="date" />
          <p v-if="errors.date" class="text-sm text-destructive">{{ errors.date }}</p>
        </div>

        <DialogFooter>
          <Button type="submit" :loading="loading" class="w-full">
            {{ loading ? 'Salvando...' : 'Salvar' }}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>

<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { PhPlus } from '@phosphor-icons/vue'
import { useForm } from 'vee-validate'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { createTransactionSchema } from '#shared/schemas/transaction'

const emit = defineEmits<{ created: [] }>()
const { notifySaved } = useQuickAdd()

const open = ref(false)
const loading = ref(false)
const type = ref<'income' | 'expense'>('expense')

const { data: categories } = useLazyFetch('/api/v1/categories')
const { data: financialAccounts } = useLazyFetch('/api/v1/financial-accounts')
const { data: paymentMethods } = useLazyFetch('/api/v1/payment-methods')

const filteredCategories = computed(
  () => categories.value?.filter((category: { type: string }) => category.type === type.value) ?? [],
)

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema: toTypedSchema(createTransactionSchema.omit({ type: true, financialAccountId: true, paymentMethodId: true })),
  initialValues: { date: new Date().toISOString().slice(0, 10) },
})
const [amount, amountAttrs] = defineField('amount')
const [description, descriptionAttrs] = defineField('description')
const [categoryId] = defineField('categoryId')
const [date, dateAttrs] = defineField('date')

const onSubmit = handleSubmit(async (values) => {
  const financialAccountId = financialAccounts.value?.[0]?.id
  const paymentMethodId = paymentMethods.value?.[0]?.id

  if (!financialAccountId) {
    toast.error('Nenhuma conta financeira encontrada')
    return
  }

  loading.value = true
  try {
    await $fetch('/api/v1/transactions', {
      method: 'POST',
      body: { ...values, type: type.value, financialAccountId, paymentMethodId, amount: Number(values.amount) },
    })
    toast.success('Transação registrada')
    resetForm({ values: { date: new Date().toISOString().slice(0, 10) } })
    open.value = false
    emit('created')
    notifySaved()
  } catch (error) {
    const message = (error as { data?: { error?: { message?: string } } })?.data?.error?.message
    toast.error(message ?? 'Não foi possível registrar a transação')
  } finally {
    loading.value = false
  }
})
</script>
