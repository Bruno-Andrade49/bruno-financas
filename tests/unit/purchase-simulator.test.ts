import { describe, expect, it } from 'vitest'
import { addMonths, simulatePurchases, type SimulatedPurchase } from '#shared/purchase-simulator'

const ps5: SimulatedPurchase = { id: 'ps5', name: 'PS5', installmentAmount: 400, installments: 10, startOffset: 0 }
const base = { monthlyIncome: 5000, monthlyExpenses: 3500, savingsTarget: 800, firstMonth: '2026-10' }

describe('simulatePurchases', () => {
  it('parcela cabe mantendo a meta → vale a pena', () => {
    const result = simulatePurchases({ ...base, purchases: [ps5] })
    expect(result.verdict).toBe('worth')
    expect(result.months[0]).toMatchObject({ month: '2026-10', installments: 400, leftover: 1100, afterSavings: 300, status: 'ok' })
    expect(result.monthsBelowTarget).toBe(0)
  })

  it('parcela come a meta de guardar → não vale (tight)', () => {
    const result = simulatePurchases({ ...base, purchases: [{ ...ps5, installmentAmount: 1000 }] })
    expect(result.verdict).toBe('not_worth')
    expect(result.months[0]!.status).toBe('tight')
    expect(result.monthsBelowTarget).toBe(10)
    expect(result.monthsNegative).toBe(0)
  })

  it('parcela deixa o mês negativo', () => {
    const result = simulatePurchases({ ...base, purchases: [{ ...ps5, installmentAmount: 1800 }] })
    expect(result.months[0]!.status).toBe('negative')
    expect(result.monthsNegative).toBe(10)
  })

  it('meses depois da última parcela voltam ao normal (horizonte = parcelas + 2)', () => {
    const result = simulatePurchases({ ...base, purchases: [{ ...ps5, installmentAmount: 1000 }] })
    expect(result.months).toHaveLength(12)
    expect(result.months[9]!.items[0]).toMatchObject({ number: 10, of: 10 })
    expect(result.months[10]).toMatchObject({ installments: 0, status: 'ok' })
  })

  it('horizonte mínimo de 6 e máximo de 24 meses', () => {
    expect(simulatePurchases({ ...base, purchases: [{ ...ps5, installments: 2 }] }).months).toHaveLength(6)
    expect(simulatePurchases({ ...base, purchases: [{ ...ps5, installments: 48 }] }).months).toHaveLength(24)
  })

  it('compras empilham como numa fatura, respeitando o mês de início', () => {
    const phone: SimulatedPurchase = { id: 'cel', name: 'Celular', installmentAmount: 300, installments: 3, startOffset: 2 }
    const result = simulatePurchases({ ...base, purchases: [ps5, phone] })
    expect(result.months.map((m) => m.installments).slice(0, 6)).toEqual([400, 400, 700, 700, 700, 400])
    expect(result.months[2]!.items.map((i) => i.name)).toEqual(['PS5', 'Celular'])
    expect(result.totalInstallments).toBe(4900)
  })

  it('custo de parcelar = total parcelado − preço à vista', () => {
    const result = simulatePurchases({ ...base, purchases: [{ ...ps5, cashPrice: 3600 }] })
    expect(result.financingCost).toBe(400)
  })

  it('parcela máxima que cabe = renda − gastos − meta', () => {
    expect(simulatePurchases({ ...base, purchases: [ps5] }).maxAffordableInstallment).toBe(700)
  })

  it('meses pra comprar à vista guardando a sobra', () => {
    expect(simulatePurchases({ ...base, purchases: [{ ...ps5, cashPrice: 3600 }] }).monthsToBuyInCash).toBe(6)
  })

  it('sem sobra nenhuma, não há prazo pra comprar à vista', () => {
    const result = simulatePurchases({ ...base, monthlyExpenses: 4500, purchases: [ps5] })
    expect(result.monthsToBuyInCash).toBeNull()
    expect(result.maxAffordableInstallment).toBe(0)
  })

  it('comprometimento = parcelas / renda', () => {
    expect(simulatePurchases({ ...base, purchases: [{ ...ps5, installmentAmount: 1750 }] }).maxCommitment).toBe(0.35)
  })

  it('ignora compra sem valor ou sem parcelas', () => {
    const result = simulatePurchases({ ...base, purchases: [{ ...ps5, installmentAmount: 0 }] })
    expect(result.totalInstallments).toBe(0)
    expect(result.verdict).toBe('worth')
  })
})

describe('addMonths', () => {
  it('vira o ano', () => expect(addMonths('2026-11', 3)).toBe('2027-02'))
})
