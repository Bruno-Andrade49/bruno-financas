import { hitRateLimit } from '../lib/rate-limit'

function waitLabel(seconds: number) {
  if (seconds < 60) return `${seconds} segundos`
  const minutes = Math.ceil(seconds / 60)
  return minutes === 1 ? '1 minuto' : `${minutes} minutos`
}

export default defineEventHandler(async (event) => {
  const path = event.path.split('?')[0]!
  const rule = rateLimitRuleFor(path, event.method)
  if (!rule) return

  const userId = event.context.user?.id as string | undefined
  const ip = getRequestIP(event, { xForwardedFor: true }) ?? 'desconhecido'
  const subject = rule.by === 'user' && userId ? `u:${userId}` : `ip:${ip}`

  let result
  try {
    result = await hitRateLimit(`${rule.name}:${subject}`, rule.limit, rule.windowMs)
  } catch (error) {
    // se o contador falhar, deixa passar: melhor que derrubar o site
    console.error('[rate-limit] falha ao contar, liberando a requisição:', error)
    return
  }

  setHeader(event, 'X-RateLimit-Limit', String(result.limit))
  setHeader(event, 'X-RateLimit-Remaining', String(result.remaining))
  if (result.allowed) return

  const retryAfter = Math.max(1, Math.ceil((result.resetAt.getTime() - Date.now()) / 1000))
  const message = `Muitas tentativas em pouco tempo. Tente de novo em ${waitLabel(retryAfter)}.`
  setHeader(event, 'Retry-After', retryAfter)
  setResponseStatus(event, 429)

  // /api/auth responde no formato do Better Auth; o resto, no formato da nossa API
  return path.startsWith('/api/auth/')
    ? { code: 'TOO_MANY_REQUESTS', message }
    : { error: { code: 'rate_limited', message } }
})
