import Anthropic from '@anthropic-ai/sdk'
import type { ChatMessage, ChatProvider, ChatResponse } from './types'

// claude-opus-5 é o padrão recomendado; configurável via env porque, pro
// perfil de uso daqui (Q&A estruturado sobre dado já resumido pelas tools,
// não raciocínio livre pesado), um modelo mais barato como Sonnet ou Haiku
// pode ser suficiente — ajuste em ANTHROPIC_MODEL se o custo for um fator
// mais importante que a qualidade máxima pro seu caso.
const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-opus-5'
const MAX_TOKENS = 4096

let client: Anthropic | null = null

function getClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY não definida — configure no .env para usar o assistente de IA.')
  }
  client ??= new Anthropic({ apiKey })
  return client
}

/**
 * Nosso ChatMessage[] é uma lista plana; a API da Anthropic exige que
 * resultados de tool fiquem agrupados num único content block do tipo
 * "user" (ARCHITECTURE.md, seção D — "todas as chamadas de tool numa mesma
 * resposta voltam numa única mensagem"). Essa função faz esse agrupamento.
 */
function toAnthropicMessages(messages: ChatMessage[]): Anthropic.MessageParam[] {
  const result: Anthropic.MessageParam[] = []

  for (const message of messages) {
    if (message.role === 'user') {
      result.push({ role: 'user', content: message.content })
      continue
    }

    if (message.role === 'assistant') {
      const blocks: Anthropic.ContentBlockParam[] = []
      if (message.content) blocks.push({ type: 'text', text: message.content })
      for (const call of message.toolCalls ?? []) {
        blocks.push({ type: 'tool_use', id: call.id, name: call.name, input: call.input as Record<string, unknown> })
      }
      result.push({ role: 'assistant', content: blocks })
      continue
    }

    // message.role === 'tool'
    const block: Anthropic.ToolResultBlockParam = {
      type: 'tool_result',
      tool_use_id: message.toolCallId,
      content: message.content,
      is_error: message.isError,
    }
    const last = result.at(-1)
    if (last?.role === 'user' && Array.isArray(last.content) && last.content.every((b) => b.type === 'tool_result')) {
      last.content.push(block)
    } else {
      result.push({ role: 'user', content: [block] })
    }
  }

  return result
}

function mapStopReason(stopReason: Anthropic.Message['stop_reason']): ChatResponse['stopReason'] {
  if (stopReason === 'tool_use') return 'tool_use'
  if (stopReason === 'max_tokens') return 'max_tokens'
  if (stopReason === 'end_turn') return 'end_turn'
  return 'other'
}

export const anthropicChatProvider: ChatProvider = {
  async send({ system, messages, tools }) {
    const response = await getClient().messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system,
      messages: toAnthropicMessages(messages),
      tools: tools.map((tool) => ({
        name: tool.name,
        description: tool.description,
        input_schema: tool.inputSchema as Anthropic.Tool.InputSchema,
      })),
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    const toolCalls = response.content
      .filter((block) => block.type === 'tool_use')
      .map((block) => ({ id: block.id, name: block.name, input: block.input }))

    return {
      text: textBlock?.type === 'text' ? textBlock.text : null,
      toolCalls,
      stopReason: mapStopReason(response.stop_reason),
      usage: { inputTokens: response.usage.input_tokens, outputTokens: response.usage.output_tokens },
    }
  },
}
