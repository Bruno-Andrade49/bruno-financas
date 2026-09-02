import * as usersService from '../../../../modules/users/users.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  return usersService.getWhatsappStatus(user.id)
})
