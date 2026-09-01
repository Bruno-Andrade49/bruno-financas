import * as transactionsService from '../../../modules/transactions/transactions.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const id = getRouterParam(event, 'id')!
  return transactionsService.getById(user.id, id)
})
