import { PrismaClient } from '../../generated/prisma/client'

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL não definida. Copie .env.example para .env e configure o banco.')
  }

  const driver = process.env.DATABASE_DRIVER ?? (connectionString.includes('neon.tech') ? 'neon' : 'pg')

  if (driver === 'neon') {
    return import('@prisma/adapter-neon').then(({ PrismaNeon }) => {
      const adapter = new PrismaNeon({ connectionString })
      return new PrismaClient({ adapter })
    })
  }

  return import('@prisma/adapter-pg').then(({ PrismaPg }) => {
    const adapter = new PrismaPg({ connectionString })
    return new PrismaClient({ adapter })
  })
}

declare global {
  var __prismaClientPromise: Promise<PrismaClient> | undefined
}

const prismaPromise = globalThis.__prismaClientPromise ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaClientPromise = prismaPromise
}

export async function getPrisma(): Promise<PrismaClient> {
  return prismaPromise
}
