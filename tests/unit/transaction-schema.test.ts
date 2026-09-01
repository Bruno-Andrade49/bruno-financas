import { describe, expect, it } from 'vitest'
import { createTransactionSchema, transactionsSummaryQuerySchema } from '#shared/schemas/transaction'

describe('createTransactionSchema', () => {
  const validPayload = {
    financialAccountId: '11111111-1111-1111-1111-111111111111',
    categoryId: '22222222-2222-2222-2222-222222222222',
    type: 'expense' as const,
    amount: 35,
    description: 'Almoço',
    date: '2026-08-18',
  }

  it('aceita um payload válido', () => {
    const result = createTransactionSchema.safeParse(validPayload)
    expect(result.success).toBe(true)
  })

  it('rejeita valor zero ou negativo', () => {
    const result = createTransactionSchema.safeParse({ ...validPayload, amount: 0 })
    expect(result.success).toBe(false)
  })

  it('rejeita descrição vazia', () => {
    const result = createTransactionSchema.safeParse({ ...validPayload, description: '  ' })
    expect(result.success).toBe(false)
  })

  it('rejeita categoryId que não é um uuid', () => {
    const result = createTransactionSchema.safeParse({ ...validPayload, categoryId: 'not-a-uuid' })
    expect(result.success).toBe(false)
  })

  it('assume source=manual quando não informado', () => {
    const result = createTransactionSchema.parse(validPayload)
    expect(result.source).toBe('manual')
  })
})

describe('transactionsSummaryQuerySchema', () => {
  it('aceita o formato YYYY-MM', () => {
    expect(transactionsSummaryQuerySchema.safeParse({ month: '2026-08' }).success).toBe(true)
  })

  it('rejeita formatos fora do padrão', () => {
    expect(transactionsSummaryQuerySchema.safeParse({ month: '08/2026' }).success).toBe(false)
    expect(transactionsSummaryQuerySchema.safeParse({ month: '2026-8' }).success).toBe(false)
  })
})
