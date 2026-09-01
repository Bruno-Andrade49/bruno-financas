import { listBudgetsQuerySchema } from '#shared/schemas/budget'
import * as budgetsService from '../../../modules/budgets/budgets.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const { month } = listBudgetsQuerySchema.parse(getQuery(event))
  return budgetsService.list(user.id, month)
})
