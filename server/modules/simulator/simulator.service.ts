import * as transactionsService from '../transactions/transactions.service'
import * as goalsService from '../goals/goals.service'

const BASIS_MONTHS = 3
// sem metas cadastradas, sugere guardar 10% da renda
const DEFAULT_SAVINGS_RATE = 0.1

const round = (value: number) => Math.round(value * 100) / 100

export async function baseline(userId: string) {
  const trend = await transactionsService.monthlyTrend(userId, BASIS_MONTHS + 1)
  const current = trend.at(-1)!
  const closed = trend.slice(0, -1).filter((m) => m.income > 0 || m.expense > 0)

  const basisMonths = closed.length > 0 ? closed : current.income > 0 || current.expense > 0 ? [current] : []
  const avg = (key: 'income' | 'expense') =>
    basisMonths.length ? round(basisMonths.reduce((sum, m) => sum + m[key], 0) / basisMonths.length) : 0

  const monthlyIncome = avg('income')
  const monthlyExpenses = avg('expense')

  const goals = (await goalsService.list(userId))
    .filter((goal) => goal.status === 'active' && goal.remainingAmount > 0)
    .map((goal) => ({ id: goal.id, name: goal.name, monthly: goal.suggestedMonthlyContribution }))
  const goalsTotal = round(goals.reduce((sum, goal) => sum + goal.monthly, 0))

  return {
    monthlyIncome,
    monthlyExpenses,
    savingsTarget: goals.length ? goalsTotal : round(monthlyIncome * DEFAULT_SAVINGS_RATE),
    savingsSource: goals.length ? ('goals' as const) : ('default_rate' as const),
    goals,
    basis: {
      months: basisMonths.length,
      kind: closed.length > 0 ? ('closed_months' as const) : basisMonths.length ? ('current_month' as const) : ('none' as const),
    },
  }
}
