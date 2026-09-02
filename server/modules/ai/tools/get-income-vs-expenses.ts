import { z } from 'zod'
import { defineAiTool } from './types'
import * as transactionsService from '../../transactions/transactions.service'

const inputSchema = z
  .object({
    startDate: z.string().date().describe('Data inicial, formato YYYY-MM-DD'),
    endDate: z.string().date().describe('Data final, formato YYYY-MM-DD'),
  })
  .refine((v) => new Date(v.endDate) >= new Date(v.startDate), { message: 'endDate deve ser >= startDate' })
  .refine((v) => (new Date(v.endDate).getTime() - new Date(v.startDate).getTime()) / 86_400_000 <= 400, {
    message: 'Período máximo de 400 dias',
  })

export const getIncomeVsExpensesTool = defineAiTool({
  name: 'get_income_vs_expenses',
  description:
    'Retorna receitas totais, despesas totais e economia (receitas - despesas) num período. '
    + 'Use pra perguntas gerais sobre saldo/economia num intervalo de datas.',
  inputSchema,
  handler: async (input, ctx) => {
    return transactionsService.totalsForPeriod(ctx.userId, input.startDate, input.endDate)
  },
})
