<template>
  <div class="flex flex-col gap-4">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">Assistente</h1>
      <p class="text-sm text-muted-foreground">Pergunte sobre seus gastos, orçamentos e metas.</p>
    </div>

    <div ref="scrollRef" class="space-y-4 py-2">
      <div v-if="messages.length === 0" class="space-y-3">
        <p class="text-sm text-muted-foreground">Experimente perguntar:</p>
        <div class="flex flex-wrap gap-2">
          <Button
            v-for="suggestion in suggestions"
            :key="suggestion"
            variant="outline"
            size="sm"
            class="h-auto whitespace-normal py-2 text-left"
            @click="send(suggestion)"
          >
            {{ suggestion }}
          </Button>
        </div>
      </div>

      <ChatBubble v-for="(message, index) in messages" :key="index" :message="message" />

      <div v-if="loading" class="flex justify-start">
        <div class="flex items-center gap-1.5 rounded-2xl rounded-bl-md bg-muted px-4 py-3">
          <span class="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
          <span class="size-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
          <span class="size-1.5 animate-bounce rounded-full bg-muted-foreground" />
        </div>
      </div>
    </div>

    <form class="chat-input-bar flex items-end gap-2 border-t bg-background pt-3" @submit.prevent="handleSubmit">
      <Input
        v-model="draft"
        placeholder="Ex.: gastei 35 no almoço"
        class="flex-1"
        :disabled="loading"
        autocomplete="off"
      />
      <Button type="submit" size="icon" :disabled="loading || !draft.trim()">
        <PhPaperPlaneTilt class="size-4" />
      </Button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { PhPaperPlaneTilt } from '@phosphor-icons/vue'
import { toast } from 'vue-sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ChatBubble from '@/components/assistant/ChatBubble.vue'
import type { ChatDisplayMessage } from '@/components/assistant/ChatBubble.vue'

definePageMeta({ layout: 'app', middleware: 'auth' })

const suggestions = [
  'Quanto gastei com alimentação este mês?',
  'Como estão meus orçamentos?',
  'Compare meus gastos deste mês com o mês passado',
  'Gastei 35 reais no almoço hoje',
]

const messages = ref<ChatDisplayMessage[]>([])
const draft = ref('')
const loading = ref(false)
const conversationId = ref<string | null>(null)
const scrollRef = ref<HTMLElement | null>(null)

// A lista de mensagens não tem scroll próprio (é a página inteira que rola,
// como qualquer outra tela do app) — então "descer" aqui é rolar a janela.
async function scrollToBottom() {
  await nextTick()
  window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' })
}

async function send(text: string) {
  const trimmed = text.trim()
  if (!trimmed || loading.value) return

  messages.value.push({ role: 'user', content: trimmed })
  draft.value = ''
  loading.value = true
  scrollToBottom()

  try {
    const response = await $fetch('/api/v1/ai/chat', {
      method: 'POST',
      body: { conversationId: conversationId.value, message: trimmed },
    })
    conversationId.value = response.conversationId
    messages.value.push({ role: 'assistant', content: response.reply, toolsUsed: response.toolsUsed })
  } catch (error) {
    const message = (error as { data?: { error?: { message?: string } } })?.data?.error?.message
    toast.error(message ?? 'Não foi possível falar com o assistente agora')
    messages.value.pop() // some sem resposta — devolve o texto pro campo pra não perder o que foi digitado
    draft.value = trimmed
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

function handleSubmit() {
  send(draft.value)
}
</script>
