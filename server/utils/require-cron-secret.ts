import { timingSafeEqual } from 'node:crypto'
import type { H3Event } from 'h3'

export function requireCronSecret(event: H3Event) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    throw createError({ statusCode: 500, message: 'CRON_SECRET não configurado no servidor' })
  }

  // a Vercel manda "Authorization: Bearer <CRON_SECRET>"
  const bearer = getHeader(event, 'authorization')?.replace(/^Bearer\s+/i, '')
  const provided = getHeader(event, 'x-cron-secret') ?? bearer ?? ''

  const expected = Buffer.from(secret)
  const given = Buffer.from(provided)
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }
}
