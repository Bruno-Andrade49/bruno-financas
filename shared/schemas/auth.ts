import { z } from 'zod'
import { PASSWORD_MIN_LENGTH, passwordStrength } from '../password-strength'

const email = z
  .string({ required_error: 'Informe seu e-mail' })
  .trim()
  .min(1, 'Informe seu e-mail')
  .email('Digite um e-mail válido, como nome@email.com')

const newPassword = z
  .string({ required_error: 'Crie uma senha' })
  .min(1, 'Crie uma senha')
  .min(PASSWORD_MIN_LENGTH, `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres`)
  .max(128, 'A senha pode ter no máximo 128 caracteres')
  .refine((value) => /[a-zA-Z]/.test(value) && /\d/.test(value), 'Use letras e números')
  .refine((value) => !passwordStrength(value).common, 'Essa senha é muito comum, escolha outra')

export const registerSchema = z.object({
  name: z
    .string({ required_error: 'Informe seu nome' })
    .trim()
    .min(1, 'Informe seu nome')
    .max(100, 'Nome muito longo')
    .regex(/^[\p{L}\s'-]+$/u, 'Use só letras no nome'),
  email,
  password: newPassword,
})

export const loginSchema = z.object({
  email,
  password: z.string({ required_error: 'Informe sua senha' }).min(1, 'Informe sua senha'),
})

export const forgotPasswordSchema = z.object({
  email,
})

export const resetPasswordSchema = z.object({
  password: newPassword,
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
