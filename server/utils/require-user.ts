import type { H3Event } from 'h3'

/**
 * Garante que a request está autenticada e retorna o usuário da sessão.
 * Toda rota/service que toca dado sensível deve chamar isso primeiro — é a
 * única fonte confiável de userId (nunca vindo de body/query/params).
 */
export function requireUser(event: H3Event) {
  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }
  return user as { id: string; email: string; name: string }
}
