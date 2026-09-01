import { updateGoalSchema } from '#shared/schemas/goal'
import * as goalsService from '../../../modules/goals/goals.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const id = getRouterParam(event, 'id')!
  const input = updateGoalSchema.parse(await readBody(event))
  return goalsService.update(user.id, id, input)
})
