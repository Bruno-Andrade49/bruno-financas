// Interface própria — não expõe tipos do SDK da Anthropic pro resto do app,
// pra trocar de provedor (ARCHITECTURE.md, seção D/B) ser só escrever um
// novo adapter aqui, sem tocar em ai.service.ts nem nas tools.
export interface ChatToolDefinition {
  name: string
  description: string
  inputSchema: Record<string, unknown>
}

export interface ChatToolCall {
  id: string
  name: string
  input: unknown
  /**
   * Espaço pro adapter guardar o que precisar pra reconstruir a chamada
   * exatamente como o provedor espera de volta (ex.: o Gemini exige o
   * `thoughtSignature` do part original ecoado na próxima request). Só o
   * adapter que criou isso lê de volta — os outros ignoram.
   */
  raw?: unknown
}

export type ChatMessage =
  | { role: 'user'; content: string }
  | { role: 'assistant'; content: string | null; toolCalls?: ChatToolCall[] }
  // toolName é redundante pra Anthropic (só usa toolCallId), mas o Gemini
  // exige o nome da função em toda function response — melhor incluir
  // sempre aqui do que fazer o formato depender de qual adapter está ativo.
  | { role: 'tool'; toolCallId: string; toolName: string; content: string; isError?: boolean }

export interface ChatResponse {
  text: string | null
  toolCalls: ChatToolCall[]
  stopReason: 'end_turn' | 'tool_use' | 'max_tokens' | 'other'
  usage: { inputTokens: number; outputTokens: number }
}

export interface ChatProvider {
  send: (params: { system: string; messages: ChatMessage[]; tools: ChatToolDefinition[] }) => Promise<ChatResponse>
}
