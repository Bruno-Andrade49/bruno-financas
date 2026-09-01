import { getPrisma } from '../../lib/prisma'

export async function listForUser(userId: string) {
  const prisma = await getPrisma()
  return prisma.paymentMethod.findMany({
    where: { userId, archivedAt: null },
    orderBy: { createdAt: 'asc' },
  })
}

/** Cria a forma de pagamento padrão de um usuário novo (ver server/lib/auth.ts, databaseHooks). */
export async function createDefaultPaymentMethod(userId: string) {
  const prisma = await getPrisma()
  return prisma.paymentMethod.create({
    data: { userId, name: 'Dinheiro', type: 'cash' },
  })
}
