// Recusa requisições que alteram dados vindas de outro site (CSRF).
// As rotas de conta já têm essa checagem no Better Auth.
export default defineEventHandler((event) => {
  if (!event.path.startsWith('/api/v1/')) return
  if (event.method === 'GET' || event.method === 'HEAD' || event.method === 'OPTIONS') return

  const fetchSite = getHeader(event, 'sec-fetch-site')
  const origin = getHeader(event, 'origin')
  const host = getRequestHost(event, { xForwardedHost: true })

  let crossSite = fetchSite === 'cross-site'
  if (origin) {
    try {
      crossSite ||= new URL(origin).host !== host
    } catch {
      crossSite = true
    }
  }

  if (crossSite) {
    setResponseStatus(event, 403)
    return { error: { code: 'forbidden', message: 'Requisição bloqueada por segurança.' } }
  }
})
