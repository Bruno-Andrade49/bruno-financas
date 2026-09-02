import { z } from 'zod'
import { transactionTypeSchema } from './transaction'

export const recurrenceFrequencySchema = z.enum(['weekly', 'monthly', 'yearly'])

export const createRecurringTransactionSchema = z.object({
  financialAccountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  paymentMethodId: z.string().uuid().nullish(),
  type: transactionTypeSchema,
  amount: z.number().positive('O valor precisa ser maior que zero'),
  description: z.string().trim().min(1, 'Descrição obrigatória').max(200),
  frequency: recurrenceFrequencySchema,
  // Só usado em monthly/yearly — se omitido, usa o dia de startDate. 1-31,
  // clampado pro último dia do mês em meses mais curtos (ex.: 31 em fevereiro).
  dayOfMonth: z.number().int().min(1).max(31).nullish(),
  startDate: z.string().date(),
  endDate: z.string().date().nullish(),
})

export const updateRecurringTransactionSchema = z.object({
  amount: z.number().positive().optional(),
  description: z.string().trim().min(1).max(200).optional(),
  endDate: z.string().date().nullish(),
  active: z.boolean().optional(),
})

export type CreateRecurringTransactionInput = z.infer<typeof createRecurringTransactionSchema>
export type UpdateRecurringTransactionInput = z.infer<typeof updateRecurringTransactionSchema>
