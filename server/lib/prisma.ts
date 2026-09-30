import { PrismaClient } from '../../generated/prisma/client'

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL não definida. Copie .env.example para .env e configure o banco.')
  }

  if (process.env.VERCEL && /@(localhost|127\.0\.0\.1)[:/]/.test(connectionString)) {
    console.error('[prisma] DATABASE_URL aponta pra localhost na Vercel. Use a connection string do Neon.')
  }

  const driver = process.env.DATABASE_DRIVER ?? (connectionString.includes('neon.tech') ? 'neon' : 'pg')

  if (driver === 'neon') {
    return Promise.all([import('@prisma/adapter-neon'), import('@neondatabase/serverless'), import('ws')]).then(
      ([{ PrismaNeon }, { neonConfig }, { default: ws }]) => {
        // o driver do Neon conecta por WebSocket; sem isso, depende da versão do Node
        neonConfig.webSocketConstructor = ws
        const adapter = new PrismaNeon({ connectionString })
        return new PrismaClient({ adapter })
      },
    )
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
