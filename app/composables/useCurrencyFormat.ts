// Formatação monetária centralizada — nunca concatenar string com valor
// (ARCHITECTURE.md, seção G). Todo componente que exibe dinheiro usa isto.
export function useCurrencyFormat(currency = 'BRL') {
  const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency })

  function format(value: number | string) {
    return formatter.format(Number(value))
  }

  return { format }
}
