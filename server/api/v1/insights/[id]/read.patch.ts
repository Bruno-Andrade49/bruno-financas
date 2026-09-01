import * as insightsService from '../../../../modules/insights/insights.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const id = getRouterParam(event, 'id')!
  return insightsService.markRead(user.id, id)
})
