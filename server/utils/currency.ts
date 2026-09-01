/**
 * Formatação monetária para texto gerado no servidor (ex.: descrição de
 * insight). Espelha app/composables/useCurrencyFormat.ts, que é o
 * equivalente do lado do cliente — mantidos separados porque um roda no
 * servidor (sem acesso a composables do Vue) e o outro no cliente.
 */
export function formatCurrencyBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}
