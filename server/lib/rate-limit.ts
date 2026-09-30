import { getPrisma } from './prisma'

export interface RateLimitResult {
  allowed: boolean
  limit: number
  remaining: number
  resetAt: Date
}

// O contador fica no Postgres porque na Vercel cada requisição pode cair numa
// instância diferente; contador em memória não valeria entre elas.
export async function hitRateLimit(key: string, limit: number, windowMs: number): Promise<RateLimitResult> {
  const prisma = await getPrisma()
  const now = new Date()
  const nextReset = new Date(now.getTime() + windowMs)

  // incrementa numa consulta só (atômica); se a janela venceu, recomeça do 1
  const [row] = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
    INSERT INTO rate_limits (key, count, "resetAt")
    VALUES (${key}, 1, ${nextReset})
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits."resetAt" <= ${now} THEN 1 ELSE rate_limits.count + 1 END,
      "resetAt" = CASE WHEN rate_limits."resetAt" <= ${now} THEN ${nextReset} ELSE rate_limits."resetAt" END
    RETURNING count, "resetAt"
  `

  // de vez em quando apaga contadores vencidos pra tabela não crescer
  if (Math.random() < 0.01) {
    prisma.$executeRaw`DELETE FROM rate_limits WHERE "resetAt" < ${new Date(now.getTime() - 60 * 60 * 1000)}`.catch(() => {})
  }

  const count = Number(row!.count)
  return { allowed: count <= limit, limit, remaining: Math.max(0, limit - count), resetAt: new Date(row!.resetAt) }
}
