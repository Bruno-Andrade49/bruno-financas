import { z } from 'zod'
import { defineAiTool } from './types'
import * as transactionsService from '../../transactions/transactions.service'

const inputSchema = z.object({
  periodALabel: z.string().max(30).describe('Rótulo curto pro período A, ex.: "este mês"'),
  periodAStart: z.string().date(),
  periodAEnd: z.string().date(),
  periodBLabel: z.string().max(30).describe('Rótulo curto pro período B, ex.: "mês passado"'),
  periodBStart: z.string().date(),
  periodBEnd: z.string().date(),
})

export const comparePeriodsTool = defineAiTool({
  name: 'compare_periods',
  description:
    'Compara receitas/despesas/economia entre dois períodos (ex.: este mês vs. mês passado, '
    + 'este trimestre vs. o anterior). Use quando o usuário pedir uma comparação explícita entre datas.',
  inputSchema,
  handler: async (input, ctx) => {
    const [periodA, periodB] = await Promise.all([
      transactionsService.totalsForPeriod(ctx.userId, input.periodAStart, input.periodAEnd),
      transactionsService.totalsForPeriod(ctx.userId, input.periodBStart, input.periodBEnd),
    ])
    return {
      periodA: { label: input.periodALabel, ...periodA },
      periodB: { label: input.periodBLabel, ...periodB },
      expenseChangePct:
        periodB.totalExpense > 0
          ? Math.round(((periodA.totalExpense - periodB.totalExpense) / periodB.totalExpense) * 100)
          : null,
    }
  },
})
