// Handshake de verificação exigido pela Meta ao registrar a URL do webhook
// no App Dashboard (Configuração > Webhooks > Verificar e salvar).
// https://developers.facebook.com/docs/graph-api/webhooks/getting-started
import { verifyWebhookHandshake } from '../../lib/whatsapp'

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const mode = query['hub.mode'] as string | undefined
  const token = query['hub.verify_token'] as string | undefined
  const challenge = query['hub.challenge'] as string | undefined

  if (challenge && verifyWebhookHandshake(mode, token)) {
    setResponseStatus(event, 200)
    return challenge
  }

  setResponseStatus(event, 403)
  return 'Forbidden'
})
