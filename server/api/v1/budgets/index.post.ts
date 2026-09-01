import { createBudgetSchema } from '#shared/schemas/budget'
import * as budgetsService from '../../../modules/budgets/budgets.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const input = createBudgetSchema.parse(await readBody(event))
  setResponseStatus(event, 201)
  return budgetsService.create(user.id, input)
})
