import { describe, expect, it } from 'vitest'
import { rateLimitRuleFor } from '../../server/utils/rate-limit-rules'

describe('rateLimitRuleFor', () => {
  it('login, cadastro e senha têm limites próprios por IP', () => {
    expect(rateLimitRuleFor('/api/auth/sign-in/email', 'POST')).toMatchObject({ name: 'sign-in', limit: 10, by: 'ip' })
    expect(rateLimitRuleFor('/api/auth/sign-up/email', 'POST')).toMatchObject({ name: 'sign-up', by: 'ip' })
    expect(rateLimitRuleFor('/api/auth/request-password-reset', 'POST')).toMatchObject({ name: 'forgot' })
    expect(rateLimitRuleFor('/api/auth/reset-password', 'POST')).toMatchObject({ name: 'reset' })
  })

  it('outras rotas de auth caem no limite geral', () => {
    expect(rateLimitRuleFor('/api/auth/get-session', 'GET')).toMatchObject({ name: 'auth' })
  })

  it('gerar insights tem limite próprio por usuário', () => {
    expect(rateLimitRuleFor('/api/v1/insights/generate', 'POST')).toMatchObject({ name: 'insights', limit: 5, by: 'user' })
  })

  it('escrita e leitura na API', () => {
    expect(rateLimitRuleFor('/api/v1/transactions', 'POST')).toMatchObject({ name: 'write' })
    expect(rateLimitRuleFor('/api/v1/transactions/abc', 'DELETE')).toMatchObject({ name: 'write' })
    expect(rateLimitRuleFor('/api/v1/transactions', 'GET')).toMatchObject({ name: 'read' })
  })

  it('crons e páginas ficam de fora', () => {
    expect(rateLimitRuleFor('/api/internal/cron/process-recurring', 'GET')).toBeNull()
    expect(rateLimitRuleFor('/dashboard', 'GET')).toBeNull()
    expect(rateLimitRuleFor('/og-image.jpg', 'GET')).toBeNull()
  })
})
