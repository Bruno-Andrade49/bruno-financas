import type { z, ZodType } from 'zod'

/**
 * Contexto injetado pelo servidor em toda tool — nunca vem do modelo.
 * É isto que garante que a IA só enxerga dado do próprio usuário
 * (ARCHITECTURE.md, seção D).
 */
export interface AiToolContext {
  userId: string
}

/**
 * Forma "apagada" (type-erased) usada pra guardar tools heterogêneas num
 * único array/Map — ver defineAiTool abaixo pro lado com tipos fortes.
 */
export interface AiTool {
  name: string
  description: string
  inputSchema: ZodType
  /** Se true, exige um passo de confirmação prévio no fluxo de conversa — ver ai.service.ts. */
  hasSideEffects?: boolean
  handler: (input: unknown, ctx: AiToolContext) => Promise<unknown>
}

/**
 * Define uma tool com o input tipado a partir do próprio schema Zod — o
 * `handler` recebe `z.infer<TSchema>`, não `unknown`. O valor retornado é
 * apagado pra `AiTool` (genérico simples) só pra caber num array junto com
 * as outras tools; a segurança de tipo já foi conferida aqui na definição,
 * e em runtime o `ai.service.ts` sempre valida de novo com `inputSchema`
 * antes de chamar `handler`.
 */
export function defineAiTool<TSchema extends ZodType>(tool: {
  name: string
  description: string
  inputSchema: TSchema
  hasSideEffects?: boolean
  handler: (input: z.infer<TSchema>, ctx: AiToolContext) => Promise<unknown>
}): AiTool {
  return tool as AiTool
}
