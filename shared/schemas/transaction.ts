// Schema compartilhado entre frontend (formulário, via vee-validate) e
// backend (validação de request) — um único lugar de verdade por contrato,
// conforme ARCHITECTURE.md, seção B/F/G.
import { z } from 'zod'

export const transactionTypeSchema = z.enum(['income', 'expense'])
export const transactionSourceSchema = z.enum(['manual', 'ai_nl', 'recurring'])

export const createTransactionSchema = z.object({
  financialAccountId: z.string().uuid(),
  categoryId: z.string().uuid(),
  paymentMethodId: z.string().uuid().nullish(),
  goalId: z.string().uuid().nullish(),
  type: transactionTypeSchema,
  amount: z.number().positive('O valor precisa ser maior que zero'),
  description: z.string().trim().min(1, 'Descrição obrigatória').max(200),
  date: z.string().date(), // "YYYY-MM-DD"
  isFixed: z.boolean().default(false),
  source: transactionSourceSchema.default('manual'),
})

export const updateTransactionSchema = createTransactionSchema.partial()

export const listTransactionsQuerySchema = z.object({
  from: z.string().date().optional(),
  to: z.string().date().optional(),
  categoryId: z.string().uuid().optional(),
  type: transactionTypeSchema.optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().positive().max(100).default(20),
})

export const transactionsSummaryQuerySchema = z.object({
  month: z.string().regex(/^\d{4}-\d{2}$/, 'Use o formato YYYY-MM'),
})

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>
export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>
export type TransactionsSummaryQuery = z.infer<typeof transactionsSummaryQuerySchema>
