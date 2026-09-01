// Singleton do Prisma Client, com driver adapter escolhido pelo ambiente.
//
// - Neon (produção/staging, serverless): conexão HTTP/WebSocket, sem manter
//   TCP aberto por instância — evita esgotar o limite de conexões do Postgres
//   quando várias funções serverless sobem ao mesmo tempo (ARCHITECTURE.md, seção B).
// - node-postgres (dev local via Docker Compose): pool TCP tradicional.
//
// Detecção automática pela própria connection string; pode ser forçada via
// DATABASE_DRIVER=neon|pg quando necessário (ex.: testar o adapter de produção
// localmente contra um branch do Neon).
import { PrismaClient } from '../../generated/prisma/client'

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DATABASE_URL não definida — copie .env.example para .env e configure o banco.')
  }

  const driver = process.env.DATABASE_DRIVER ?? (connectionString.includes('neon.tech') ? 'neon' : 'pg')

  if (driver === 'neon') {
    // Import dinâmico: evita empacotar o driver do node-postgres em ambientes
    // que só usam Neon, e vice-versa.
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
  // eslint-disable-next-line no-var
  var __prismaClientPromise: Promise<PrismaClient> | undefined
}

// Em dev, o HMR do Nitro recarrega módulos sem reiniciar o processo — guardar
// a instância em `globalThis` evita abrir um novo pool a cada reload.
const prismaPromise = globalThis.__prismaClientPromise ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalThis.__prismaClientPromise = prismaPromise
}

export async function getPrisma(): Promise<PrismaClient> {
  return prismaPromise
}
