import * as recurringService from '../../../modules/recurring/recurring.service'

export default defineApiHandler(async (event) => {
  requireCronSecret(event)
  const today = new Date()
  const todayUtc = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()))
  return recurringService.processDue(todayUtc)
})
