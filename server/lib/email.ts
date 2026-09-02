// Envio de e-mail transacional via Resend — usado pelo Better Auth para
// recuperação de senha e verificação de e-mail (server/lib/auth.ts).
//
// Sem domínio verificado no Resend, `onboarding@resend.dev` só entrega pro
// próprio e-mail cadastrado na conta Resend — ótimo pra testar, mas pra
// mandar pra qualquer usuário real é preciso verificar um domínio em
// resend.com/domains e trocar RESEND_FROM_EMAIL no .env.
import { Resend } from 'resend'

let client: Resend | null = null

function getClient(): Resend {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('RESEND_API_KEY não definida — configure no .env para enviar e-mails.')
  }
  client ??= new Resend(apiKey)
  return client
}

export async function sendEmail(input: { to: string; subject: string; html: string }) {
  const from = process.env.RESEND_FROM_EMAIL ?? 'Bruno Finanças <onboarding@resend.dev>'

  const result = await getClient().emails.send({
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
  })

  if (result.error) {
    // Não deixamos vazar detalhe do provedor pro chamador de fluxo de auth
    // (ARCHITECTURE.md, seção H) — só logamos server-side.
    console.error('[email] falha ao enviar via Resend:', result.error)
    throw new Error('Não foi possível enviar o e-mail')
  }

  return result.data
}
