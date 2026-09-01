/**
 * "setembro de 2026" -> "Setembro de 2026". Só a primeira letra — um
 * `capitalize` de CSS maiuscula todo mundo, inclusive o "de".
 */
export function useMonthLabel(date: Date = new Date()) {
  const raw = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  return raw.charAt(0).toUpperCase() + raw.slice(1)
}
