// Recebe mensagens do WhatsApp (Meta Cloud API) e encaminha pro mesmo
// "cérebro" do assistente (ai.service) usado pelo chat web — ver
// server/modules/ai/ai.service.ts:sendChannelMessage e
// server/modules/users/users.service.ts (vínculo de número por código).
import { sendWhatsAppText, verifyWebhookSignature } from '../../lib/whatsapp'
import * as usersService from '../../modules/users/users.service'
import * as aiService from '../../modules/ai/ai.service'

interface WhatsAppWebhookPayload {
  entry?: Array<{
    changes?: Array<{
      value?: {
        messages?: Array<{
          id?: string
          from?: string
          type?: string
          text?: { body?: string }
        }>
      }
    }>
  }>
}

// Dedupe por wamid: a Meta reenvia o mesmo webhook se não receber 200 a
// tempo (ex.: nossa resposta ao usuário demorou por lentidão do provedor de
// IA) — sem isso, um reenvio processaria a mesma mensagem duas vezes e
// poderia duplicar um lançamento (mesma classe de bug documentada em
// ai.service.ts). Set em memória de processo é suficiente pro uso pessoal
// de uma instância só; se isso rodar em múltiplas instâncias um dia, troque
// por uma tabela.
const processedMessageIds = new Set<string>()
const MAX_TRACKED_IDS = 500

function markProcessed(id: string) {
  processedMessageIds.add(id)
  if (processedMessageIds.size > MAX_TRACKED_IDS) {
    const oldest = processedMessageIds.values().next().value
    if (oldest) processedMessageIds.delete(oldest)
  }
}

async function handleIncomingMessage(from: string, text: string) {
  const phoneNumber = `+${from}`

  const linkResult = await usersService.tryLinkFromMessage(phoneNumber, text)
  if (linkResult === 'linked') {
    await sendWhatsAppText(from, 'Número vinculado! Agora você pode me mandar seus lançamentos por aqui, ex.: "gastei 20 no mercado".')
    return
  }
  if (linkResult === 'invalid_code') {
    await sendWhatsAppText(from, 'Esse código não é válido ou expirou. Gere um novo em Configurações → WhatsApp, no app.')
    return
  }
  if (linkResult === 'phone_already_linked') {
    await sendWhatsAppText(from, 'Esse número já está vinculado a outra conta do Bruno Finanças.')
    return
  }

  const user = await usersService.findUserByWhatsappPhone(phoneNumber)
  if (!user) {
    await sendWhatsAppText(
      from,
      'Esse número ainda não está vinculado a nenhuma conta. Abra o app, vá em Configurações → WhatsApp, gere um código e me manda aqui: VINCULAR 123456',
    )
    return
  }

  const result = await aiService.sendChannelMessage(user.id, 'whatsapp', text)
  await sendWhatsAppText(from, result.reply)
}

export default defineEventHandler(async (event) => {
  const rawBody = (await readRawBody(event, 'utf8')) ?? ''
  const signature = getHeader(event, 'x-hub-signature-256')

  if (!verifyWebhookSignature(rawBody, signature)) {
    setResponseStatus(event, 401)
    return { error: 'assinatura inválida' }
  }

  let payload: WhatsAppWebhookPayload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    setResponseStatus(event, 200) // corpo ilegível não é algo pra Meta reenviar
    return { received: true }
  }

  const messages = (payload.entry ?? []).flatMap((entry) =>
    (entry.changes ?? []).flatMap((change) => change.value?.messages ?? []),
  )

  for (const message of messages) {
    if (!message.id || processedMessageIds.has(message.id)) continue
    markProcessed(message.id)

    if (message.type !== 'text' || !message.from || !message.text?.body) {
      if (message.from) await sendWhatsAppText(message.from, 'Por enquanto só entendo mensagens de texto.')
      continue
    }

    try {
      await handleIncomingMessage(message.from, message.text.body)
    } catch (error) {
      console.error('[whatsapp webhook] falha ao processar mensagem:', error)
      await sendWhatsAppText(message.from, 'Tive um problema aqui do meu lado — tenta de novo em instantes?').catch(() => {})
    }
  }

  return { received: true }
})
