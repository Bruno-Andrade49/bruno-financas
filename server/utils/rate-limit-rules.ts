export interface RateLimitRule {
  name: string
  limit: number
  windowMs: number
  /** Por IP (rotas sem login) ou por usuário logado. */
  by: 'ip' | 'user'
}

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE

// Rotas de conta: por IP, porque ainda não há usuário logado.
const AUTH_RULES: [RegExp, RateLimitRule][] = [
  [/^\/api\/auth\/sign-in\//, { name: 'sign-in', limit: 10, windowMs: 10 * MINUTE, by: 'ip' }],
  [/^\/api\/auth\/sign-up\//, { name: 'sign-up', limit: 5, windowMs: HOUR, by: 'ip' }],
  [/^\/api\/auth\/(request-password-reset|forget-password)/, { name: 'forgot', limit: 5, windowMs: HOUR, by: 'ip' }],
  [/^\/api\/auth\/reset-password/, { name: 'reset', limit: 10, windowMs: HOUR, by: 'ip' }],
  [/^\/api\/auth\/(send-verification-email|verify-email)/, { name: 'verify', limit: 10, windowMs: HOUR, by: 'ip' }],
]

const AUTH_DEFAULT: RateLimitRule = { name: 'auth', limit: 120, windowMs: MINUTE, by: 'ip' }
const INSIGHTS: RateLimitRule = { name: 'insights', limit: 5, windowMs: 5 * MINUTE, by: 'user' }
const WRITE: RateLimitRule = { name: 'write', limit: 60, windowMs: MINUTE, by: 'user' }
const READ: RateLimitRule = { name: 'read', limit: 300, windowMs: MINUTE, by: 'user' }

/** Regra que vale pra essa requisição, ou null se ela não tem limite (páginas, crons). */
export function rateLimitRuleFor(path: string, method: string): RateLimitRule | null {
  if (path.startsWith('/api/internal/')) return null

  if (path.startsWith('/api/auth/')) {
    return AUTH_RULES.find(([pattern]) => pattern.test(path))?.[1] ?? AUTH_DEFAULT
  }

  if (path.startsWith('/api/v1/')) {
    if (path.startsWith('/api/v1/insights/generate')) return INSIGHTS
    return method === 'GET' || method === 'HEAD' ? READ : WRITE
  }

  return null
}
