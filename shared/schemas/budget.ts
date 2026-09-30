import { z } from 'zod'
import { moneySchema } from './money'

export const createBudgetSchema = z.object({
  categoryId: z.string().uuid(),
  limitAmount: moneySchema('O limite precisa ser maior que zero'),
  referenceMonth: z.string().regex(/^\d{4}-\d{2}$/, 'Use o formato YYYY-MM'),
  alertThresholdPct: z.number().int().min(1).max(100).default(80),
})

export const updateBudgetSchema = z.object({
  limitAmount: moneySchema('O limite precisa ser maior que zero').optional(),
  alertThresholdPct: z.number().int().min(1).max(100).optional(),
})

export const listBudgetsQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Use o formato YYYY-MM'),
})

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>
export type ListBudgetsQuery = z.infer<typeof listBudgetsQuerySchema>
