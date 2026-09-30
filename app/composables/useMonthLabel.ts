export function useMonthLabel(date: Date = new Date()) {
  const raw = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}
