// Resolve a sessão (se houver) em toda request e expõe em event.context.
// Nenhuma rota deve ler userId de body/query — sempre daqui
// (ARCHITECTURE.md, seção H — mitigação de IDOR).
import { auth } from '../lib/auth'

export default defineEventHandler(async (event) => {
  const result = await auth.api.getSession({ headers: event.headers })
  event.context.session = result?.session ?? null
  event.context.user = result?.user ?? null
})
