import * as goalsService from '../../../modules/goals/goals.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const id = getRouterParam(event, 'id')!
  await goalsService.remove(user.id, id)
  setResponseStatus(event, 204)
  return null
})
