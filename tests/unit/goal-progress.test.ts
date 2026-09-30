import { describe, expect, it } from 'vitest'
import { computeGoalProgress } from '../../server/modules/goals/goals.progress'

const today = new Date(Date.UTC(2026, 0, 15)) // 2026-01-15

function makeGoal(overrides: Partial<{ targetAmount: number; currentAmount: number; targetDate: Date; status: string }> = {}) {
  return {
    targetAmount: 12000,
    currentAmount: 3000,
    targetDate: new Date(Date.UTC(2026, 11, 31)), // 2026-12-31
    status: 'active',
    ...overrides,
  }
}

describe('computeGoalProgress', () => {
  it('calcula percentual de progresso corretamente', () => {
    const result = computeGoalProgress(makeGoal(), today)
    expect(result.progressPct).toBe(25)
    expect(result.remainingAmount).toBe(9000)
  })

  it('sugere aporte mensal dividindo o restante pelos meses até a data-alvo', () => {
    const result = computeGoalProgress(makeGoal(), today)
    expect(result.monthsRemaining).toBe(12)
    expect(result.suggestedMonthlyContribution).toBe(750)
  })

  it('marca como atrasada quando a data-alvo já passou e a meta não foi atingida', () => {
    const result = computeGoalProgress(makeGoal({ targetDate: new Date(Date.UTC(2025, 11, 31)) }), today)
    expect(result.isOverdue).toBe(true)
    expect(result.monthsRemaining).toBe(0)
    expect(result.suggestedMonthlyContribution).toBe(9000)
  })

  it('não marca como atrasada se o status não é "active"', () => {
    const result = computeGoalProgress(makeGoal({ targetDate: new Date(Date.UTC(2025, 11, 31)), status: 'abandoned' }), today)
    expect(result.isOverdue).toBe(false)
  })

  it('limita o progresso em 100% mesmo se currentAmount ultrapassar o alvo', () => {
    const result = computeGoalProgress(makeGoal({ currentAmount: 15000 }), today)
    expect(result.progressPct).toBe(100)
    expect(result.remainingAmount).toBe(0)
  })

  it('trata targetAmount zero sem dividir por zero', () => {
    const result = computeGoalProgress(makeGoal({ targetAmount: 0, currentAmount: 0 }), today)
    expect(result.progressPct).toBe(0)
    expect(Number.isFinite(result.progressPct)).toBe(true)
  })
})
