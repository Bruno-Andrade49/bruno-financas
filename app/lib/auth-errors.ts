export interface AuthErrorInfo {
  /** Campo onde o erro deve aparecer; sem campo, vai pro aviso do formulário. */
  field?: 'name' | 'email' | 'password'
  message: string
}

interface BetterAuthError {
  code?: string
  message?: string
  status?: number
}

const MESSAGES: Record<string, AuthErrorInfo> = {
  INVALID_EMAIL_OR_PASSWORD: { field: 'password', message: 'E-mail ou senha incorretos.' },
  INVALID_PASSWORD: { field: 'password', message: 'Senha incorreta.' },
  INVALID_EMAIL: { field: 'email', message: 'Digite um e-mail válido, como nome@email.com' },
  USER_NOT_FOUND: { field: 'email', message: 'Não encontramos uma conta com esse e-mail.' },
  USER_ALREADY_EXISTS: { field: 'email', message: 'Já existe uma conta com esse e-mail.' },
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: { field: 'email', message: 'Já existe uma conta com esse e-mail.' },
  PASSWORD_TOO_SHORT: { field: 'password', message: 'A senha precisa ter pelo menos 8 caracteres.' },
  PASSWORD_TOO_WEAK: { field: 'password', message: 'Senha fraca: use letras e números e evite senhas comuns.' },
  PASSWORD_TOO_LONG:{ field: 'password', message: 'A senha pode ter no máximo 128 caracteres.' },
  EMAIL_NOT_VERIFIED: { message: 'Confirme seu e-mail pelo link que enviamos antes de entrar.' },
  INVALID_TOKEN: { message: 'Esse link de redefinição é inválido. Peça um novo.' },
  TOKEN_EXPIRED: { message: 'Esse link expirou. Peça um novo pra redefinir a senha.' },
  INVALID_ORIGIN: { message: 'Não foi possível validar o acesso. Recarregue a página e tente de novo.' },
  MISSING_OR_NULL_ORIGIN: { message: 'Não foi possível validar o acesso. Recarregue a página e tente de novo.' },
  FAILED_TO_CREATE_USER: { message: 'Não conseguimos criar sua conta agora. Tente de novo em instantes.' },
  FAILED_TO_CREATE_SESSION: { message: 'Não conseguimos entrar agora. Tente de novo em instantes.' },
}

export function translateAuthError(error: BetterAuthError | null | undefined): AuthErrorInfo {
  if (error?.status === 429) {
    return { message: error.message?.startsWith('Muitas') ? error.message : 'Muitas tentativas seguidas. Espere um pouco e tente de novo.' }
  }
  if (error?.code && MESSAGES[error.code]) return MESSAGES[error.code]!
  if (!error?.status) return { message: 'Sem conexão com o servidor. Verifique sua internet.' }
  return { message: 'Algo deu errado. Tente de novo em instantes.' }
}
