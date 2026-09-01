import { contributeGoalSchema } from '#shared/schemas/goal'
import * as goalsService from '../../../../modules/goals/goals.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const id = getRouterParam(event, 'id')!
  const { amount } = contributeGoalSchema.parse(await readBody(event))
  return goalsService.contribute(user.id, id, amount)
})
