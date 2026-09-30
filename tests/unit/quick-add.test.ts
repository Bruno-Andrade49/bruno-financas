import { describe, expect, it } from 'vitest'
import { parseQuickAdd } from '#shared/quick-add'

const today = new Date(2026, 8, 30)
const parse = (text: string, extra = {}) => parseQuickAdd(text, { today, ...extra })

describe('parseQuickAdd: valor', () => {
  it.each([
    ['35 almoço', 35],
    ['almoço 35,90', 35.9],
    ['R$ 1.234,56 aluguel', 1234.56],
    ['mercado 89.90', 89.9],
    ['1.200 salário', 1200],
    ['2k freela', 2000],
    ['3 mil de salário', 3000],
  ])('%s → %d', (text, amount) => {
    expect(parse(text).amount).toBe(amount)
  })

  it('sem número → amount null (UI pede o valor)', () => {
    expect(parse('almoço').amount).toBeNull()
  })

  it('não confunde data com valor', () => {
    const result = parse('uber 22,50 28/09')
    expect(result.amount).toBe(22.5)
    expect(result.date).toBe('2026-09-28')
  })
})

describe('parseQuickAdd: tipo e categoria', () => {
  it('despesa com categoria por palavra-chave (acento opcional)', () => {
    expect(parse('35 almoco')).toMatchObject({ type: 'expense', categoryName: 'Alimentação', description: 'Almoco' })
  })

  it('verbo de entrada vira receita', () => {
    expect(parse('recebi 1200 de salário')).toMatchObject({ type: 'income', categoryName: 'Salário', description: 'Salário' })
  })

  it('sinal + força receita', () => {
    expect(parse('+450 site do cliente')).toMatchObject({ type: 'income', categoryName: 'Freelance' })
  })

  it('categoria do próprio usuário tem prioridade sobre o dicionário', () => {
    const categories = [{ name: 'Pets', type: 'expense' as const }]
    expect(parse('80 ração pets', { categories })).toMatchObject({ categoryName: 'Pets' })
  })

  it('"Outros" do usuário nunca é sugerido só por aparecer no texto', () => {
    const categories = [{ name: 'Outros', type: 'expense' as const }]
    expect(parse('10 outros', { categories }).categoryName).toBeNull()
  })

  it('palavra sem categoria conhecida → categoria null', () => {
    expect(parse('50 xpto').categoryName).toBeNull()
  })

  it('tira palavras de enchimento da descrição', () => {
    expect(parse('gastei 42,90 no uber ontem').description).toBe('Uber')
  })

  it('só o primeiro número é o valor, "99" (app de corrida) vira descrição e categoria', () => {
    expect(parse('gastei 20 no 99')).toMatchObject({ amount: 20, description: '99', categoryName: 'Transporte' })
  })

  it('sem descrição nem categoria cai em "Receita"/"Despesa"', () => {
    expect(parse('recebi 3000 ontem').description).toBe('Receita')
  })
})

describe('parseQuickAdd: data', () => {
  it('padrão é hoje', () => expect(parse('35 almoço').date).toBe('2026-09-30'))
  it('ontem', () => expect(parse('35 almoço ontem').date).toBe('2026-09-29'))
  it('anteontem', () => expect(parse('35 almoço anteontem').date).toBe('2026-09-28'))
  it('dd/mm/aaaa', () => expect(parse('35 almoço 05/08/2026').date).toBe('2026-08-05'))
  it('data inválida é ignorada', () => expect(parse('35 almoço 31/02').date).toBe('2026-09-30'))
})
