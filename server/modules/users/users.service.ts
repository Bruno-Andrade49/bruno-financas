import * as repo from './users.repository'

const LINK_CODE_TTL_MINUTES = 15

function randomSixDigitCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

function maskPhone(phone: string): string {
  // +5511999999999 -> +55 11 9999-**34 (só os 2 últimos dígitos visíveis)
  return phone.length > 4 ? `${'*'.repeat(phone.length - 4)}${phone.slice(-4)}` : phone
}

export async function getWhatsappStatus(userId: string) {
  const fields = await repo.getWhatsappFields(userId)
  const hasActiveCode = !!fields?.whatsappLinkCode && !!fields.whatsappLinkCodeExpires && fields.whatsappLinkCodeExpires > new Date()
  return {
    linked: !!fields?.whatsappPhoneNumber,
    phoneNumberMasked: fields?.whatsappPhoneNumber ? maskPhone(fields.whatsappPhoneNumber) : null,
    pendingCode: hasActiveCode ? fields!.whatsappLinkCode : null,
    pendingCodeExpiresAt: hasActiveCode ? fields!.whatsappLinkCodeExpires : null,
  }
}

/** Gera um código de vínculo de uso único (6 dígitos, expira em 15min). */
export async function generateLinkCode(userId: string) {
  let code = randomSixDigitCode()
  // Colisão é improvável (1 em 900 mil) mas, como o código é a única prova de
  // posse da conta nesse fluxo, evitamos reaproveitar um código ativo de
  // outro usuário em vez de confiar só na sorte.
  for (let attempt = 0; attempt < 5 && (await repo.findActiveLinkCodeCollision(code)); attempt++) {
    code = randomSixDigitCode()
  }

  const expiresAt = new Date(Date.now() + LINK_CODE_TTL_MINUTES * 60 * 1000)
  await repo.setLinkCode(userId, code, expiresAt)
  return { code, expiresAt }
}

export async function unlinkWhatsapp(userId: string) {
  await repo.unlinkWhatsappPhone(userId)
}

/**
 * Tenta vincular um número de WhatsApp a partir de uma mensagem recebida no
 * webhook. Retorna null se a mensagem não for um comando de vínculo válido —
 * nesse caso o chamador deve tratar o texto como uma mensagem normal pro
 * assistente.
 */
export async function tryLinkFromMessage(
  phoneNumber: string,
  text: string,
): Promise<'linked' | 'invalid_code' | 'phone_already_linked' | null> {
  const match = text.trim().match(/^vincular\s+(\d{6})$/i)
  if (!match) return null

  // O grupo de captura é obrigatório no regex — se `match` existe, `match[1]` existe.
  const code = match[1] as string
  const user = await repo.findByValidLinkCode(code)
  if (!user) return 'invalid_code'

  try {
    await repo.linkWhatsappPhone(user.id, phoneNumber)
    return 'linked'
  } catch (error) {
    // Constraint única de whatsappPhoneNumber — esse número já está vinculado
    // a outra conta (Prisma P2002).
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002') {
      return 'phone_already_linked'
    }
    throw error
  }
}

export async function findUserByWhatsappPhone(phoneNumber: string) {
  return repo.findByWhatsappPhone(phoneNumber)
}
