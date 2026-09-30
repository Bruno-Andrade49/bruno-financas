import { getPrisma } from '../../lib/prisma'

export async function findManyForUserMonth(userId: string, referenceMonth: Date) {
  const prisma = await getPrisma()
  return prisma.budget.findMany({
    where: { userId, referenceMonth },
    include: { category: true },
    orderBy: { createdAt: 'asc' },
  })
}

export async function findByIdForUser(userId: string, id: string) {
  const prisma = await getPrisma()
  return prisma.budget.findFirst({ where: { id, userId }, include: { category: true } })
}

export async function create(
  userId: string,
  data: { categoryId: string; limitAmount: number; referenceMonth: Date; alertThresholdPct: number },
) {
  const prisma = await getPrisma()
  return prisma.budget.create({ data: { ...data, userId }, include: { category: true } })
}

export async function updateForUser(userId: string, id: string, data: Record<string, unknown>) {
  const prisma = await getPrisma()
  const result = await prisma.budget.updateMany({ where: { id, userId }, data: data as never })
  if (result.count === 0) return null
  return findByIdForUser(userId, id)
}

export async function deleteForUser(userId: string, id: string) {
  const prisma = await getPrisma()
  const result = await prisma.budget.deleteMany({ where: { id, userId } })
  return result.count > 0
}

export async function spentForCategoryMonth(
  userId: string,
  categoryId: string,
  monthStart: Date,
  monthEnd: Date,
) {
  const prisma = await getPrisma()
  const result = await prisma.transaction.aggregate({
    where: {
      userId,
      categoryId,
      type: 'expense',
      deletedAt: null,
      date: { gte: monthStart, lte: monthEnd },
    },
    _sum: { amount: true },
  })
  return Number(result._sum.amount ?? 0)
}
