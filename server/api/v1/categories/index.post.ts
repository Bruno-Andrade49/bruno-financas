import { createCategorySchema } from '#shared/schemas/category'
import * as categoriesService from '../../../modules/categories/categories.service'

export default defineApiHandler(async (event) => {
  const user = requireUser(event)
  const input = createCategorySchema.parse(await readBody(event))
  setResponseStatus(event, 201)
  return categoriesService.createForUser(user.id, input)
})
