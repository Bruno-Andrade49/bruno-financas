<script setup lang="ts">
import type { PrimitiveProps } from 'reka-ui'
import type { HTMLAttributes } from 'vue'
import type { ButtonVariants } from '.'
import { PhSpinnerGap } from '@phosphor-icons/vue'
import { Primitive } from 'reka-ui'
import { cn } from '@/lib/utils'
import { buttonVariants } from '.'

interface Props extends PrimitiveProps {
  variant?: ButtonVariants['variant']
  size?: ButtonVariants['size']
  class?: HTMLAttributes['class']
  disabled?: boolean
  /** Mostra o spinner no lugar do ícone e trava o botão. */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  as: 'button',
})
</script>

<template>
  <Primitive
    data-slot="button"
    :data-variant="variant"
    :data-size="size"
    :data-loading="loading || undefined"
    :aria-busy="loading || undefined"
    :disabled="as === 'button' && !asChild ? disabled || loading : undefined"
    :as="as"
    :as-child="asChild"
    :class="cn(buttonVariants({ variant, size }), 'data-loading:cursor-wait data-loading:disabled:opacity-85 data-loading:[&_svg:not(.btn-spinner)]:hidden', props.class)"
  >
    <PhSpinnerGap v-if="loading && !asChild" class="btn-spinner size-4 animate-spin" aria-hidden="true" />
    <slot />
  </Primitive>
</template>
