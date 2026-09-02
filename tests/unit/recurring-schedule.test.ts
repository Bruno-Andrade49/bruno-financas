import { describe, expect, it } from 'vitest'
import { isRecurrenceDue } from '../../server/modules/recurring/recurring.schedule'

const d = (s: string) => new Date(`${s}T00:00:00.000Z`)

describe('isRecurrenceDue — weekly', () => {
  const schedule = { frequency: 'weekly' as const, startDate: d('2026-09-01'), endDate: null, dayOfMonth: null }

  it('vence no próprio dia de início', () => {
    expect(isRecurrenceDue(schedule, d('2026-09-01'))).toBe(true)
  })

  it('vence 7 dias depois', () => {
    expect(isRecurrenceDue(schedule, d('2026-09-08'))).toBe(true)
  })

  it('não vence num dia fora do ciclo de 7 dias', () => {
    expect(isRecurrenceDue(schedule, d('2026-09-05'))).toBe(false)
  })

  it('não vence antes da data de início', () => {
    expect(isRecurrenceDue(schedule, d('2026-08-25'))).toBe(false)
  })
})

describe('isRecurrenceDue — monthly', () => {
  it('vence no dayOfMonth configurado', () => {
    const schedule = { frequency: 'monthly' as const, startDate: d('2026-01-05'), endDate: null, dayOfMonth: 15 }
    expect(isRecurrenceDue(schedule, d('2026-09-15'))).toBe(true)
    expect(isRecurrenceDue(schedule, d('2026-09-14'))).toBe(false)
  })

  it('sem dayOfMonth, usa o dia de startDate', () => {
    const schedule = { frequency: 'monthly' as const, startDate: d('2026-01-20'), endDate: null, dayOfMonth: null }
    expect(isRecurrenceDue(schedule, d('2026-09-20'))).toBe(true)
  })

  it('faz clamp pro último dia em meses mais curtos (31 -> 28/29 em fevereiro)', () => {
    const schedule = { frequency: 'monthly' as const, startDate: d('2026-01-31'), endDate: null, dayOfMonth: 31 }
    expect(isRecurrenceDue(schedule, d('2026-02-28'))).toBe(true) // 2026 não é bissexto
    expect(isRecurrenceDue(schedule, d('2026-04-30'))).toBe(true)
  })

  it('respeita endDate', () => {
    const schedule = { frequency: 'monthly' as const, startDate: d('2026-01-05'), endDate: d('2026-06-05'), dayOfMonth: 5 }
    expect(isRecurrenceDue(schedule, d('2026-06-05'))).toBe(true)
    expect(isRecurrenceDue(schedule, d('2026-07-05'))).toBe(false)
  })
})

describe('isRecurrenceDue — yearly', () => {
  it('vence no mesmo mês/dia de startDate, todo ano', () => {
    const schedule = { frequency: 'yearly' as const, startDate: d('2024-12-25'), endDate: null, dayOfMonth: null }
    expect(isRecurrenceDue(schedule, d('2026-12-25'))).toBe(true)
    expect(isRecurrenceDue(schedule, d('2026-12-24'))).toBe(false)
    expect(isRecurrenceDue(schedule, d('2026-11-25'))).toBe(false)
  })
})
