import * as recurringService from '../../../modules/recurring/recurring.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  return recurringService.list(user.id)
})
