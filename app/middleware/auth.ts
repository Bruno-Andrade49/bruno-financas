// Protege páginas que exigem sessão (ex.: /dashboard). Isto é só UX — a
// fronteira de segurança real é sempre a checagem no servidor
// (server/middleware/session.ts + requireUser() em cada rota).
export default defineNuxtRouteMiddleware(async (to) => {
  const { data: session } = await useFetch('/api/auth/get-session', {
    headers: import.meta.server ? useRequestHeaders(['cookie']) : undefined,
  })

  if (!session.value) {
    return navigateTo({ path: '/login', query: { redirect: to.fullPath } })
  }
})
