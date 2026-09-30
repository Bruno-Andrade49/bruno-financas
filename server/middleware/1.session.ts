import { auth } from '../lib/auth'

export default defineEventHandler(async (event) => {
  const result = await auth.api.getSession({ headers: event.headers })
  event.context.session = result?.session ?? null
  event.context.user = result?.user ?? null
})
