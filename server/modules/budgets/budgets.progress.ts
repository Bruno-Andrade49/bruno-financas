// Função pura, sem dependência de banco — cálculo de progresso de orçamento
// (ARCHITECTURE.md, seção C: nunca persistido, sempre recalculado).
export type BudgetStatus = 'ok' | 'warning' | 'exceeded'

export function withProgress<T extends { limitAmount: unknown; alertThresholdPct: number }>(
  budget: T,
  spent: number,
): T & { spent: number; progressPct: number; status: BudgetStatus } {
  const limit = Number(budget.limitAmount)
  const progressPct = limit > 0 ? Math.round((spent / limit) * 100) : 0
  const status: BudgetStatus = spent > limit ? 'exceeded' : progressPct >= budget.alertThresholdPct ? 'warning' : 'ok'
  return { ...budget, spent, progressPct, status }
}
