import { getPrisma } from '../../lib/prisma'

export async function setLinkCode(userId: string, code: string, expiresAt: Date) {
  const prisma = await getPrisma()
  await prisma.user.update({
    where: { id: userId },
    data: { whatsappLinkCode: code, whatsappLinkCodeExpires: expiresAt },
  })
}

export async function findActiveLinkCodeCollision(code: string) {
  const prisma = await getPrisma()
  return prisma.user.findFirst({
    where: { whatsappLinkCode: code, whatsappLinkCodeExpires: { gt: new Date() } },
    select: { id: true },
  })
}

export async function findByValidLinkCode(code: string) {
  const prisma = await getPrisma()
  return prisma.user.findFirst({
    where: { whatsappLinkCode: code, whatsappLinkCodeExpires: { gt: new Date() } },
  })
}

export async function linkWhatsappPhone(userId: string, phoneNumber: string) {
  const prisma = await getPrisma()
  await prisma.user.update({
    where: { id: userId },
    data: { whatsappPhoneNumber: phoneNumber, whatsappLinkCode: null, whatsappLinkCodeExpires: null },
  })
}

export async function unlinkWhatsappPhone(userId: string) {
  const prisma = await getPrisma()
  await prisma.user.update({
    where: { id: userId },
    data: { whatsappPhoneNumber: null, whatsappLinkCode: null, whatsappLinkCodeExpires: null },
  })
}

export async function findByWhatsappPhone(phoneNumber: string) {
  const prisma = await getPrisma()
  return prisma.user.findUnique({ where: { whatsappPhoneNumber: phoneNumber } })
}

export async function getWhatsappFields(userId: string) {
  const prisma = await getPrisma()
  return prisma.user.findUnique({
    where: { id: userId },
    select: { whatsappPhoneNumber: true, whatsappLinkCode: true, whatsappLinkCodeExpires: true },
  })
}
