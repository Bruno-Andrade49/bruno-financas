// Todas as rotas de autenticação (login, registro, logout, reset de senha,
// verificação de e-mail) são servidas pelo Better Auth a partir daqui.
// Ver server/lib/auth.ts para a configuração.
import { toWebRequest } from 'h3'
import { auth } from '../../lib/auth'

export default defineEventHandler((event) => {
  return auth.handler(toWebRequest(event))
})
