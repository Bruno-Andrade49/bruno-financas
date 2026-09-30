import { formatCurrencyBRL } from '../../utils/currency'

export type InsightCandidate = {
  type: 'top_expense' | 'category_increase' | 'budget_alert'
  severity: 'info' | 'warning'
  title: string
  description: string
  payload: Record<string, unknown>
}

export type CategorySpend = { categoryId: string; categoryName: string; total: number }

export type BudgetForAlert = {
  id: string
  categoryId: string
  category: { name: string }
  spent: number
  limitAmount: unknown
  progressPct: number
  status: 'ok' | 'warning' | 'exceeded'
}

export function topExpenseRule(categorySpend: CategorySpend[]): InsightCandidate[] {
  if (categorySpend.length === 0) return []
  const top = categorySpend.reduce((a, b) => (b.total > a.total ? b : a))
  if (top.total <= 0) return []

  return [{
    type: 'top_expense',
    severity: 'info',
    title: `Maior gasto do mês: ${top.categoryName}`,
    description: `Você gastou ${formatCurrencyBRL(top.total)} com ${top.categoryName} este mês, sua maior categoria de despesa.`,
    payload: { categoryId: top.categoryId, categoryName: top.categoryName, total: top.total },
  }]
}

export function categoryIncreaseRule(
  current: CategorySpend[],
  previousByCategory: Map<string, number>,
  thresholdPct = 20,
): InsightCandidate[] {
  const insights: InsightCandidate[] = []

  for (const entry of current) {
    const previous = previousByCategory.get(entry.categoryId)
    if (!previous || previous <= 0) continue // sem base de comparação no mês anterior

    const changePct = Math.round(((entry.total - previous) / previous) * 100)
    if (changePct < thresholdPct) continue

    insights.push({
      type: 'category_increase',
      severity: 'warning',
      title: `Alta em ${entry.categoryName}`,
      description: `Seus gastos com ${entry.categoryName} aumentaram ${changePct}% em relação ao mês passado (${formatCurrencyBRL(previous)} → ${formatCurrencyBRL(entry.total)}).`,
      payload: {
        categoryId: entry.categoryId,
        categoryName: entry.categoryName,
        previousTotal: previous,
        currentTotal: entry.total,
        changePct,
      },
    })
  }

  return insights
}

export function budgetAlertRule(budgets: BudgetForAlert[]): InsightCandidate[] {
  return budgets
    .filter((budget) => budget.status !== 'ok')
    .map((budget) => {
      const limit = Number(budget.limitAmount)
      const exceeded = budget.status === 'exceeded'
      return {
        type: 'budget_alert' as const,
        severity: 'warning' as const,
        title: exceeded ? `Orçamento de ${budget.category.name} estourado` : `Orçamento de ${budget.category.name} quase no limite`,
        description: exceeded
          ? `Você já gastou ${formatCurrencyBRL(budget.spent)} de um limite de ${formatCurrencyBRL(limit)} em ${budget.category.name} (${budget.progressPct}%).`
          : `Você já usou ${budget.progressPct}% do orçamento de ${budget.category.name} (${formatCurrencyBRL(budget.spent)} de ${formatCurrencyBRL(limit)}).`,
        payload: {
          budgetId: budget.id,
          categoryId: budget.categoryId,
          spent: budget.spent,
          limitAmount: limit,
          progressPct: budget.progressPct,
          status: budget.status,
        },
      }
    })
}
