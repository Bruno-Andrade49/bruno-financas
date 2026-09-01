import { describe, expect, it } from 'vitest'
import { budgetAlertRule, categoryIncreaseRule, topExpenseRule } from '../../server/modules/insights/insights.rules'

describe('topExpenseRule', () => {
  it('aponta a categoria de maior gasto', () => {
    const result = topExpenseRule([
      { categoryId: 'a', categoryName: 'Alimentação', total: 300 },
      { categoryId: 'b', categoryName: 'Moradia', total: 900 },
      { categoryId: 'c', categoryName: 'Lazer', total: 150 },
    ])
    expect(result).toHaveLength(1)
    expect(result[0].payload.categoryId).toBe('b')
    expect(result[0].title).toContain('Moradia')
  })

  it('não gera insight sem nenhuma despesa', () => {
    expect(topExpenseRule([])).toHaveLength(0)
  })
})

describe('categoryIncreaseRule', () => {
  it('gera insight quando o aumento passa do threshold', () => {
    const current = [{ categoryId: 'a', categoryName: 'Alimentação', total: 625 }]
    const previous = new Map([['a', 500]]) // +25%
    const result = categoryIncreaseRule(current, previous, 20)
    expect(result).toHaveLength(1)
    expect(result[0].payload.changePct).toBe(25)
  })

  it('não gera insight quando o aumento fica abaixo do threshold', () => {
    const current = [{ categoryId: 'a', categoryName: 'Alimentação', total: 550 }]
    const previous = new Map([['a', 500]]) // +10%
    expect(categoryIncreaseRule(current, previous, 20)).toHaveLength(0)
  })

  it('ignora categoria sem gasto no mês anterior (sem base de comparação)', () => {
    const current = [{ categoryId: 'a', categoryName: 'Nova categoria', total: 200 }]
    expect(categoryIncreaseRule(current, new Map(), 20)).toHaveLength(0)
  })

  it('ignora quedas de gasto', () => {
    const current = [{ categoryId: 'a', categoryName: 'Alimentação', total: 300 }]
    const previous = new Map([['a', 500]])
    expect(categoryIncreaseRule(current, previous, 20)).toHaveLength(0)
  })
})

describe('budgetAlertRule', () => {
  const baseBudget = { id: '1', categoryId: 'a', category: { name: 'Alimentação' }, limitAmount: 1000 }

  it('ignora orçamentos "ok"', () => {
    const result = budgetAlertRule([{ ...baseBudget, spent: 300, progressPct: 30, status: 'ok' }])
    expect(result).toHaveLength(0)
  })

  it('gera alerta de "quase no limite" para status warning', () => {
    const result = budgetAlertRule([{ ...baseBudget, spent: 850, progressPct: 85, status: 'warning' }])
    expect(result).toHaveLength(1)
    expect(result[0].title).toContain('quase no limite')
  })

  it('gera alerta de "estourado" para status exceeded', () => {
    const result = budgetAlertRule([{ ...baseBudget, spent: 1200, progressPct: 120, status: 'exceeded' }])
    expect(result).toHaveLength(1)
    expect(result[0].title).toContain('estourado')
  })
})
