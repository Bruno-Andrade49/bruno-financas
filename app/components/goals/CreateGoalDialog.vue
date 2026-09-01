<template>
  <Dialog v-model:open="open">
    <DialogTrigger as-child>
      <Button><PhPlus class="size-4" />Nova meta</Button>
    </DialogTrigger>
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Nova meta</DialogTitle>
        <DialogDescription>Defina um objetivo e a data em que quer alcançá-lo.</DialogDescription>
      </DialogHeader>

      <form class="space-y-4" @submit="onSubmit">
        <div class="space-y-2">
          <Label for="name">Nome</Label>
          <Input id="name" v-model="name" v-bind="nameAttrs" placeholder="Ex.: Reserva de emergência" />
          <p v-if="errors.name" class="text-sm text-destructive">{{ errors.name }}</p>
        </div>

        <div class="space-y-2">
          <Label for="targetAmount">Valor alvo</Label>
          <Input id="targetAmount" v-model="targetAmount" v-bind="targetAmountAttrs" type="number" step="0.01" min="0" />
          <p v-if="errors.targetAmount" class="text-sm text-destructive">{{ errors.targetAmount }}</p>
        </div>

        <div class="space-y-2">
          <Label for="targetDate">Data alvo</Label>
          <Input id="targetDate" v-model="targetDate" v-bind="targetDateAttrs" type="date" />
          <p v-if="errors.targetDate" class="text-sm text-destructive">{{ errors.targetDate }}</p>
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
import { createGoalSchema } from '#shared/schemas/goal'

const emit = defineEmits<{ created: [] }>()

const open = ref(false)
const loading = ref(false)

const { handleSubmit, errors, defineField, resetForm } = useForm({
  validationSchema: toTypedSchema(createGoalSchema),
})
const [name, nameAttrs] = defineField('name')
const [targetAmount, targetAmountAttrs] = defineField('targetAmount')
const [targetDate, targetDateAttrs] = defineField('targetDate')

const onSubmit = handleSubmit(async (values) => {
  loading.value = true
  try {
    await $fetch('/api/v1/goals', {
      method: 'POST',
      body: { ...values, targetAmount: Number(values.targetAmount) },
    })
    toast.success('Meta criada')
    resetForm()
    open.value = false
    emit('created')
  } catch (error) {
    const message = (error as { data?: { error?: { message?: string } } })?.data?.error?.message
    toast.error(message ?? 'Não foi possível criar a meta')
  } finally {
    loading.value = false
  }
})
</script>
