import * as transactionsService from '../../../modules/transactions/transactions.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const id = getRouterParam(event, 'id')!
  await transactionsService.remove(user.id, id)
  setResponseStatus(event, 204)
  return null
})
