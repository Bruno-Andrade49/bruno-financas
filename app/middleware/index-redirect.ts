// Usado só pela página "/": manda pro dashboard (autenticado) ou pro login.
export default defineNuxtRouteMiddleware(async () => {
  const { data: session } = await useFetch('/api/auth/get-session', {
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  })

  return navigateTo(session.value ? '/dashboard' : '/login')
})
