// Função pura, sem banco — decide se uma recorrência vence numa data.
// ARCHITECTURE.md, seção E, fluxo 10 ("Processamento de uma transação
// recorrente"). Datas sempre tratadas em UTC (mesmo padrão do resto do
// server — ver server/utils/date.ts), porque as colunas são @db.Date.
export type RecurrenceFrequency = 'weekly' | 'monthly' | 'yearly'

export interface RecurrenceSchedule {
  frequency: RecurrenceFrequency
  startDate: Date
  endDate: Date | null
  dayOfMonth: number | null
}

function toUtcDay(date: Date): number {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

/** Último dia válido de um mês (ex.: dayOfMonth=31 em fevereiro -> 28 ou 29). */
function clampToMonth(year: number, month: number, day: number): number {
  const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate()
  return Math.min(day, daysInMonth)
}

export function isRecurrenceDue(schedule: RecurrenceSchedule, today: Date): boolean {
  const todayUtc = toUtcDay(today)
  const startUtc = toUtcDay(schedule.startDate)

  if (todayUtc < startUtc) return false
  if (schedule.endDate && todayUtc > toUtcDay(schedule.endDate)) return false

  switch (schedule.frequency) {
    case 'weekly': {
      const diffDays = Math.round((todayUtc - startUtc) / 86_400_000)
      return diffDays % 7 === 0
    }
    case 'monthly': {
      const day = schedule.dayOfMonth ?? schedule.startDate.getUTCDate()
      const dueDay = clampToMonth(today.getUTCFullYear(), today.getUTCMonth(), day)
      return today.getUTCDate() === dueDay
    }
    case 'yearly': {
      const day = schedule.dayOfMonth ?? schedule.startDate.getUTCDate()
      const dueDay = clampToMonth(today.getUTCFullYear(), schedule.startDate.getUTCMonth(), day)
      return today.getUTCMonth() === schedule.startDate.getUTCMonth() && today.getUTCDate() === dueDay
    }
    default:
      return false
  }
}
