export function useCurrencyFormat(currency = 'BRL') {
  const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency })

  function format(value: number | string) {
    return formatter.format(Number(value))
  }

  return { format }
}
