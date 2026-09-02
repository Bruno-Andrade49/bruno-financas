import type { ChatProvider } from './types'
import { geminiChatProvider } from './gemini'
import { anthropicChatProvider } from './anthropic'

// AI_PROVIDER=gemini (padrão, gratuito via Google AI Studio) | anthropic
// (pago, Claude — melhor qualidade se/quando isso importar mais que custo).
// Trocar é isso aqui, mais a chave correspondente no .env — nada mais no
// app muda, porque tudo fala com a interface ChatProvider, não com o SDK
// de um provedor específico (ARCHITECTURE.md, seção B/D).
const providers: Record<string, ChatProvider> = {
  gemini: geminiChatProvider,
  anthropic: anthropicChatProvider,
}

const selected = process.env.AI_PROVIDER ?? 'gemini'

export const chatProvider: ChatProvider = providers[selected] ?? geminiChatProvider
