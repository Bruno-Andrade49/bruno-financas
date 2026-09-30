import { getPrisma } from '../../lib/prisma'

export async function listForUser(userId: string) {
  const prisma = await getPrisma()
  return prisma.financialAccount.findMany({
    where: { userId, archivedAt: null },
    orderBy: { createdAt: 'asc' },
  })
}

export async function createDefaultAccount(userId: string) {
  const prisma = await getPrisma()
  return prisma.financialAccount.create({
    data: { userId, name: 'Carteira', type: 'wallet' },
  })
}
