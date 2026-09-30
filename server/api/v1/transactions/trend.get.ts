import { z } from 'zod'
import * as transactionsService from '../../../modules/transactions/transactions.service'

const querySchema = z.object({ months: z.coerce.number().int().min(2).max(12).default(6) })

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const { months } = querySchema.parse(getQuery(event))
  return transactionsService.monthlyTrend(user.id, months)
})
