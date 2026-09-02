<template>
  <div class="space-y-8">
    <div>
      <h1 class="text-2xl font-semibold tracking-tight">Configurações</h1>
      <p class="text-sm text-muted-foreground">Preferências da conta e integrações.</p>
    </div>

    <Card>
      <CardHeader class="pb-2">
        <div class="flex items-center justify-between gap-3">
          <CardTitle class="text-base font-medium">WhatsApp</CardTitle>
          <Badge v-if="status?.linked" variant="default">Vinculado</Badge>
          <Badge v-else variant="secondary">Não vinculado</Badge>
        </div>
        <CardDescription>
          Lance despesas mandando mensagem pro assistente direto pelo WhatsApp — o mesmo "cérebro" do
          chat aqui do app.
        </CardDescription>
      </CardHeader>

      <CardContent class="space-y-4">
        <AsyncState :pending="pending" :error="error">
          <template v-if="status?.linked">
            <p class="text-sm">
              Número vinculado: <span class="font-medium">{{ status.phoneNumberMasked }}</span>
            </p>
            <Button variant="outline" size="sm" :disabled="unlinking" @click="handleUnlink">
              {{ unlinking ? 'Desvinculando...' : 'Desvincular número' }}
            </Button>
          </template>

          <template v-else-if="generatedCode">
            <div class="space-y-2 rounded-lg border bg-muted/40 p-4">
              <p class="text-sm text-muted-foreground">
                No WhatsApp, mande uma mensagem pro número do assistente com o texto abaixo:
              </p>
              <p class="rounded-md bg-background px-3 py-2 font-mono text-lg font-semibold tracking-widest">
                VINCULAR {{ generatedCode }}
              </p>
              <p class="text-xs text-muted-foreground">Válido por 15 minutos.</p>
            </div>
            <Button variant="outline" size="sm" :disabled="generating" @click="handleGenerateCode">
              Gerar outro código
            </Button>
          </template>

          <template v-else>
            <p class="text-sm text-muted-foreground">
              Nenhum número vinculado ainda. Gere um código de uso único pra confirmar que o número é seu.
            </p>
            <Button size="sm" :disabled="generating" @click="handleGenerateCode">
              {{ generating ? 'Gerando...' : 'Gerar código de vínculo' }}
            </Button>
          </template>
        </AsyncState>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

definePageMeta({ layout: 'app', middleware: 'auth' })

interface WhatsappStatus {
  linked: boolean
  phoneNumberMasked: string | null
  pendingCode: string | null
  pendingCodeExpiresAt: string | null
}

const { data: status, pending, error, refresh } = await useFetch<WhatsappStatus>('/api/v1/users/whatsapp')

const generatedCode = ref<string | null>(null)
const generating = ref(false)
const unlinking = ref(false)

async function handleGenerateCode() {
  generating.value = true
  try {
    const response = await $fetch<{ code: string }>('/api/v1/users/whatsapp/link-code', { method: 'POST' })
    generatedCode.value = response.code
  } catch {
    toast.error('Não foi possível gerar o código agora')
  } finally {
    generating.value = false
  }
}

async function handleUnlink() {
  unlinking.value = true
  try {
    await $fetch('/api/v1/users/whatsapp', { method: 'DELETE' })
    generatedCode.value = null
    await refresh()
    toast.success('Número desvinculado')
  } catch {
    toast.error('Não foi possível desvincular agora')
  } finally {
    unlinking.value = false
  }
}
</script>
