import * as insightsService from '../../../modules/insights/insights.service'

export default defineApiHandler(async (event) => {
  requireCronSecret(event)
  return insightsService.generateForAllUsers(currentMonthKey())
})
