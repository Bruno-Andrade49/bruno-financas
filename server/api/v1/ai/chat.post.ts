import { sendChatMessageSchema } from '#shared/schemas/ai'
import * as aiService from '../../../modules/ai/ai.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const { conversationId, message } = sendChatMessageSchema.parse(await readBody(event))
  return aiService.sendMessage(user.id, conversationId ?? null, message)
})
