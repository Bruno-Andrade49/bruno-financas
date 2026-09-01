// Cliente de autenticação para uso nos componentes Vue (login, registro,
// sessão reativa). O backend correspondente fica em server/lib/auth.ts.
import { createAuthClient } from 'better-auth/vue'

export const authClient = createAuthClient({
  baseURL: import.meta.env.SSR ? process.env.BETTER_AUTH_URL : undefined,
})

export const { useSession, signIn, signUp, signOut } = authClient
