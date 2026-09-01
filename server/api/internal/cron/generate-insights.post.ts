// Chamada só pelo agendador (Vercel Cron em produção), nunca por sessão de
// usuário — protegida por secret, não por cookie (ARCHITECTURE.md, seção L).
import * as insightsService from '../../../modules/insights/insights.service'

export default defineApiHandler(async (event) => {
  requireCronSecret(event)
  return insightsService.generateForAllUsers(currentMonthKey())
})
