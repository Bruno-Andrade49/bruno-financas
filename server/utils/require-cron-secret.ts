import type { H3Event } from 'h3'

/**
 * Protege rotas internas chamadas só pelo agendador (ex.: geração de
 * insights em lote) — nunca por sessão de usuário.
 * ARCHITECTURE.md, seção A/L: "rota interna autenticada por secret".
 */
export function requireCronSecret(event: H3Event) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    throw createError({ statusCode: 500, message: 'CRON_SECRET não configurado no servidor' })
  }
  const provided = getHeader(event, 'x-cron-secret')
  if (provided !== secret) {
    throw createError({ statusCode: 401, message: 'Não autorizado' })
  }
}
