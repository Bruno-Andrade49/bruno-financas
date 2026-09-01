import { getPrisma } from '../../lib/prisma'

export async function findManyForUser(userId: string) {
  const prisma = await getPrisma()
  return prisma.goal.findMany({
    where: { userId },
    orderBy: [{ status: 'asc' }, { targetDate: 'asc' }],
  })
}

export async function findByIdForUser(userId: string, id: string) {
  const prisma = await getPrisma()
  return prisma.goal.findFirst({ where: { id, userId } })
}

export async function create(
  userId: string,
  data: { name: string; targetAmount: number; targetDate: Date },
) {
  const prisma = await getPrisma()
  return prisma.goal.create({ data: { ...data, userId } })
}

export async function updateForUser(userId: string, id: string, data: Record<string, unknown>) {
  const prisma = await getPrisma()
  const result = await prisma.goal.updateMany({ where: { id, userId }, data: data as never })
  if (result.count === 0) return null
  return findByIdForUser(userId, id)
}

export async function deleteForUser(userId: string, id: string) {
  const prisma = await getPrisma()
  const result = await prisma.goal.deleteMany({ where: { id, userId } })
  return result.count > 0
}

/** Incrementa o aporte e retorna a meta atualizada (ou null se não for do usuário). */
export async function incrementContribution(userId: string, id: string, amount: number) {
  const prisma = await getPrisma()
  const result = await prisma.goal.updateMany({
    where: { id, userId },
    data: { currentAmount: { increment: amount } },
  })
  if (result.count === 0) return null
  return findByIdForUser(userId, id)
}

export async function markCompleted(userId: string, id: string) {
  const prisma = await getPrisma()
  await prisma.goal.updateMany({ where: { id, userId, status: 'active' }, data: { status: 'completed' } })
}
