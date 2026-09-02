import { updateRecurringTransactionSchema } from '#shared/schemas/recurring'
import * as recurringService from '../../../modules/recurring/recurring.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const id = getRouterParam(event, 'id')!
  const input = updateRecurringTransactionSchema.parse(await readBody(event))
  return recurringService.update(user.id, id, input)
})
