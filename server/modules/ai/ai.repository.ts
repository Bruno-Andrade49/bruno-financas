import { getPrisma } from '../../lib/prisma'
import type { Prisma } from '../../../generated/prisma/client'

export async function listConversationsForUser(userId: string) {
  const prisma = await getPrisma()
  return prisma.aIConversation.findMany({
    where: { userId, archivedAt: null },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function findConversationForUser(userId: string, id: string) {
  const prisma = await getPrisma()
  return prisma.aIConversation.findFirst({ where: { id, userId } })
}

export async function findLatestConversationForChannel(userId: string, channel: 'web' | 'whatsapp') {
  const prisma = await getPrisma()
  return prisma.aIConversation.findFirst({
    where: { userId, channel, archivedAt: null },
    orderBy: { updatedAt: 'desc' },
  })
}

export async function createConversation(userId: string, title: string, channel: 'web' | 'whatsapp' = 'web') {
  const prisma = await getPrisma()
  return prisma.aIConversation.create({ data: { userId, title, channel } })
}

export async function touchConversation(id: string) {
  const prisma = await getPrisma()
  await prisma.aIConversation.update({ where: { id }, data: { updatedAt: new Date() } })
}

export async function listMessagesForConversation(conversationId: string, limit = 30) {
  const prisma = await getPrisma()
  const messages = await prisma.aIMessage.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
  return messages.reverse()
}

export async function createMessage(data: {
  conversationId: string
  role: 'user' | 'assistant' | 'tool'
  content: string
  toolCalls?: unknown
  tokensInput?: number
  tokensOutput?: number
}) {
  const prisma = await getPrisma()
  return prisma.aIMessage.create({
    data: {
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      toolCalls: data.toolCalls as Prisma.InputJsonValue | undefined,
      tokensInput: data.tokensInput,
      tokensOutput: data.tokensOutput,
    },
  })
}

export async function logToolCall(data: {
  userId: string
  conversationId: string
  messageId: string
  toolName: string
  parametersRaw: unknown
  parametersValidated: unknown | null
  resultSummary: unknown | null
  durationMs: number
  status: 'success' | 'validation_error' | 'denied'
}) {
  const prisma = await getPrisma()
  await prisma.aIToolCallLog.create({
    data: {
      userId: data.userId,
      conversationId: data.conversationId,
      messageId: data.messageId,
      toolName: data.toolName,
      parametersRaw: data.parametersRaw as Prisma.InputJsonValue,
      parametersValidated: data.parametersValidated as Prisma.InputJsonValue | undefined,
      resultSummary: data.resultSummary as Prisma.InputJsonValue | undefined,
      durationMs: data.durationMs,
      status: data.status,
    },
  })
}
