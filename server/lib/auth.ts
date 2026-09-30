import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { getPrisma } from './prisma'
import { sendEmail } from './email'
import { resetPasswordEmail, verificationEmail } from './email-templates'
import { createDefaultAccount } from '../modules/financial-accounts/financial-accounts.service'
import { createDefaultPaymentMethod } from '../modules/payment-methods/payment-methods.service'

const prisma = await getPrisma()

const withHttps = (host?: string) => (host ? (host.startsWith('http') ? host : `https://${host}`) : undefined)

// A Vercel serve o site por vários endereços (produção, cada deploy e cada
// branch). Sem liberar todos, o login dá "Invalid origin".
const trustedOrigins = [
  process.env.BETTER_AUTH_URL,
  process.env.NUXT_PUBLIC_SITE_URL,
  withHttps(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  withHttps(process.env.VERCEL_BRANCH_URL),
  withHttps(process.env.VERCEL_URL),
].filter((origin): origin is string => !!origin).map((origin) => origin.replace(/\/$/, ''))

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? withHttps(process.env.VERCEL_PROJECT_PRODUCTION_URL) ?? 'http://localhost:3000',
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // não bloqueia o login, só envia o link
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({ to: user.email, ...resetPasswordEmail(url) })
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({ to: user.email, ...verificationEmail(url) })
    },
    sendOnSignUp: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 dias
    updateAge: 60 * 60 * 24, // renova a cada 1 dia de uso
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await Promise.all([
            createDefaultAccount(user.id),
            createDefaultPaymentMethod(user.id),
          ])
        },
      },
    },
  },
})
