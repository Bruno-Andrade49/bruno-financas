import * as usersService from '../../../../modules/users/users.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  await usersService.unlinkWhatsapp(user.id)
  return { success: true }
})
