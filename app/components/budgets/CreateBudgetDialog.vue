<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button><PhPlus class="size-4" />Novo orçamento</Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Novo orçamento</DialogTitle>
        <DialogDescription>Defina um limite de gasto mensal para uma categoria.</DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit="onSubmit">
        <div class="space-y-2">
          <Label>Categoria</Label>
          <Select v-model="categoryId">
            <SelectTrigger class="w-full">
              <SelectValue placeholder="Selecione uma categoria de despesa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem v-for="category in expenseCategories" :key="category.id" :value="category.id">
                {{ category.name }}
              </SelectItem>
            </SelectContent>
          </Select>
          <p v-if="errors.categoryId" class="text-sm text-destructive">{{ errors.categoryId }}</p>
        </div>

        <div class="space-y-2">
          <Label for="limitAmount">Limite mensal</Label>
          <Input id="limitAmount" v-model="limitAmount" v-bind="limitAmountAttrs" type="number" step="0.01" min="0" />
          <p v-if="errors.limitAmount" class="text-sm text-destructive">{{ errors.limitAmount }}</p>
        </div>

        <div class="space-y-2">
          <Label for="alertThresholdPct">Alertar a partir de (%)</Label>
          <Input
            id="alertThresholdPct"
            v-model="alertThresholdPct"
            v-bind="alertThresholdPctAttrs"
            type="number"
            min="1"
            max="100"
          />
          <p v-if="errors.alertThresholdPct" class="text-sm text-destructive">{{ errors.alertThresholdPct }}</p>
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
import { createBudgetSchema } from '#shared/schemas/budget'

const props = defineProps<{ month: string }>()
const emit = defineEmits<{ created: [] }>()

const open = ref(false)
const loading = ref(false)

const { data: categories } = useLazyFetch('/api/v1/categories')
const expenseCategories = computed(() => categories.value?.filter((category: { type: string }) => category.type === 'expense') ?? [])

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema: toTypedSchema(createBudgetSchema.omit({ referenceMonth: true })),
  initialValues: { alertThresholdPct: 80 },
})
const [categoryId] = defineField('categoryId')
const [limitAmount, limitAmountAttrs] = defineField('limitAmount')
const [alertThresholdPct, alertThresholdPctAttrs] = defineField('alertThresholdPct')

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  try {
    await $fetch('/api/v1/budgets', {
      method: 'POST',
      body: { ...values, referenceMonth: props.month, limitAmount: Number(values.limitAmount) },
    })
    toast.success('Orçamento criado')
    resetForm({ values: { alertThresholdPct: 80 } })
    open.value = false
    emit('created')
  } catch (error) {
    const message = (error as { data?: { error?: { message?: string } } })?.data?.error?.message
    toast.error(message ?? 'Não foi possível criar o orçamento')
  } finally {
    loading.value = false
  }
})
</script>
