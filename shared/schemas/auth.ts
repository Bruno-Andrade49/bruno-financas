import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().trim().min(1, 'Informe seu nome').max(100),
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
})

export const loginSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
  password: z.string().min(1, 'Informe sua senha'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email('E-mail inválido'),
})

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'Mínimo de 8 caracteres'),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
