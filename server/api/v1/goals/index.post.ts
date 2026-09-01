import { createGoalSchema } from '#shared/schemas/goal'
import * as goalsService from '../../../modules/goals/goals.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const input = createGoalSchema.parse(await readBody(event))
  setResponseStatus(event, 201)
  return goalsService.create(user.id, input)
})
