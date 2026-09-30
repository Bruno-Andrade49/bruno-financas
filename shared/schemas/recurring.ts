import { z } from 'zod'
import { moneySchema } from './money'
import { transactionTypeSchema } from './transaction'

export const recurrenceFrequencySchema = z.enum(['weekly', 'monthly', 'yearly'])

export const createRecurringTransactionSchema = z.object({
  financialAccountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  paymentMethodId: z.string().uuid().nullish(),
  type: transactionTypeSchema,
  amount: moneySchema('O valor precisa ser maior que zero'),
  description: z.string().trim().min(1, 'Descrição obrigatória').max(200),
  frequency: recurrenceFrequencySchema,
  dayOfMonth: z.number().int().min(1).max(31).nullish(),
  startDate: z.string().date(),
  endDate: z.string().date().nullish(),
})

export const updateRecurringTransactionSchema = z.object({
  amount: moneySchema().optional(),
  description: z.string().trim().min(1).max(200).optional(),
  endDate: z.string().date().nullish(),
  active: z.boolean().optional(),
})

export type CreateRecurringTransactionInput = z.infer<typeof createRecurringTransactionSchema>
export type UpdateRecurringTransactionInput = z.infer<typeof updateRecurringTransactionSchema>
