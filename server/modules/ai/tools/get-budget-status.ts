import { z } from 'zod'
import { defineAiTool } from './types'
import * as budgetsService from '../../budgets/budgets.service'

const inputSchema = z.object({
  category: z.string().max(50).nullish().describe('Filtra por uma categoria específica; omita para ver todos os orçamentos do mês'),
})

export const getBudgetStatusTool = defineAiTool({
  name: 'get_budget_status',
  description:
    'Retorna o status dos orçamentos do mês atual (limite, quanto já foi gasto, percentual, se está ok/perto do '
    + 'limite/estourado). Use quando o usuário perguntar sobre orçamento, limite de gasto ou "posso gastar X?".',
  inputSchema,
  handler: async (input, ctx) => {
    const budgets = await budgetsService.list(ctx.userId, currentMonthKey())
    const filtered = input.category
      ? budgets.filter((b) => b.category.name.toLowerCase().includes(input.category!.toLowerCase()))
      : budgets

    return filtered.map((b) => ({
      category: b.category.name,
      limitAmount: Number(b.limitAmount),
      spent: b.spent,
      progressPct: b.progressPct,
      status: b.status,
    }))
  },
})
