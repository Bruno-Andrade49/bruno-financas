import * as categoriesService from '../../../modules/categories/categories.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  return categoriesService.listForUser(user.id)
})
