<template>
  <div class="relative">
    <Input
      v-bind="$attrs"
      v-model="model"
      :type="visible ? 'text' : 'password'"
      class="h-11 rounded-xl pr-11"
      autocapitalize="off"
      spellcheck="false"
    />
    <button
      type="button"
      class="absolute top-1/2 right-1.5 flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      :aria-label="visible ? 'Esconder senha' : 'Mostrar senha'"
      :aria-pressed="visible"
      @click="visible = !visible"
    >
      <PhEyeSlash v-if="visible" class="size-5" />
      <PhEye v-else class="size-5" />
    </button>
  </div>
</template>

<script setup lang="ts">
import { PhEye, PhEyeSlash } from '@phosphor-icons/vue'
import { Input } from '@/components/ui/input'

defineOptions({ inheritAttrs: false })

const model = defineModel<string>()
const visible = ref(false)
</script>
