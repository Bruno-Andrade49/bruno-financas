import { describe, expect, it } from 'vitest'
import { withProgress } from '../../server/modules/budgets/budgets.progress'

const baseBudget = { limitAmount: 1000, alertThresholdPct: 80 }

describe('withProgress', () => {
  it('fica "ok" quando o gasto está bem abaixo do limite', () => {
    const result = withProgress(baseBudget, 300)
    expect(result.progressPct).toBe(30)
    expect(result.status).toBe('ok')
  })

  it('fica "warning" ao cruzar o alertThresholdPct', () => {
    const result = withProgress(baseBudget, 800)
    expect(result.progressPct).toBe(80)
    expect(result.status).toBe('warning')
  })

  it('fica "exceeded" quando o gasto passa do limite', () => {
    const result = withProgress(baseBudget, 1200)
    expect(result.progressPct).toBe(120)
    expect(result.status).toBe('exceeded')
  })

  it('trata limite zero sem dividir por zero', () => {
    const result = withProgress({ limitAmount: 0, alertThresholdPct: 80 }, 50)
    expect(result.progressPct).toBe(0)
    expect(Number.isFinite(result.progressPct)).toBe(true)
  })

  it('aceita limitAmount como string (Decimal do Prisma serializado)', () => {
    const result = withProgress({ limitAmount: '500.00', alertThresholdPct: 80 }, 600)
    expect(result.status).toBe('exceeded')
  })
})
