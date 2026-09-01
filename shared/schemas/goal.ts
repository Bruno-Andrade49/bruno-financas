import { z } from 'zod'

export const goalStatusSchema = z.enum(['active', 'completed', 'abandoned'])

export const createGoalSchema = z.object({
  name: z.string().trim().min(1, 'Dê um nome pra meta').max(100),
  targetAmount: z.number().positive('O valor precisa ser maior que zero'),
  targetDate: z.string().date(),
})

export const updateGoalSchema = z.object({
  name: z.string().trim().min(1).max(100).optional(),
  targetAmount: z.number().positive().optional(),
  targetDate: z.string().date().optional(),
  status: goalStatusSchema.optional(),
})

export const contributeGoalSchema = z.object({
  amount: z.number().positive('O valor precisa ser maior que zero'),
})

export type CreateGoalInput = z.infer<typeof createGoalSchema>
export type UpdateGoalInput = z.infer<typeof updateGoalSchema>
export type ContributeGoalInput = z.infer<typeof contributeGoalSchema>
