export default defineNuxtRouteMiddleware(async () => {
  const { data: session } = await useFetch('/api/auth/get-session', {
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  })

  return navigateTo(session.value ? '/dashboard' : '/login')
})
