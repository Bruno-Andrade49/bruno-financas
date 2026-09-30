import { getPrisma } from '../../lib/prisma'
import type { ListTransactionsQuery } from '#shared/schemas/transaction'

export async function findManyForUser(userId: string, query: ListTransactionsQuery) {
  const prisma = await getPrisma()

  const where = {
    userId,
    deletedAt: null,
    ...(query.categoryId ? { categoryId: query.categoryId } : {}),
    ...(query.type ? { type: query.type } : {}),
    ...(query.q ? { description: { contains: query.q, mode: 'insensitive' as const } } : {}),
    ...(query.from || query.to
      ? {
          date: {
            ...(query.from ? { gte: new Date(query.from) } : {}),
            ...(query.to ? { lte: new Date(query.to) } : {}),
          },
        }
      : {}),
  }

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      // desempate pra paginação não repetir nem pular itens
      orderBy: [{ date: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }],
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
      include: { category: true, paymentMethod: true, financialAccount: true },
    }),
    prisma.transaction.count({ where }),
  ])

  return { items, total, page: query.page, pageSize: query.pageSize }
}

export async function findByIdForUser(userId: string, id: string) {
  const prisma = await getPrisma()
  return prisma.transaction.findFirst({
    where: { id, userId, deletedAt: null },
    include: { category: true, paymentMethod: true, financialAccount: true },
  })
}

export async function create(userId: string, data: Record<string, unknown>) {
  const prisma = await getPrisma()
  return prisma.transaction.create({
    data: { ...data, userId } as never,
    include: { category: true, paymentMethod: true, financialAccount: true },
  })
}

export async function updateForUser(userId: string, id: string, data: Record<string, unknown>) {
  const prisma = await getPrisma()
  const result = await prisma.transaction.updateMany({
    where: { id, userId, deletedAt: null },
    data: data as never,
  })
  if (result.count === 0) return null
  return findByIdForUser(userId, id)
}

export async function softDeleteForUser(userId: string, id: string) {
  const prisma = await getPrisma()
  const result = await prisma.transaction.updateMany({
    where: { id, userId, deletedAt: null },
    data: { deletedAt: new Date() },
  })
  return result.count > 0
}

export async function findForTrend(userId: string, start: Date, end: Date) {
  const prisma = await getPrisma()
  return prisma.transaction.findMany({
    where: { userId, deletedAt: null, date: { gte: start, lt: end } },
    select: { date: true, type: true, amount: true },
  })
}

export async function findCategoryNames(ids: string[]) {
  const prisma = await getPrisma()
  return prisma.category.findMany({ where: { id: { in: ids } }, select: { id: true, name: true } })
}

export async function summaryForUserMonth(userId: string, monthStart: Date, monthEnd: Date) {
  const prisma = await getPrisma()

  const [income, expense, byCategory] = await Promise.all([
    prisma.transaction.aggregate({
      where: { userId, type: 'income', deletedAt: null, date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.aggregate({
      where: { userId, type: 'expense', deletedAt: null, date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
    prisma.transaction.groupBy({
      by: ['categoryId'],
      where: { userId, type: 'expense', deletedAt: null, date: { gte: monthStart, lte: monthEnd } },
      _sum: { amount: true },
    }),
  ])

  return {
    totalIncome: income._sum.amount ?? 0,
    totalExpense: expense._sum.amount ?? 0,
    byCategory,
  }
}
