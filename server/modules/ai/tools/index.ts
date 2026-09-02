import type { AiTool } from './types'
import { getExpensesByCategoryTool } from './get-expenses-by-category'
import { getIncomeVsExpensesTool } from './get-income-vs-expenses'
import { comparePeriodsTool } from './compare-periods'
import { getBudgetStatusTool } from './get-budget-status'
import { getGoalProjectionTool } from './get-goal-projection'
import { createTransactionTool } from './create-transaction'

// Allowlist explícita — a IA só enxerga estas tools, nunca o banco direto
// nem qualquer outra ação do sistema (ARCHITECTURE.md, seção D).
export const aiTools: AiTool[] = [
  getExpensesByCategoryTool,
  getIncomeVsExpensesTool,
  comparePeriodsTool,
  getBudgetStatusTool,
  getGoalProjectionTool,
  createTransactionTool,
]

export const aiToolsByName = new Map(aiTools.map((tool) => [tool.name, tool]))
