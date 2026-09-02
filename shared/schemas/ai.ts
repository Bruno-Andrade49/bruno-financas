import { z } from 'zod'

export const sendChatMessageSchema = z.object({
  conversationId: z.string().uuid().nullish(),
  message: z.string().trim().min(1, 'Escreva uma mensagem').max(2000),
})

export type SendChatMessageInput = z.infer<typeof sendChatMessageSchema>
