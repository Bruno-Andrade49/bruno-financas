import { updateBudgetSchema } from '#shared/schemas/budget'
import * as budgetsService from '../../../modules/budgets/budgets.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const id = getRouterParam(event, 'id')!
  const input = updateBudgetSchema.parse(await readBody(event))
  return budgetsService.update(user.id, id, input)
})
