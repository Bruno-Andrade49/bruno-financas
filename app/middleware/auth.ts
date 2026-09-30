export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await useFetch('/api/auth/get-session', {
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  })

  if (!session.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
