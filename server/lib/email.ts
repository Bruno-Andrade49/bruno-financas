import nodemailer from 'nodemailer'
import type { Transporter } from 'nodemailer'
import { Resend } from 'resend'

interface EmailInput {
  to: string
  subject: string
  html: string
  text?: string
}

let smtp: Transporter | null = null
let resend: Resend | null = null

function fromAddress() {
  return process.env.EMAIL_FROM ?? process.env.RESEND_FROM_EMAIL ?? 'Bruno Finanças <onboarding@resend.dev>'
}

async function sendWithSmtp(input: EmailInput) {
  smtp ??= nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 465),
    secure: Number(process.env.SMTP_PORT ?? 465) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  await smtp.sendMail({ from: fromAddress(), ...input })
}

async function sendWithResend(input: EmailInput) {
  resend ??= new Resend(process.env.RESEND_API_KEY)
  const result = await resend.emails.send({ from: fromAddress(), ...input })
  if (result.error) throw new Error(result.error.message)
}

export async function sendEmail(input: EmailInput) {
  try {
    if (process.env.SMTP_HOST) return await sendWithSmtp(input)
    if (process.env.RESEND_API_KEY) return await sendWithResend(input)
    throw new Error('Nenhum envio de e-mail configurado (SMTP_HOST ou RESEND_API_KEY)')
  } catch (error) {
    console.error('[email] falha ao enviar:', error instanceof Error ? error.message : error)
    // em dev, mostra o link no terminal pra dar pra testar sem e-mail
    if (import.meta.dev) {
      const link = input.html.match(/href="([^"]+)"/)?.[1]
      console.info(`\n[email] (dev) para ${input.to}: ${input.subject}\n${link ?? ''}\n`)
      return
    }
    throw new Error('Não foi possível enviar o e-mail')
  }
}
