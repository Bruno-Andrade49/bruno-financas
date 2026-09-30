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
