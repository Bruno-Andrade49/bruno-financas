import { getPrisma } from '../../lib/prisma'
import * as repo from './budgets.repository'
import { withProgress } from './budgets.progress'
import type { CreateBudgetInput, UpdateBudgetInput } from '#shared/schemas/budget'

async function assertCategoryOwnedAndExpense(userId: string, categoryId: string) {
  const prisma = await getPrisma()
  const category = await prisma.category.findFirst({
    where: { id: categoryId, OR: [{ userId }, { userId: null, isSystem: true }] },
  })
  if (!category) throw new InvalidReferenceError('Categoria inválida')
  if (category.type !== 'expense') {
    throw new InvalidReferenceError('Orçamentos só podem ser definidos para categorias de despesa')
  }
}

export async function list(userId: string, month: string) {
  const { referenceMonth, monthStart, monthEnd } = parseMonthParam(month)
  const budgets = await repo.findManyForUserMonth(userId, referenceMonth)

  return Promise.all(
    budgets.map(async (budget) => {
      const spent = await repo.spentForCategoryMonth(userId, budget.categoryId, monthStart, monthEnd)
      return withProgress(budget, spent)
    }),
  )
}

export async function create(userId: string, input: CreateBudgetInput) {
  await assertCategoryOwnedAndExpense(userId, input.categoryId)
  const { referenceMonth, monthStart, monthEnd } = parseMonthParam(input.referenceMonth)

  try {
    const budget = await repo.create(userId, {
      categoryId: input.categoryId,
      limitAmount: input.limitAmount,
      referenceMonth,
      alertThresholdPct: input.alertThresholdPct,
    })
    const spent = await repo.spentForCategoryMonth(userId, budget.categoryId, monthStart, monthEnd)
    return withProgress(budget, spent)
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      throw new AppError(409, 'budget_already_exists', 'Já existe um orçamento para essa categoria neste mês')
    }
    throw error
  }
}

export async function update(userId: string, id: string, input: UpdateBudgetInput) {
  const updated = await repo.updateForUser(userId, id, input)
  if (!updated) throw new NotFoundError('Orçamento não encontrado')

  const { monthStart, monthEnd } = parseMonthParam(monthKey(updated.referenceMonth))
  const spent = await repo.spentForCategoryMonth(userId, updated.categoryId, monthStart, monthEnd)
  return withProgress(updated, spent)
}

export async function remove(userId: string, id: string) {
  const deleted = await repo.deleteForUser(userId, id)
  if (!deleted) throw new NotFoundError('Orçamento não encontrado')
}

function isUniqueConstraintError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002')
}
