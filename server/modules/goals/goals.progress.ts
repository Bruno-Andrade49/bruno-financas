// Função pura, sem dependência de banco — cálculo de progresso e projeção de
// meta (ARCHITECTURE.md, seção C/E: "quanto economizar por mês para atingir
// o objetivo" é sempre derivado, nunca persistido).
export function computeGoalProgress<T extends { targetAmount: unknown; currentAmount: unknown; targetDate: Date; status: string }>(
  goal: T,
  today: Date = new Date(),
) {
  const targetAmount = Number(goal.targetAmount)
  const currentAmount = Number(goal.currentAmount)
  const remainingAmount = Math.max(0, targetAmount - currentAmount)
  const progressPct = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0

  // Meses restantes até a data-alvo, arredondado para cima (mês corrente conta).
  const monthsRemaining = Math.max(
    0,
    (goal.targetDate.getUTCFullYear() - today.getUTCFullYear()) * 12 +
      (goal.targetDate.getUTCMonth() - today.getUTCMonth()) +
      (goal.targetDate.getUTCDate() >= today.getUTCDate() ? 1 : 0),
  )

  const isOverdue = goal.status === 'active' && remainingAmount > 0 && goal.targetDate.getTime() < today.getTime()

  // Sem meses restantes e ainda falta dinheiro: não dá pra "diluir" a
  // diferença — o valor sugerido é o que falta, de uma vez.
  const suggestedMonthlyContribution = monthsRemaining > 0 ? remainingAmount / monthsRemaining : remainingAmount

  return {
    ...goal,
    progressPct,
    remainingAmount,
    monthsRemaining,
    suggestedMonthlyContribution: Math.round(suggestedMonthlyContribution * 100) / 100,
    isOverdue,
  }
}
