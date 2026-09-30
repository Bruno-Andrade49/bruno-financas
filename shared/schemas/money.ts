import { z } from 'zod'

// As colunas de valor são Decimal(14, 2): até 999.999.999.999,99.
export const MAX_AMOUNT = 999_999_999_999.99

export const moneySchema = (message = 'O valor precisa ser maior que zero') =>
  z
    .number({ invalid_type_error: 'Informe um valor' })
    .positive(message)
    .max(MAX_AMOUNT, 'Valor alto demais')
    .refine((value) => Math.abs(Math.round(value * 100) - value * 100) < 1e-6, 'Use no máximo 2 casas decimais')
