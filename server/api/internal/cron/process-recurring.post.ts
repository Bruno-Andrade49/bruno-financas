// Chamada só pelo agendador (Vercel Cron em produção), nunca por sessão de
// usuário — protegida por secret (ARCHITECTURE.md, seção E fluxo 10 / L).
import * as recurringService from '../../../modules/recurring/recurring.service'

export default defineApiHandler(async (event) => {
  requireCronSecret(event)
  const today = new Date()
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  return recurringService.processDue(todayUtc)
})
