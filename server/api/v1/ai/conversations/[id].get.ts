import * as aiService from '../../../../modules/ai/ai.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const id = getRouterParam(event, 'id')!
  return aiService.getConversationMessages(user.id, id)
})
