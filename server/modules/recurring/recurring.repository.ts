import { getPrisma } from '../../lib/prisma'

export async function findManyForUser(userId: string) {
  const prisma = await getPrisma()
  return prisma.recurringTransaction.findMany({
    where: { userId },
    include: { category: true, financialAccount: true, paymentMethod: true },
    orderBy: [{ active: 'desc' }, { createdAt: 'desc' }],
  })
}

export async function findByIdForUser(userId: string, id: string) {
  const prisma = await getPrisma()
  return prisma.recurringTransaction.findFirst({
    where: { id, userId },
    include: { category: true, financialAccount: true, paymentMethod: true },
  })
}

export async function create(userId: string, data: Record<string, unknown>) {
  const prisma = await getPrisma()
  return prisma.recurringTransaction.create({
    data: { ...data, userId } as never,
    include: { category: true, financialAccount: true, paymentMethod: true },
  })
}

export async function updateForUser(userId: string, id: string, data: Record<string, unknown>) {
  const prisma = await getPrisma()
  const result = await prisma.recurringTransaction.updateMany({ where: { id, userId }, data: data as never })
  if (result.count === 0) return null
  return findByIdForUser(userId, id)
}

export async function deleteForUser(userId: string, id: string) {
  const prisma = await getPrisma()
  const result = await prisma.recurringTransaction.deleteMany({ where: { id, userId } })
  return result.count > 0
}

/** Candidatas ativas de todos os usuários — filtro grosso pro cron, a checagem fina é em recurring.schedule.ts. */
export async function findActiveCandidates(today: Date) {
  const prisma = await getPrisma()
  return prisma.recurringTransaction.findMany({
    where: {
      active: true,
      startDate: { lte: today },
      OR: [{ endDate: null }, { endDate: { gte: today } }],
    },
  })
}

/** Idempotente: já existe uma transação gerada por essa recorrência nessa data exata? */
export async function existsGeneratedFor(recurringTransactionId: string, date: Date) {
  const prisma = await getPrisma()
  const existing = await prisma.transaction.findFirst({
    where: { recurringTransactionId, date },
    select: { id: true },
  })
  return existing !== null
}

/** Cria a transação do dia e marca a recorrência — atômico, então nunca fica um sem o outro. */
export async function generateOccurrence(recurring: {
  id: string
  userId: string
  financialAccountId: string
  categoryId: string
  paymentMethodId: string | null
  type: 'income' | 'expense'
  amount: unknown
  description: string
}, date: Date) {
  const prisma = await getPrisma()
  return prisma.$transaction(async (tx) => {
    const transaction = await tx.transaction.create({
      data: {
        userId: recurring.userId,
        financialAccountId: recurring.financialAccountId,
        categoryId: recurring.categoryId,
        paymentMethodId: recurring.paymentMethodId,
        recurringTransactionId: recurring.id,
        type: recurring.type,
        amount: recurring.amount as never,
        description: recurring.description,
        date,
        source: 'recurring',
      },
    })
    await tx.recurringTransaction.update({
      where: { id: recurring.id },
      data: { lastGeneratedFor: date },
    })
    return transaction
  })
}
