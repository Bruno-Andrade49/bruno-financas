import { listTransactionsQuerySchema } from '#shared/schemas/transaction'
import * as transactionsService from '../../../modules/transactions/transactions.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const query = listTransactionsQuerySchema.parse(getQuery(event))
  return transactionsService.list(user.id, query)
})
