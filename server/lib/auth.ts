// Configuração do Better Auth (ARCHITECTURE.md, seção B — decisão em aberto,
// sinalizada para confirmação do autor do produto).
//
// Sessão sempre validada no servidor: nenhuma mutação financeira confia em
// claim vindo do client (ver server/middleware/session.ts).
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { getPrisma } from './prisma'
import { sendEmail } from './email'
import { resetPasswordEmail, verificationEmail } from './email-templates'
import { createDefaultAccount } from '../modules/financial-accounts/financial-accounts.service'
import { createDefaultPaymentMethod } from '../modules/payment-methods/payment-methods.service'

const prisma = await getPrisma()

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // não bloqueia login — só oferece a verificação
    sendResetPassword: async ({ user, url }) => {
      const { subject, html } = resetPasswordEmail(url)
      await sendEmail({ to: user.email, subject, html })
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const { subject, html } = verificationEmail(url)
      await sendEmail({ to: user.email, subject, html })
    },
    sendOnSignUp: true,
  },
  session: {
    expiresIn: 60 * 60 * 24 * 30, // 30 dias
    updateAge: 60 * 60 * 24, // renova a cada 1 dia de uso
  },
  advanced: {
    // Cookies httpOnly + secure + sameSite=lax (defaults do Better Auth) —
    // ver ARCHITECTURE.md seção H, mitigação de session hijacking/CSRF.
    useSecureCookies: process.env.NODE_ENV === 'production',
  },
  databaseHooks: {
    user: {
      create: {
        // Toda conta nova já sai com uma carteira e uma forma de pagamento
        // padrão — evita uma tela extra de onboarding antes do primeiro
        // lançamento (ver ARCHITECTURE.md, seção E, fluxo de cadastro).
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
