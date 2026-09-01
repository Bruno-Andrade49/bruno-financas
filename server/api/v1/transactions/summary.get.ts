import { transactionsSummaryQuerySchema } from '#shared/schemas/transaction'
import * as transactionsService from '../../../modules/transactions/transactions.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const { month } = transactionsSummaryQuerySchema.parse(getQuery(event))
  return transactionsService.monthlySummary(user.id, month)
})
