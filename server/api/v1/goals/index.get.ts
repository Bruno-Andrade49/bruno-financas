import * as goalsService from '../../../modules/goals/goals.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  return goalsService.list(user.id)
})
