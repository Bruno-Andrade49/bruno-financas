import * as financialAccountsService from '../../../modules/financial-accounts/financial-accounts.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  return financialAccountsService.listForUser(user.id)
})
