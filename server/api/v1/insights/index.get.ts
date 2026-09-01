import * as insightsService from '../../../modules/insights/insights.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  return insightsService.list(user.id)
})
