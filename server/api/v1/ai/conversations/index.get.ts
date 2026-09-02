import * as aiService from '../../../../modules/ai/ai.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  return aiService.listConversations(user.id)
})
