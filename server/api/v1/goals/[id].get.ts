import * as goalsService from '../../../modules/goals/goals.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const id = getRouterParam(event, 'id')!
  return goalsService.getById(user.id, id)
})
