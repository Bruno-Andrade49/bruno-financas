// Cliente da WhatsApp Cloud API (Meta). Formato de payload/endpoints
// conferido direto na documentação oficial da Meta em 2026-09-02
// (developers.facebook.com/docs/whatsapp/cloud-api) — não é um SDK oficial,
// é REST puro (a Meta não publica um SDK oficial em Node para isso).
import { createHmac, timingSafeEqual } from 'node:crypto'

const API_VERSION = process.env.WHATSAPP_API_VERSION ?? 'v21.0'

function getConfig() {
  const accessToken = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!accessToken || !phoneNumberId) {
    throw new Error(
      'WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID não configurados — veja .env.example.',
    )
  }
  return { accessToken, phoneNumberId }
}

/** Envia uma mensagem de texto simples. `to` em E.164 sem o "+" (ex.: 5511999999999). */
export async function sendWhatsAppText(to: string, body: string): Promise<void> {
  const { accessToken, phoneNumberId } = getConfig()
  const digitsOnly = to.replace(/\D/g, '')

  const response = await fetch(`https://graph.facebook.com/${API_VERSION}/${phoneNumberId}/messages`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      recipient_type: 'individual',
      to: digitsOnly,
      type: 'text',
      text: { body },
    }),
  })

  if (!response.ok) {
    const errorBody = await response.text().catch(() => '')
    throw new Error(`Falha ao enviar mensagem WhatsApp (HTTP ${response.status}): ${errorBody}`)
  }
}

/**
 * Confirma a posse do App Secret pra rejeitar POSTs que não vieram da Meta —
 * HMAC-SHA256 do corpo cru (raw, antes do parse JSON) com o App Secret,
 * comparado ao header `X-Hub-Signature-256: sha256=<hex>`.
 * https://developers.facebook.com/docs/graph-api/webhooks/getting-started
 */
export function verifyWebhookSignature(rawBody: string, signatureHeader: string | undefined): boolean {
  const appSecret = process.env.WHATSAPP_APP_SECRET
  if (!appSecret || !signatureHeader) return false

  const expected = `sha256=${createHmac('sha256', appSecret).update(rawBody, 'utf8').digest('hex')}`

  const expectedBuffer = Buffer.from(expected)
  const providedBuffer = Buffer.from(signatureHeader)
  if (expectedBuffer.length !== providedBuffer.length) return false
  return timingSafeEqual(expectedBuffer, providedBuffer)
}

/** Handshake de verificação do webhook (GET) exigido pela Meta ao registrar a URL. */
export function verifyWebhookHandshake(mode: string | undefined, token: string | undefined): boolean {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN
  return mode === 'subscribe' && !!verifyToken && token === verifyToken
}
