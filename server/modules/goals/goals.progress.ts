export function computeGoalProgress<T extends { targetAmount: unknown; currentAmount: unknown; targetDate: Date; status: string }>(
  goal: T,
  today: Date = new Date(),
) {
  const targetAmount = Number(goal.targetAmount)
  const currentAmount = Number(goal.currentAmount)
  const remainingAmount = Math.max(0, targetAmount - currentAmount)
  const progressPct = targetAmount > 0 ? Math.min(100, Math.round((currentAmount / targetAmount) * 100)) : 0

  const monthsRemaining = Math.max(
    0,
    (goal.targetDate.getUTCFullYear() - today.getUTCFullYear()) * 12 +
      (goal.targetDate.getUTCMonth() - today.getUTCMonth()) +
      (goal.targetDate.getUTCDate() >= today.getUTCDate() ? 1 : 0),
  )

  const isOverdue = goal.status === 'active' && remainingAmount > 0 && goal.targetDate.getTime() < today.getTime()

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
