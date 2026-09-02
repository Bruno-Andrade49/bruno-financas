import { z } from 'zod'
import { defineAiTool } from './types'
import * as transactionsService from '../../transactions/transactions.service'

const inputSchema = z.object({
  type: z.enum(['income', 'expense']),
  amount: z.number().positive().max(1_000_000, 'Valor muito alto — confirme com o usuário antes de tentar de novo'),
  categoryName: z.string().min(1).max(50).describe('Nome de uma categoria existente do usuário, ex.: "Alimentação"'),
  description: z.string().min(1).max(200),
  date: z.string().date().describe('Formato YYYY-MM-DD; use a data de hoje se o usuário não especificar outra'),
})

export const createTransactionTool = defineAiTool({
  name: 'create_transaction',
  description:
    'Registra uma nova receita ou despesa. ATENÇÃO: só chame esta tool depois que o usuário CONFIRMAR '
    + 'explicitamente os dados numa mensagem separada (ex.: "sim", "confirma", "pode salvar", "isso mesmo"). '
    + 'Nunca chame na mesma resposta em que você interpretou o texto do usuário pela primeira vez — '
    + 'primeiro descreva a transação que você entendeu (valor, categoria, data) e pergunte se está correto.',
  hasSideEffects: true,
  inputSchema,
  handler: async (input, ctx) => {
    const transaction = await transactionsService.createFromAssistant(ctx.userId, input)
    return {
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount),
      category: transaction.categoryName,
      description: transaction.description,
      date: transaction.date.toISOString().slice(0, 10),
    }
  },
})
