import { getPrisma } from '../../lib/prisma'
import * as repo from './recurring.repository'
import { isRecurrenceDue } from './recurring.schedule'
import type { CreateRecurringTransactionInput, UpdateRecurringTransactionInput } from '#shared/schemas/recurring'

async function assertOwnedReferences(
  userId: string,
  refs: { financialAccountId?: string; categoryId?: string; paymentMethodId?: string | null },
) {
  const prisma = await getPrisma()

  if (refs.financialAccountId) {
    const account = await prisma.financialAccount.findFirst({ where: { id: refs.financialAccountId, userId } })
    if (!account) throw new InvalidReferenceError('Conta financeira inválida')
  }
  if (refs.categoryId) {
    const category = await prisma.category.findFirst({
      where: { id: refs.categoryId, OR: [{ userId }, { userId: null, isSystem: true }] },
    })
    if (!category) throw new InvalidReferenceError('Categoria inválida')
  }
  if (refs.paymentMethodId) {
    const method = await prisma.paymentMethod.findFirst({ where: { id: refs.paymentMethodId, userId } })
    if (!method) throw new InvalidReferenceError('Forma de pagamento inválida')
  }
}

export async function list(userId: string) {
  return repo.findManyForUser(userId)
}

export async function getById(userId: string, id: string) {
  const recurring = await repo.findByIdForUser(userId, id)
  if (!recurring) throw new NotFoundError('Recorrência não encontrada')
  return recurring
}

export async function create(userId: string, input: CreateRecurringTransactionInput) {
  await assertOwnedReferences(userId, input)
  return repo.create(userId, {
    ...input,
    startDate: new Date(input.startDate),
    endDate: input.endDate ? new Date(input.endDate) : null,
  })
}

export async function update(userId: string, id: string, input: UpdateRecurringTransactionInput) {
  const data = { ...input, ...(input.endDate !== undefined ? { endDate: input.endDate ? new Date(input.endDate) : null } : {}) }
  const updated = await repo.updateForUser(userId, id, data)
  if (!updated) throw new NotFoundError('Recorrência não encontrada')
  return updated
}

export async function remove(userId: string, id: string) {
  const deleted = await repo.deleteForUser(userId, id)
  if (!deleted) throw new NotFoundError('Recorrência não encontrada')
}

export async function processDue(today: Date) {
  const candidates = await repo.findActiveCandidates(today)
  let generated = 0
  let skipped = 0

  for (const recurring of candidates) {
    const due = isRecurrenceDue(
      {
        frequency: recurring.frequency,
        startDate: recurring.startDate,
        endDate: recurring.endDate,
        dayOfMonth: recurring.dayOfMonth,
      },
      today,
    )
    if (!due) continue

    const alreadyGenerated = await repo.existsGeneratedFor(recurring.id, today)
    if (alreadyGenerated) {
      skipped++
      continue
    }

    try {
      await repo.generateOccurrence(recurring, today)
      generated++
    } catch (error) {
      if (isUniqueConstraintError(error)) {
        skipped++
        continue
      }
      throw error
    }
  }

  return { candidates: candidates.length, generated, skipped }
}

function isUniqueConstraintError(error: unknown): boolean {
  return Boolean(error && typeof error === 'object' && 'code' in error && (error as { code: string }).code === 'P2002')
}
