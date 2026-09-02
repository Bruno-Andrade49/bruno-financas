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

/** Categoria por nome (case-insensitive), só entre as do usuário + as do sistema — nunca de outro usuário. */
async function findCategoryByNameForUser(userId: string, name: string, type?: 'income' | 'expense') {
  const prisma = await getPrisma()
  return prisma.category.findFirst({
    where: {
      name: { equals: name, mode: 'insensitive' },
      OR: [{ userId }, { userId: null, isSystem: true }],
      ...(type ? { type } : {}),
    },
  })
}

/** Usada pela tool de IA get_expenses_by_category (ARCHITECTURE.md, seção D). */
export async function sumByCategory(
  userId: string,
  input: { category: string; startDate: string; endDate: string },
) {
  const category = await findCategoryByNameForUser(userId, input.category)
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

/** Usada pelas tools de IA get_income_vs_expenses e compare_periods. */
export async function totalsForPeriod(userId: string, startDate: string, endDate: string) {
  const { totalIncome, totalExpense } = await repo.summaryForUserMonth(
    userId,
    new Date(startDate),
    new Date(endDate),
  )
  return {
    totalIncome: Number(totalIncome),
    totalExpense: Number(totalExpense),
    savings: Number(totalIncome) - Number(totalExpense),
  }
}

/**
 * Cria uma transação a partir da tool de IA create_transaction — mesma
 * validação e mesmo service do endpoint REST, só resolve categoria por nome
 * (o modelo não conhece IDs) e usa a conta/forma de pagamento padrão do
 * usuário (ARCHITECTURE.md, seção D: a tool nunca recebe userId do modelo,
 * e aqui nem financialAccountId — sempre injetado pelo servidor).
 */
export async function createFromAssistant(
  userId: string,
  input: { type: 'income' | 'expense'; amount: number; categoryName: string; description: string; date: string },
) {
  const prisma = await getPrisma()

  const category = await findCategoryByNameForUser(userId, input.categoryName, input.type)
  if (!category) {
    throw new InvalidReferenceError(`Categoria "${input.categoryName}" não encontrada`)
  }

  const financialAccount = await prisma.financialAccount.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } })
  if (!financialAccount) throw new InvalidReferenceError('Nenhuma conta financeira encontrada')

  const paymentMethod = await prisma.paymentMethod.findFirst({ where: { userId }, orderBy: { createdAt: 'asc' } })

  const transaction = await repo.create(userId, {
    type: input.type,
    amount: input.amount,
    description: input.description,
    date: new Date(input.date),
    categoryId: category.id,
    financialAccountId: financialAccount.id,
    paymentMethodId: paymentMethod?.id ?? null,
    source: 'ai_nl',
  })

  return { ...transaction, categoryName: category.name }
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
