import type { H3Event } from 'h3'

export function requireUser(event: H3Event) {
  const user = event.context.user
  if (!user) {
    throw createError({ statusCode: 401, message: 'Não autenticado' })
  }
  return user as { id: string; email: string; name: string }
}
