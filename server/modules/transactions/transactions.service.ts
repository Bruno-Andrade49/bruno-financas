import { getPrisma } from '../../lib/prisma'
import * as repo from './transactions.repository'
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  ListTransactionsQuery,
} from '#shared/schemas/transaction'

async function assertOwnedReferences(
  userId: string,
  refs: { financialAccountId?: string; categoryId?: string; paymentMethodId?: string | null },
) {
  const prisma = await getPrisma()

  if (refs.financialAccountId) {
    const account = await prisma.financialAccount.findFirst({
      where: { id: refs.financialAccountId, userId },
      select: { id: true },
    })
    if (!account) throw new InvalidReferenceError('Conta financeira inválida')
  }

  if (refs.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: refs.categoryId, OR: [{ userId }, { userId: null, isSystem: true }] },
      select: { id: true },
    })
    if (!category) throw new InvalidReferenceError('Categoria inválida')
  }

  if (refs.paymentMethodId) {
    const method = await prisma.paymentMethod.findFirst({
      where: { id: refs.paymentMethodId, userId },
      select: { id: true },
    })
    if (!method) throw new InvalidReferenceError('Forma de pagamento inválida')
  }
}

export async function list(userId: string, query: ListTransactionsQuery) {
  return repo.findManyForUser(userId, query)
}

export async function getById(userId: string, id: string) {
  const transaction = await repo.findByIdForUser(userId, id)
  if (!transaction) throw new NotFoundError('Transação não encontrada')
  return transaction
}

export async function create(userId: string, input: CreateTransactionInput) {
  await assertOwnedReferences(userId, input)
  return repo.create(userId, { ...input, date: new Date(input.date) })
}

export async function update(userId: string, id: string, input: UpdateTransactionInput) {
  await assertOwnedReferences(userId, input)
  const data = { ...input, ...(input.date ? { date: new Date(input.date) } : {}) }
  const updated = await repo.updateForUser(userId, id, data)
  if (!updated) throw new NotFoundError('Transação não encontrada')
  return updated
}

export async function remove(userId: string, id: string) {
  const deleted = await repo.softDeleteForUser(userId, id)
  if (!deleted) throw new NotFoundError('Transação não encontrada')
}

export async function monthlyTrend(userId: string, months: number) {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1))
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1))

  const rows = await repo.findForTrend(userId, start, end)

  const buckets = new Map<string, { month: string; income: number; expense: number }>()
  for (let i = 0; i < months; i++) {
    const d = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + i, 1))
    const key = d.toISOString().slice(0, 7)
    buckets.set(key, { month: key, income: 0, expense: 0 })
  }
  for (const row of rows) {
    const bucket = buckets.get(row.date.toISOString().slice(0, 7))
    if (bucket) bucket[row.type] += Number(row.amount)
  }
  return [...buckets.values()]
}

export async function monthlySummary(userId: string, month: string) {
  const { monthStart, monthEnd } = parseMonthParam(month)

  const { totalIncome, totalExpense, byCategory } = await repo.summaryForUserMonth(
    userId,
    monthStart,
    monthEnd,
  )

  const names = new Map(
    (await repo.findCategoryNames(byCategory.map((row) => row.categoryId))).map((c) => [c.id, c.name]),
  )

  return {
    month,
    totalIncome,
    totalExpense,
    savings: Number(totalIncome) - Number(totalExpense),
    byCategory: byCategory
      .map((row) => ({
        categoryId: row.categoryId,
        name: names.get(row.categoryId) ?? 'Sem categoria',
        total: Number(row._sum.amount ?? 0),
      }))
      .sort((a, b) => b.total - a.total),
  }
}
