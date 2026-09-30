export interface PasswordCheck {
  id: 'length' | 'letterNumber' | 'mixedCase' | 'symbol'
  label: string
  ok: boolean
  required: boolean
}

export interface PasswordStrength {
  /** 0 a 4 */
  score: number
  label: 'Muito fraca' | 'Fraca' | 'Razoável' | 'Boa' | 'Forte'
  checks: PasswordCheck[]
  /** Cumpre as regras mínimas pra ser aceita. */
  valid: boolean
  common: boolean
}

export const PASSWORD_MIN_LENGTH = 8

const COMMON = new Set([
  '12345678', '123456789', '1234567890', '87654321', '11111111', '00000000',
  'password', 'password1', 'password123', 'senha123', 'senha1234', 'senhasenha',
  'qwerty123', 'abc12345', 'abcd1234', 'mudar123', 'brasil123', 'admin123',
])

export function passwordStrength(password: string): PasswordStrength {
  const checks: PasswordCheck[] = [
    { id: 'length', label: `Pelo menos ${PASSWORD_MIN_LENGTH} caracteres`, ok: password.length >= PASSWORD_MIN_LENGTH, required: true },
    { id: 'letterNumber', label: 'Letras e números', ok: /[a-zA-Z]/.test(password) && /\d/.test(password), required: true },
    { id: 'mixedCase', label: 'Letras maiúsculas e minúsculas', ok: /[a-z]/.test(password) && /[A-Z]/.test(password), required: false },
    { id: 'symbol', label: 'Um símbolo (!@#$...)', ok: /[^a-zA-Z0-9]/.test(password), required: false },
  ]

  const common = COMMON.has(password.toLowerCase())
  let score = checks.filter((c) => c.ok).length
  if (password.length >= 12 && score < 4) score++
  if (common) score = Math.min(score, 1)
  if (!password) score = 0

  const labels = ['Muito fraca', 'Fraca', 'Razoável', 'Boa', 'Forte'] as const
  const valid = checks.every((c) => !c.required || c.ok) && !common

  return { score, label: labels[score]!, checks, valid, common }
}
