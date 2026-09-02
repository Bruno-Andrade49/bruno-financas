import { z } from 'zod'
import { defineAiTool } from './types'
import * as goalsService from '../../goals/goals.service'

const inputSchema = z.object({
  goalName: z.string().max(100).nullish().describe('Filtra por uma meta específica pelo nome; omita para ver todas'),
})

export const getGoalProjectionTool = defineAiTool({
  name: 'get_goal_projection',
  description:
    'Retorna o progresso das metas financeiras: valor guardado, valor alvo, prazo e quanto guardar por mês para '
    + 'atingir o objetivo. Use quando o usuário perguntar sobre metas, "quanto falta pra minha meta" ou projeção de economia.',
  inputSchema,
  handler: async (input, ctx) => {
    const goals = await goalsService.list(ctx.userId)
    const filtered = input.goalName
      ? goals.filter((g) => g.name.toLowerCase().includes(input.goalName!.toLowerCase()))
      : goals

    return filtered.map((g) => ({
      name: g.name,
      targetAmount: Number(g.targetAmount),
      currentAmount: Number(g.currentAmount),
      progressPct: g.progressPct,
      targetDate: g.targetDate.toISOString().slice(0, 10),
      monthsRemaining: g.monthsRemaining,
      suggestedMonthlyContribution: g.suggestedMonthlyContribution,
      status: g.status,
      isOverdue: g.isOverdue,
    }))
  },
})
