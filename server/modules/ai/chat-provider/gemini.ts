import { GoogleGenAI, Type } from '@google/genai'
import type { Content, FunctionDeclaration, Part, Schema } from '@google/genai'
import type { ChatMessage, ChatProvider, ChatResponse, ChatToolDefinition } from './types'

// Free tier via chave do Google AI Studio (aistudio.google.com) — sem cartão
// de crédito. Configurável porque o nome do modelo muda com o tempo; troque
// aqui se um mais novo estiver disponível na sua conta.
const MODEL = process.env.GEMINI_MODEL ?? 'gemini-flash-latest'

interface GeminiToolCallRaw {
  thoughtSignature?: string
}

let client: GoogleGenAI | null = null

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY não definida — configure no .env para usar o assistente de IA.')
  }
  client ??= new GoogleGenAI({ apiKey })
  return client
}

/**
 * O JSON Schema gerado por zod-to-json-schema usa `type: "object"` (lowercase,
 * padrão JSON Schema) — a API do Gemini exige o enum `Type.OBJECT` etc.
 * (maiúsculo, subconjunto do OpenAPI). Essa função converte recursivamente.
 */
function toGeminiSchema(schema: Record<string, unknown>): Schema {
  const typeMap: Record<string, Type> = {
    object: Type.OBJECT,
    string: Type.STRING,
    number: Type.NUMBER,
    integer: Type.INTEGER,
    boolean: Type.BOOLEAN,
    array: Type.ARRAY,
  }

  const result: Schema = {}
  if (typeof schema.type === 'string' && typeMap[schema.type]) result.type = typeMap[schema.type]
  if (typeof schema.description === 'string') result.description = schema.description
  if (Array.isArray(schema.required)) result.required = schema.required as string[]
  if (Array.isArray(schema.enum)) result.enum = schema.enum as string[]
  if (schema.properties && typeof schema.properties === 'object') {
    result.properties = Object.fromEntries(
      Object.entries(schema.properties as Record<string, Record<string, unknown>>).map(([key, value]) => [
        key,
        toGeminiSchema(value),
      ]),
    )
  }
  if (schema.items && typeof schema.items === 'object') {
    result.items = toGeminiSchema(schema.items as Record<string, unknown>)
  }
  return result
}

function toGeminiTools(tools: ChatToolDefinition[]): FunctionDeclaration[] {
  return tools.map((tool) => ({
    name: tool.name,
    description: tool.description,
    parameters: toGeminiSchema(tool.inputSchema),
  }))
}

/** Mesma lógica de agrupamento do adapter da Anthropic — respostas de tool
 * viram parts dentro de UM content de role "user", nunca mensagens soltas. */
function toGeminiContents(messages: ChatMessage[]): Content[] {
  const result: Content[] = []

  for (const message of messages) {
    if (message.role === 'user') {
      result.push({ role: 'user', parts: [{ text: message.content }] })
      continue
    }

    if (message.role === 'assistant') {
      const parts: Part[] = []
      if (message.content) parts.push({ text: message.content })
      for (const call of message.toolCalls ?? []) {
        // Gemini 3 exige o thought_signature original de volta no functionCall
        // (senão recusa a request com INVALID_ARGUMENT) — guardado em `raw`
        // quando a resposta chegou, ver `send()` abaixo.
        const raw = call.raw as GeminiToolCallRaw | undefined
        parts.push({
          functionCall: { id: call.id, name: call.name, args: call.input as Record<string, unknown> },
          thoughtSignature: raw?.thoughtSignature,
        })
      }
      result.push({ role: 'model', parts })
      continue
    }

    // message.role === 'tool'
    const part: Part = {
      functionResponse: {
        id: message.toolCallId,
        name: message.toolName,
        response: message.isError ? { error: message.content } : { output: message.content },
      },
    }
    const last = result.at(-1)
    if (last?.role === 'user' && last.parts?.every((p) => p.functionResponse)) {
      last.parts.push(part)
    } else {
      result.push({ role: 'user', parts: [part] })
    }
  }

  return result
}

export const geminiChatProvider: ChatProvider = {
  async send({ system, messages, tools }) {
    const response = await getClient().models.generateContent({
      model: MODEL,
      contents: toGeminiContents(messages),
      config: {
        systemInstruction: system,
        tools: [{ functionDeclarations: toGeminiTools(tools) }],
      },
    })

    // Não usar o getter `response.functionCalls` — ele descarta o
    // `thoughtSignature` que fica no Part junto do functionCall, e o
    // Gemini 3 recusa a próxima request sem isso ecoado de volta.
    const parts = response.candidates?.[0]?.content?.parts ?? []
    const toolCalls: ChatResponse['toolCalls'] = []
    parts.forEach((part, index) => {
      if (!part.functionCall) return
      toolCalls.push({
        id: part.functionCall.id ?? `${part.functionCall.name}_${index}`,
        name: part.functionCall.name ?? '',
        input: part.functionCall.args ?? {},
        raw: { thoughtSignature: part.thoughtSignature } satisfies GeminiToolCallRaw,
      })
    })

    return {
      text: response.text ?? null,
      toolCalls,
      stopReason: toolCalls.length > 0 ? 'tool_use' : 'end_turn',
      usage: {
        inputTokens: response.usageMetadata?.promptTokenCount ?? 0,
        outputTokens: response.usageMetadata?.candidatesTokenCount ?? 0,
      },
    } satisfies ChatResponse
  },
}
