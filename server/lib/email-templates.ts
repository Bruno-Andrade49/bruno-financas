// Layout dos e-mails. Feito com tabelas e estilo inline porque Gmail e
// Outlook ignoram boa parte do CSS moderno.

const NAVY = '#1f3b73'
const GREEN = '#16a35f'
const TEXT = '#1c2434'
const MUTED = '#6b7385'
const BG = '#f3f5f9'

function siteUrl() {
  return (process.env.NUXT_PUBLIC_SITE_URL ?? process.env.BETTER_AUTH_URL ?? 'http://localhost:3000').replace(/\/$/, '')
}

interface EmailContent {
  preheader: string
  title: string
  paragraphs: string[]
  button: { label: string; url: string }
  note?: string
}

function layout(content: EmailContent): string {
  const site = siteUrl()
  const paragraphs = content.paragraphs
    .map((p) => `<p style="margin:0 0 16px;font-size:16px;line-height:1.6;color:${TEXT};">${p}</p>`)
    .join('')

  return `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${content.title}</title>
</head>
<body style="margin:0;padding:0;background:${BG};-webkit-text-size-adjust:100%;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:${BG};">${content.preheader}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};">
  <tr>
    <td align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

        <tr>
          <td style="padding:0 4px 20px;">
            <table role="presentation" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="vertical-align:middle;padding-right:10px;">
                  <img src="${site}/email-logo.png" width="40" height="40" alt="Bruno Finanças" style="display:block;border:0;">
                </td>
                <td style="vertical-align:middle;font-size:20px;font-weight:700;letter-spacing:-0.3px;color:${NAVY};">
                  Bruno<span style="color:${GREEN};font-weight:600;">Finanças</span>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td style="background:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #e3e7ef;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="height:6px;line-height:6px;font-size:0;background:${NAVY};background-image:linear-gradient(90deg,${NAVY},${GREEN});">&nbsp;</td>
              </tr>
              <tr>
                <td style="padding:32px 32px 8px;">
                  <h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;font-weight:700;color:${TEXT};">${content.title}</h1>
                  ${paragraphs}
                </td>
              </tr>
              <tr>
                <td style="padding:8px 32px 8px;">
                  <table role="presentation" cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" bgcolor="${NAVY}" style="border-radius:12px;">
                        <a href="${content.button.url}" target="_blank" style="display:inline-block;padding:14px 28px;font-size:16px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:12px;">${content.button.label}</a>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
              <tr>
                <td style="padding:24px 32px 32px;">
                  ${content.note ? `<p style="margin:0 0 16px;font-size:14px;line-height:1.5;color:${MUTED};">${content.note}</p>` : ''}
                  <p style="margin:0;font-size:13px;line-height:1.5;color:${MUTED};">
                    Se o botão não funcionar, copie e cole este endereço no navegador:<br>
                    <a href="${content.button.url}" style="color:${NAVY};word-break:break-all;">${content.button.url}</a>
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <tr>
          <td align="center" style="padding:24px 16px 0;font-size:12px;line-height:1.6;color:${MUTED};">
            Você recebeu este e-mail porque essa ação foi pedida na sua conta do Bruno Finanças.<br>
            Se não foi você, pode ignorar com segurança. Nada muda na sua conta.
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`
}

function plainText(content: EmailContent): string {
  return [
    'Bruno Finanças',
    '',
    content.title,
    '',
    ...content.paragraphs.map((p) => p.replace(/<[^>]+>/g, '')),
    '',
    `${content.button.label}: ${content.button.url}`,
    '',
    content.note ?? '',
    'Se não foi você, pode ignorar este e-mail.',
  ].join('\n')
}

function build(subject: string, content: EmailContent) {
  return { subject, html: layout(content), text: plainText(content) }
}

export function resetPasswordEmail(url: string) {
  return build('Redefina sua senha | Bruno Finanças', {
    preheader: 'Use o link para criar uma nova senha. Ele vale por 1 hora.',
    title: 'Redefinir sua senha',
    paragraphs: ['Recebemos um pedido para redefinir a senha da sua conta. Clique no botão abaixo para criar uma nova.'],
    button: { label: 'Criar nova senha', url },
    note: 'Por segurança, o link vale por 1 hora e só pode ser usado uma vez.',
  })
}

export function verificationEmail(url: string) {
  return build('Confirme seu e-mail | Bruno Finanças', {
    preheader: 'Falta só um passo para ativar sua conta.',
    title: 'Confirme seu e-mail',
    paragraphs: [
      'Que bom ter você por aqui.',
      'Confirme seu endereço de e-mail para concluir o cadastro e deixar sua conta mais segura.',
    ],
    button: { label: 'Confirmar e-mail', url },
  })
}
