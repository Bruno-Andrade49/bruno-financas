import { getPrisma } from '../../lib/prisma'
import type { Prisma } from '../../../generated/prisma/client'
import type { CategorySpend, InsightCandidate } from './insights.rules'

export async function categorySpendForMonth(userId: string, monthStart: Date, monthEnd: Date): Promise<CategorySpend[]> {
  const prisma = await getPrisma()
  const rows = await prisma.transaction.groupBy({
    by: ['categoryId'],
    where: { userId, type: 'expense', deletedAt: null, date: { gte: monthStart, lte: monthEnd } },
    _sum: { amount: true },
  })
  if (rows.length === 0) return []

  const categories = await prisma.category.findMany({ where: { id: { in: rows.map((r) => r.categoryId) } } })
  const nameById = new Map(categories.map((c) => [c.id, c.name]))

  return rows.map((r) => ({
    categoryId: r.categoryId,
    categoryName: nameById.get(r.categoryId) ?? 'Categoria',
    total: Number(r._sum.amount ?? 0),
  }))
}

export async function replaceRuleEngineInsightsForPeriod(
  userId: string,
  referencePeriod: Date,
  candidates: InsightCandidate[],
) {
  const prisma = await getPrisma()
  await prisma.$transaction([
    prisma.financialInsight.deleteMany({ where: { userId, referencePeriod, generatedBy: 'rule_engine' } }),
    ...(candidates.length
      ? [
          prisma.financialInsight.createMany({
            data: candidates.map((candidate) => ({
              userId,
              referencePeriod,
              generatedBy: 'rule_engine' as const,
              type: candidate.type,
              severity: candidate.severity,
              title: candidate.title,
              description: candidate.description,
              payload: candidate.payload as Prisma.InputJsonValue,
            })),
          }),
        ]
      : []),
  ])
}

export async function listForUser(userId: string, limit = 30) {
  const prisma = await getPrisma()
  return prisma.financialInsight.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function markReadForUser(userId: string, id: string) {
  const prisma = await getPrisma()
  const result = await prisma.financialInsight.updateMany({
    where: { id, userId, readAt: null },
    data: { readAt: new Date() },
  })
  if (result.count === 0) return null
  return prisma.financialInsight.findFirst({ where: { id, userId } })
}

export async function listActiveUserIds(): Promise<string[]> {
  const prisma = await getPrisma()
  const users = await prisma.user.findMany({ where: { deletedAt: null }, select: { id: true } })
  return users.map((u) => u.id)
}
