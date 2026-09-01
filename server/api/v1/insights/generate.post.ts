// Gera (regenera) os insights do mês atual para o usuário autenticado.
// Em produção isso roda sozinho via cron (/api/internal/cron/generate-insights);
// esta rota existe pra permitir "atualizar agora" sob demanda.
import * as insightsService from '../../../modules/insights/insights.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  return insightsService.generateForUser(user.id, currentMonthKey())
})
