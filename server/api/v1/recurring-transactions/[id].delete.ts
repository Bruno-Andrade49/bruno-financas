import * as recurringService from '../../../modules/recurring/recurring.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const id = getRouterParam(event, 'id')!
  await recurringService.remove(user.id, id)
  setResponseStatus(event, 204)
  return null
})
