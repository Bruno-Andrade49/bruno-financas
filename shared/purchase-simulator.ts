// Projeção mês a mês das compras parceladas da tela "Vale a pena?".
export interface SimulatedPurchase {
  id: string
  name: string
  installmentAmount: number
  installments: number
  startOffset: number
  cashPrice?: number | null
}

export interface SimulationInput {
  monthlyIncome: number
  monthlyExpenses: number
  savingsTarget: number
  purchases: SimulatedPurchase[]
  firstMonth: string
  months?: number
}

export type MonthStatus = 'ok' | 'tight' | 'negative'

export interface SimulatedMonth {
  month: string
  income: number
  expenses: number
  installments: number
  items: { purchaseId: string; name: string; amount: number; number: number; of: number }[]
  leftover: number
  afterSavings: number
  status: MonthStatus
  commitment: number
}

export interface SimulationResult {
  months: SimulatedMonth[]
  verdict: 'worth' | 'not_worth'
  monthsBelowTarget: number
  monthsNegative: number
  worstMonth: SimulatedMonth | null
  maxCommitment: number
  totalInstallments: number
  financingCost: number
  maxAffordableInstallment: number
  monthsToBuyInCash: number | null
}

export const COMMITMENT_ALERT = 0.3

const round = (value: number) => Math.round(value * 100) / 100

export function addMonths(month: string, offset: number): string {
  const [y, m] = month.split('-').map(Number)
  const date = new Date(Date.UTC(y!, m! - 1 + offset, 1))
  return date.toISOString().slice(0, 7)
}

export function simulatePurchases(input: SimulationInput): SimulationResult {
  const purchases = input.purchases.filter((p) => p.installmentAmount > 0 && p.installments > 0)
  const lastInstallment = Math.max(0, ...purchases.map((p) => p.startOffset + p.installments))
  const horizon = input.months ?? Math.min(24, Math.max(6, lastInstallment + 2))

  const months: SimulatedMonth[] = []
  for (let i = 0; i < horizon; i++) {
    const items = purchases
      .filter((p) => i >= p.startOffset && i < p.startOffset + p.installments)
      .map((p) => ({
        purchaseId: p.id,
        name: p.name || 'Compra',
        amount: p.installmentAmount,
        number: i - p.startOffset + 1,
        of: p.installments,
      }))
    const installments = round(items.reduce((sum, item) => sum + item.amount, 0))
    const leftover = round(input.monthlyIncome - input.monthlyExpenses - installments)
    const afterSavings = round(leftover - input.savingsTarget)
    const status: MonthStatus = leftover < 0 ? 'negative' : afterSavings < 0 ? 'tight' : 'ok'

    months.push({
      month: addMonths(input.firstMonth, i),
      income: input.monthlyIncome,
      expenses: input.monthlyExpenses,
      installments,
      items,
      leftover,
      afterSavings,
      status,
      commitment: input.monthlyIncome > 0 ? installments / input.monthlyIncome : installments > 0 ? Infinity : 0,
    })
  }

  const belowTarget = months.filter((m) => m.status !== 'ok')
  const worstMonth = months.reduce<SimulatedMonth | null>(
    (worst, m) => (worst === null || m.afterSavings < worst.afterSavings ? m : worst),
    null,
  )

  const totalInstallments = round(purchases.reduce((sum, p) => sum + p.installmentAmount * p.installments, 0))
  const financingCost = round(
    purchases.reduce(
      (sum, p) => (p.cashPrice && p.cashPrice > 0 ? sum + Math.max(0, p.installmentAmount * p.installments - p.cashPrice) : sum),
      0,
    ),
  )

  const baseSlack = input.monthlyIncome - input.monthlyExpenses - input.savingsTarget
  const maxAffordableInstallment = round(Math.max(0, baseSlack))

  const cashTotal = purchases.reduce((sum, p) => sum + (p.cashPrice && p.cashPrice > 0 ? p.cashPrice : p.installmentAmount * p.installments), 0)
  const monthsToBuyInCash = baseSlack > 0 && cashTotal > 0 ? Math.ceil(cashTotal / baseSlack) : null

  return {
    months,
    verdict: belowTarget.length === 0 ? 'worth' : 'not_worth',
    monthsBelowTarget: belowTarget.length,
    monthsNegative: months.filter((m) => m.status === 'negative').length,
    worstMonth,
    maxCommitment: Math.max(0, ...months.map((m) => m.commitment)),
    totalInstallments,
    financingCost,
    maxAffordableInstallment,
    monthsToBuyInCash,
  }
}
