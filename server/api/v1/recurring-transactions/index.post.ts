import { createRecurringTransactionSchema } from '#shared/schemas/recurring'
import * as recurringService from '../../../modules/recurring/recurring.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const input = createRecurringTransactionSchema.parse(await readBody(event))
  setResponseStatus(event, 201)
  return recurringService.create(user.id, input)
})
