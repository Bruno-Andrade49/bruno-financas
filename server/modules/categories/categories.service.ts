import { getPrisma } from '../../lib/prisma'

export async function listForUser(userId: string) {
  const prisma = await getPrisma()
  return prisma.category.findMany({
    where: { OR: [{ userId }, { userId: null, isSystem: true }] },
    orderBy: [{ isSystem: 'desc' }, { name: 'asc' }],
    include: { children: true },
  })
}

export async function createForUser(
  userId: string,
  input: { name: string; type: 'income' | 'expense'; parentId?: string | null; icon?: string; color?: string },
) {
  const prisma = await getPrisma()

  if (input.parentId) {
    const parent = await prisma.category.findFirst({
      where: { id: input.parentId, OR: [{ userId }, { userId: null, isSystem: true }] },
    })
    if (!parent) throw new InvalidReferenceError('Categoria pai inválida')
  }

  return prisma.category.create({ data: { ...input, userId } })
}
