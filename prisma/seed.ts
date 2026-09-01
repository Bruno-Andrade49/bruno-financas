// Categorias padrão do sistema (userId = null, isSystem = true) — toda conta
// nova já enxerga essas categorias, sem precisar criar nada manualmente.
// Rodar com: npm run db:seed
import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = process.env.DATABASE_URL
if (!connectionString) throw new Error('DATABASE_URL não definida')

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) })

const EXPENSE_CATEGORIES = [
  { name: 'Moradia', icon: 'home' },
  { name: 'Alimentação', icon: 'utensils' },
  { name: 'Transporte', icon: 'car' },
  { name: 'Saúde', icon: 'heart-pulse' },
  { name: 'Educação', icon: 'graduation-cap' },
  { name: 'Lazer', icon: 'party-popper' },
  { name: 'Compras', icon: 'shopping-bag' },
  { name: 'Assinaturas', icon: 'repeat' },
  { name: 'Outros', icon: 'ellipsis' },
]

const INCOME_CATEGORIES = [
  { name: 'Salário', icon: 'wallet' },
  { name: 'Investimentos', icon: 'trending-up' },
  { name: 'Freelance', icon: 'briefcase' },
  { name: 'Outros', icon: 'ellipsis' },
]

// Idempotente por (name, type) em vez de upsert por id: o id precisa ser um
// uuid de verdade (é o que shared/schemas/transaction.ts valida em
// categoryId), então não dá pra usar um id determinístico tipo
// "system-expense-Moradia" como chave de upsert.
async function ensureSystemCategory(data: { name: string; icon: string; type: 'income' | 'expense' }) {
  const existing = await prisma.category.findFirst({
    where: { name: data.name, type: data.type, isSystem: true, userId: null },
  })
  if (existing) return existing
  return prisma.category.create({ data: { ...data, isSystem: true } })
}

async function main() {
  for (const category of EXPENSE_CATEGORIES) {
    await ensureSystemCategory({ ...category, type: 'expense' })
  }

  for (const category of INCOME_CATEGORIES) {
    await ensureSystemCategory({ ...category, type: 'income' })
  }

  console.log(`Seed concluído: ${EXPENSE_CATEGORIES.length} categorias de despesa, ${INCOME_CATEGORIES.length} de receita.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
