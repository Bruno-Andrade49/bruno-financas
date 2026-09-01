import { createTransactionSchema } from '#shared/schemas/transaction'
import * as transactionsService from '../../../modules/transactions/transactions.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const input = createTransactionSchema.parse(await readBody(event))
  setResponseStatus(event, 201)
  return transactionsService.create(user.id, input)
})
