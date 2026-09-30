function layout(title: string, bodyHtml: string): string {
  return `<!doctype html>
<html lang="pt-BR">
  <body style="margin:0;padding:32px 16px;background:#f4f5f7;font-family:-apple-system,Segoe UI,Roboto,sans-serif;">
    <table role="presentation" width="100%" style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:12px;overflow:hidden;">
      <tr>
        <td style="padding:24px 32px;background:#1d3a8a;color:#ffffff;font-size:16px;font-weight:600;">
          Bruno Finanças
        </td>
      </tr>
      <tr>
        <td style="padding:32px;color:#1a1a1a;font-size:15px;line-height:1.6;">
          <h1 style="font-size:18px;margin:0 0 12px;">${title}</h1>
          ${bodyHtml}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 32px;color:#8a8f98;font-size:12px;">
          Se você não pediu isso, pode ignorar este e-mail com segurança.
        </td>
      </tr>
    </table>
  </body>
</html>`
}

function button(url: string, label: string): string {
  return `<a href="${url}" style="display:inline-block;margin-top:16px;padding:12px 20px;background:#1d3a8a;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;">${label}</a>`
}

export function resetPasswordEmail(url: string) {
  return {
    subject: 'Redefina sua senha | Bruno Finanças',
    html: layout(
      'Redefinir senha',
      `<p>Recebemos um pedido para redefinir a senha da sua conta.</p>
       ${button(url, 'Redefinir senha')}
       <p style="margin-top:20px;font-size:13px;color:#8a8f98;">Este link expira em 1 hora.</p>`,
    ),
  }
}

export function verificationEmail(url: string) {
  return {
    subject: 'Confirme seu e-mail | Bruno Finanças',
    html: layout(
      'Confirme seu e-mail',
      `<p>Confirme seu endereço de e-mail para concluir seu cadastro.</p>
       ${button(url, 'Confirmar e-mail')}`,
    ),
  }
}
