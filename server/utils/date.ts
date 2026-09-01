/**
 * Converte "YYYY-MM" em limites de mês em UTC (usado por resumo mensal e
 * orçamentos) e no "primeiro dia do mês" usado como referenceMonth.
 */
export function parseMonthParam(month: string) {
  const match = /^(\d{4})-(\d{2})$/.exec(month)
  if (!match) throw new InvalidReferenceError('Mês inválido, use o formato YYYY-MM')
  const year = Number(match[1])
  const monthNumber = Number(match[2])

  return {
    referenceMonth: new Date(Date.UTC(year, monthNumber - 1, 1)),
    monthStart: new Date(Date.UTC(year, monthNumber - 1, 1)),
    monthEnd: new Date(Date.UTC(year, monthNumber, 0, 23, 59, 59)),
  }
}

/** "2026-09" -> "2026-08" (vira o ano quando o mês é janeiro). */
export function previousMonthKey(month: string): string {
  const { referenceMonth } = parseMonthParam(month)
  const previous = new Date(Date.UTC(referenceMonth.getUTCFullYear(), referenceMonth.getUTCMonth() - 1, 1))
  return monthKey(previous)
}

export function monthKey(date: Date): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export function currentMonthKey(): string {
  return monthKey(new Date())
}
