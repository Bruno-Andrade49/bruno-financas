import { updateTransactionSchema } from '#shared/schemas/transaction'
import * as transactionsService from '../../../modules/transactions/transactions.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const id = getRouterParam(event, 'id')!
  const input = updateTransactionSchema.parse(await readBody(event))
  return transactionsService.update(user.id, id, input)
})
