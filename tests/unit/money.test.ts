import { describe, expect, it } from 'vitest'
import { parseMoney } from '#shared/money'

describe('parseMoney', () => {
  it.each([
    ['400', 400],
    ['35,90', 35.9],
    ['1.234,56', 1234.56],
    ['1.000', 1000], // mil, não 1
    ['12.500', 12500],
    ['1.000.000', 1000000],
    ['1234.56', 1234.56], // formato americano
    ['5.293,33', 5293.33],
    ['R$ 3.799', 3799],
    ['  42,9 ', 42.9],
    ['', 0],
    ['abc', 0],
  ])('"%s" → %d', (input, expected) => {
    expect(parseMoney(input)).toBe(expected)
  })

  it('número passa direto', () => expect(parseMoney(12.5)).toBe(12.5))
  it('nulo vira 0', () => expect(parseMoney(null)).toBe(0))
})
