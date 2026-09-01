import * as paymentMethodsService from '../../../modules/payment-methods/payment-methods.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  return paymentMethodsService.listForUser(user.id)
})
