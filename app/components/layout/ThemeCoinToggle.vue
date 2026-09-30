<template>
  <!-- só no cliente: o tema salvo fica no navegador -->
  <ClientOnly>
    <button
      type="button"
      class="coin-button press"
      :class="{ 'is-dark': isDark }"
      :aria-label="isDark ? 'Mudar para o tema claro' : 'Mudar para o tema escuro'"
      :aria-pressed="isDark"
      :title="isDark ? 'Tema claro' : 'Tema escuro'"
      @click="handleClick"
    >
      <span class="coin-toss" :class="{ 'is-tossing': tossing }" @animationend="tossing = false">
        <span class="coin">
          <span class="coin-face coin-face--gold" aria-hidden="true">
            <PhSun weight="fill" class="size-4" />
          </span>
          <span class="coin-face coin-face--silver" aria-hidden="true">
            <PhMoonStars weight="fill" class="size-4" />
          </span>
        </span>
      </span>
      <span class="coin-shadow" :class="{ 'is-tossing': tossing }" aria-hidden="true" />
    </button>
    <template #fallback>
      <span class="inline-block size-10" aria-hidden="true" />
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { PhMoonStars, PhSun } from '@phosphor-icons/vue'

const { isDark, toggle } = useThemeMode()
const tossing = ref(false)

async function handleClick(event: MouseEvent) {
  tossing.value = false
  await nextTick()
  tossing.value = true

  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  setTimeout(() => toggle({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }), 180)
}
</script>

<style scoped>
.coin-button {
  position: relative;
  display: inline-flex;
  width: 2.5rem;
  height: 2.5rem;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  perspective: 400px;
  transition: background-color 200ms;
}
.coin-button:hover {
  background-color: var(--muted);
}
.coin-button:focus-visible {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.coin-toss {
  display: block;
  transform-style: preserve-3d;
}
.coin-toss.is-tossing {
  animation: coin-toss 720ms cubic-bezier(0.3, 0.7, 0.4, 1) both;
}

.coin {
  position: relative;
  display: block;
  width: 1.75rem;
  height: 1.75rem;
  transform-style: preserve-3d;
  transition: transform 720ms var(--ease-spring);
}
.is-dark .coin {
  transform: rotateY(180deg);
}

.coin-face {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9999px;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}
.coin-face::before {
  content: '';
  position: absolute;
  inset: 2px;
  border-radius: inherit;
  border: 1px dashed currentColor;
  opacity: 0.35;
}
.coin-face::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: linear-gradient(135deg, oklch(1 0 0 / 0.55), transparent 45%);
}

.coin-face--gold {
  color: oklch(0.45 0.11 70);
  background: radial-gradient(circle at 35% 30%, #ffe9a3, #f2bf3a 55%, #c98d12);
  box-shadow:
    inset 0 0 0 1.5px #b67d0c,
    0 1px 2px oklch(0.4 0.1 70 / 0.35);
}
.coin-face--silver {
  color: oklch(0.3 0.09 263);
  background: radial-gradient(circle at 35% 30%, #f4f7fc, #b9c6dd 55%, #7f8fb0);
  box-shadow:
    inset 0 0 0 1.5px #6d7ea3,
    0 1px 2px oklch(0.15 0.05 263 / 0.5);
  transform: rotateY(180deg);
}

.coin-shadow {
  position: absolute;
  bottom: 0.35rem;
  left: 50%;
  width: 1.1rem;
  height: 0.2rem;
  margin-left: -0.55rem;
  border-radius: 9999px;
  background: oklch(0.2 0.04 263 / 0.18);
  filter: blur(1px);
  opacity: 0;
}
.coin-shadow.is-tossing {
  animation: coin-shadow 720ms ease-out both;
}

@keyframes coin-toss {
  0% { transform: translateY(0) scale(1); }
  35% { transform: translateY(-14px) scale(1.12); }
  70% { transform: translateY(1px) scale(0.98); }
  85% { transform: translateY(-2px) scale(1); }
  100% { transform: translateY(0) scale(1); }
}
@keyframes coin-shadow {
  0%, 100% { opacity: 0; transform: scaleX(1); }
  35% { opacity: 0.6; transform: scaleX(0.6); }
  70% { opacity: 1; transform: scaleX(1.1); }
}

@media (prefers-reduced-motion: reduce) {
  .coin { transition: none; }
}
</style>
