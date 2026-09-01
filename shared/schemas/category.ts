import { z } from 'zod'
import { transactionTypeSchema } from './transaction'

export const createCategorySchema = z.object({
  name: z.string().trim().min(1).max(50),
  type: transactionTypeSchema,
  parentId: z.string().uuid().nullish(),
  icon: z.string().max(50).optional(),
  color: z.string().max(20).optional(),
})

export type CreateCategoryInput = z.infer<typeof createCategorySchema>
