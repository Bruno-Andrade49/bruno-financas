// Orquestra a geração de insights determinísticos. Só fala com outros
// módulos através dos services deles (budgets.service), nunca acessando o
// repository de outro domínio direto — ARCHITECTURE.md, seção A.
import * as repo from './insights.repository'
import * as budgetsService from '../budgets/budgets.service'
import { topExpenseRule, categoryIncreaseRule, budgetAlertRule } from './insights.rules'

export async function generateForUser(userId: string, month: string) {
  const { referenceMonth, monthStart, monthEnd } = parseMonthParam(month)
  const { monthStart: prevStart, monthEnd: prevEnd } = parseMonthParam(previousMonthKey(month))

  const [currentSpend, previousSpend, budgets] = await Promise.all([
    repo.categorySpendForMonth(userId, monthStart, monthEnd),
    repo.categorySpendForMonth(userId, prevStart, prevEnd),
    budgetsService.list(userId, month),
  ])

  const previousByCategory = new Map(previousSpend.map((entry) => [entry.categoryId, entry.total]))

  const candidates = [
    ...topExpenseRule(currentSpend),
    ...categoryIncreaseRule(currentSpend, previousByCategory),
    ...budgetAlertRule(budgets),
  ]

  await repo.replaceRuleEngineInsightsForPeriod(userId, referenceMonth, candidates)
  return repo.listForUser(userId)
}

/** Usado pela rota interna de cron — regenera para todo mundo (ARCHITECTURE.md, seção L). */
export async function generateForAllUsers(month: string) {
  const userIds = await repo.listActiveUserIds()
  for (const userId of userIds) {
    await generateForUser(userId, month)
  }
  return { usersProcessed: userIds.length }
}

export async function list(userId: string) {
  return repo.listForUser(userId)
}

export async function markRead(userId: string, id: string) {
  const updated = await repo.markReadForUser(userId, id)
  if (!updated) throw new NotFoundError('Insight não encontrado')
  return updated
}
