import * as budgetsService from '../../../modules/budgets/budgets.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const id = getRouterParam(event, 'id')!
  await budgetsService.remove(user.id, id)
  setResponseStatus(event, 204)
  return null
})
