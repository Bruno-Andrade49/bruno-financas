// Usado em /login e /register: se já existe sessão, manda direto pro dashboard.
export default defineNuxtRouteMiddleware(async () => {
  const { data: session } = await useFetch('/api/auth/get-session', {
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  })

  if (session.value) {
    return navigateTo('/dashboard')
  }
})
