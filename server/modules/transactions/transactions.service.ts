// Regra de negócio de transações. É esta camada — não a rota, não a IA —
// que qualquer consumidor (endpoint REST ou tool de IA) deve chamar
// (ARCHITECTURE.md, seção A e D).
import { getPrisma } from '../../lib/prisma'
import * as repo from './transactions.repository'
import type {
  CreateTransactionInput,
  UpdateTransactionInput,
  ListTransactionsQuery,
} from '#shared/schemas/transaction'
// NotFoundError e InvalidReferenceError vêm de server/utils/errors.ts,
// auto-importado pelo Nitro em qualquer módulo do server/.

/** Garante que a conta/categoria/forma de pagamento referenciadas são do próprio usuário. */
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

/** Usada pela tool de IA get_expenses_by_category (ARCHITECTURE.md, seção D). */
export async function sumByCategory(
  userId: string,
  input: { category: string; startDate: string; endDate: string },
) {
  const prisma = await getPrisma()
  const category = await prisma.category.findFirst({
    where: {
      name: { equals: input.category, mode: 'insensitive' },
      OR: [{ userId }, { userId: null, isSystem: true }],
    },
  })
  if (!category) {
    return { found: false as const, category: input.category }
  }

  const result = await repo.sumByCategoryForUser(
    userId,
    category.id,
    new Date(input.startDate),
    new Date(input.endDate),
  )
  return { found: true as const, category: category.name, ...result }
}

export async function monthlySummary(userId: string, month: string) {
  const { monthStart, monthEnd } = parseMonthParam(month)

  const { totalIncome, totalExpense, byCategory } = await repo.summaryForUserMonth(
    userId,
    monthStart,
    monthEnd,
  )

  return {
    month,
    totalIncome,
    totalExpense,
    savings: Number(totalIncome) - Number(totalExpense),
    byCategory,
  }
}
