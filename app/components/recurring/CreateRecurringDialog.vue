<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button><PhPlus class="size-4" />Nova recorrência</Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Nova recorrência</DialogTitle>
        <DialogDescription>Um lançamento que se repete automaticamente (assinatura, salário, aluguel).</DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit="onSubmit">
        <div class="grid grid-cols-2 gap-2">
          <Button type="button" :variant="type === 'expense' ? 'default' : 'outline'" @click="type = 'expense'">
            Despesa
          </Button>
          <Button type="button" :variant="type === 'income' ? 'default' : 'outline'" @click="type = 'income'">
            Receita
          </Button>
        </div>

        <div class="space-y-2">
          <Label for="description">Descrição</Label>
          <Input id="description" v-model="description" v-bind="descriptionAttrs" placeholder="Ex.: Assinatura streaming" />
          <p v-if="errors.description" class="text-sm text-destructive">{{ errors.description }}</p>
        </div>

        <div class="space-y-2">
          <Label for="amount">Valor</Label>
          <Input id="amount" v-model="amount" v-bind="amountAttrs" type="number" step="0.01" min="0" />
          <p v-if="errors.amount" class="text-sm text-destructive">{{ errors.amount }}</p>
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
          <Label>Frequência</Label>
          <Select v-model="frequency">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="startDate">Começa em</Label>
          <Input id="startDate" v-model="startDate" v-bind="startDateAttrs" type="date" />
          <p v-if="errors.startDate" class="text-sm text-destructive">{{ errors.startDate }}</p>
          <p class="text-xs text-muted-foreground">
            {{ frequency === 'weekly' ? 'Repete a cada 7 dias a partir dessa data.' : 'Repete no dia/mês dessa data.' }}
          </p>
        </div>

        <div class="space-y-2">
          <Label for="endDate">Termina em (opcional)</Label>
          <Input id="endDate" v-model="endDateModel" type="date" />
        </div>

        <DialogFooter>
          <Button type="submit" :disabled="loading" class="w-full">
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
import { createRecurringTransactionSchema } from '#shared/schemas/recurring'

const emit = defineEmits<{ created: [] }>()

const open = ref(false)
const loading = ref(false)
const type = ref<'income' | 'expense'>('expense')

const { data: categories } = await useFetch('/api/v1/categories')
const { data: financialAccounts } = await useFetch('/api/v1/financial-accounts')
const { data: paymentMethods } = await useFetch('/api/v1/payment-methods')

const filteredCategories = computed(
  () => categories.value?.filter((category: { type: string }) => category.type === type.value) ?? [],
)

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema: toTypedSchema(
    createRecurringTransactionSchema.omit({ type: true, financialAccountId: true, paymentMethodId: true, dayOfMonth: true }),
  ),
  initialValues: { startDate: new Date().toISOString().slice(0, 10), frequency: 'monthly' },
})
const [description, descriptionAttrs] = defineField('description')
const [amount, amountAttrs] = defineField('amount')
const [categoryId] = defineField('categoryId')
const [frequency] = defineField('frequency')
const [startDate, startDateAttrs] = defineField('startDate')
const [endDate] = defineField('endDate')
// Input não aceita `null` no v-model (só string | number | undefined) —
// endDate é opcional no schema, então precisa desse pequeno proxy.
const endDateModel = computed({
  get: () => endDate.value ?? '',
  set: (value: string) => { endDate.value = value || null },
})

const onSubmit = handleSubmit(async (values) => {
  const financialAccountId = financialAccounts.value?.[0]?.id
  const paymentMethodId = paymentMethods.value?.[0]?.id

  if (!financialAccountId) {
    toast.error('Nenhuma conta financeira encontrada')
    return
  }

  loading.value = true
  try {
    await $fetch('/api/v1/recurring-transactions', {
      method: 'POST',
      body: {
        ...values,
        type: type.value,
        financialAccountId,
        paymentMethodId,
        amount: Number(values.amount),
        endDate: values.endDate || undefined,
      },
    })
    toast.success('Recorrência criada')
    resetForm({ values: { startDate: new Date().toISOString().slice(0, 10), frequency: 'monthly' } })
    open.value = false
    emit('created')
  } catch (error) {
    const message = (error as { data?: { error?: { message?: string } } })?.data?.error?.message
    toast.error(message ?? 'Não foi possível criar a recorrência')
  } finally {
    loading.value = false
  }
})
</script>
