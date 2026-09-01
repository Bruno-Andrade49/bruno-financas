// Regra de negócio de metas financeiras. Progresso e projeção de aporte
// mensal são sempre derivados (goals.progress.ts) — nunca persistidos.
import * as repo from './goals.repository'
import { computeGoalProgress } from './goals.progress'
import type { CreateGoalInput, UpdateGoalInput } from '#shared/schemas/goal'

export async function list(userId: string) {
  const goals = await repo.findManyForUser(userId)
  return goals.map((goal) => computeGoalProgress(goal))
}

export async function getById(userId: string, id: string) {
  const goal = await repo.findByIdForUser(userId, id)
  if (!goal) throw new NotFoundError('Meta não encontrada')
  return computeGoalProgress(goal)
}

export async function create(userId: string, input: CreateGoalInput) {
  const goal = await repo.create(userId, { ...input, targetDate: new Date(input.targetDate) })
  return computeGoalProgress(goal)
}

export async function update(userId: string, id: string, input: UpdateGoalInput) {
  const data = { ...input, ...(input.targetDate ? { targetDate: new Date(input.targetDate) } : {}) }
  const updated = await repo.updateForUser(userId, id, data)
  if (!updated) throw new NotFoundError('Meta não encontrada')
  return computeGoalProgress(updated)
}

export async function remove(userId: string, id: string) {
  const deleted = await repo.deleteForUser(userId, id)
  if (!deleted) throw new NotFoundError('Meta não encontrada')
}

/** Aporte manual — soma ao valor já guardado; completa a meta automaticamente ao atingir o alvo. */
export async function contribute(userId: string, id: string, amount: number) {
  const updated = await repo.incrementContribution(userId, id, amount)
  if (!updated) throw new NotFoundError('Meta não encontrada')

  if (updated.status === 'active' && Number(updated.currentAmount) >= Number(updated.targetAmount)) {
    await repo.markCompleted(userId, id)
    updated.status = 'completed'
  }

  return computeGoalProgress(updated)
}
