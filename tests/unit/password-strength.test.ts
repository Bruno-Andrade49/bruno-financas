import { describe, expect, it } from 'vitest'
import { passwordStrength } from '#shared/password-strength'

describe('passwordStrength', () => {
  it('vazia é muito fraca e inválida', () => {
    expect(passwordStrength('')).toMatchObject({ score: 0, valid: false })
  })

  it('curta não é válida', () => {
    expect(passwordStrength('ab12').valid).toBe(false)
  })

  it('só letras não é válida, mesmo longa', () => {
    expect(passwordStrength('abcdefghij').valid).toBe(false)
  })

  it('8 caracteres com letras e números é válida (razoável)', () => {
    expect(passwordStrength('casa2024')).toMatchObject({ valid: true, label: 'Razoável' })
  })

  it('maiúsculas, números e símbolo é forte', () => {
    expect(passwordStrength('Casa@2024')).toMatchObject({ valid: true, score: 4, label: 'Forte' })
  })

  it('12+ caracteres ganha um ponto extra', () => {
    expect(passwordStrength('minhacasa2024').score).toBe(3)
  })

  it('senha óbvia é recusada mesmo cumprindo as regras', () => {
    expect(passwordStrength('senha123')).toMatchObject({ valid: false, common: true, score: 1 })
    expect(passwordStrength('12345678').valid).toBe(false)
  })
})
