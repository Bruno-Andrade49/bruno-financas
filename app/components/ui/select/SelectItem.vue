<script setup lang="ts">
import type { SelectItemProps } from 'reka-ui'

import type { HTMLAttributes } from 'vue'
import { PhCheck } from '@phosphor-icons/vue'
import { reactiveOmit } from '@vueuse/core'
import {
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  useForwardProps,
} from 'reka-ui'
import { cn } from '@/lib/utils'

const props = defineProps<SelectItemProps & { class?: HTMLAttributes['class'] }>()

const delegatedProps = reactiveOmit(props, 'class')

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectItem
    data-slot="select-item"
    v-bind="forwardedProps"
    :class="
      cn(
        'relative flex w-full cursor-pointer items-center rounded-lg py-2.5 pr-9 pl-3 text-sm outline-none select-none',
        'data-highlighted:bg-muted data-[state=checked]:font-semibold',
        'data-disabled:pointer-events-none data-disabled:opacity-50',
        props.class,
      )
    "
  >
    <SelectItemText>
      <slot />
    </SelectItemText>

    <span class="pointer-events-none absolute right-3 flex size-4 items-center justify-center text-primary">
      <SelectItemIndicator>
        <PhCheck weight="bold" class="size-4" />
      </SelectItemIndicator>
    </span>
  </SelectItem>
</template>
