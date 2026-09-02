import { z } from 'zod'
import { defineAiTool } from './types'
import * as transactionsService from '../../transactions/transactions.service'

// Range máximo de 400 dias — evita consulta cara/abusiva (ARCHITECTURE.md, seção D).
const inputSchema = z
  .object({
    category: z.string().min(1).max(50).describe('Nome da categoria, ex.: "Alimentação"'),
    startDate: z.string().date().describe('Data inicial, formato YYYY-MM-DD'),
    endDate: z.string().date().describe('Data final, formato YYYY-MM-DD'),
  })
  .refine((v) => new Date(v.endDate) >= new Date(v.startDate), { message: 'endDate deve ser >= startDate' })
  .refine((v) => (new Date(v.endDate).getTime() - new Date(v.startDate).getTime()) / 86_400_000 <= 400, {
    message: 'Período máximo de 400 dias',
  })

export const getExpensesByCategoryTool = defineAiTool({
  name: 'get_expenses_by_category',
  description:
    'Retorna o total gasto (soma de despesas) em uma categoria específica dentro de um período. '
    + 'Use quando o usuário perguntar quanto gastou com algo (ex.: "quanto gastei com alimentação em agosto?").',
  inputSchema,
  handler: async (input, ctx) => {
    return transactionsService.sumByCategory(ctx.userId, input)
  },
})
