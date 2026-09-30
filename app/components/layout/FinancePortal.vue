<template>
  <Teleport to="body">
    <div
      v-if="phase !== 'idle'"
      class="portal"
      :class="`is-${phase}`"
      :style="{ '--x': `${origin.x}px`, '--y': `${origin.y}px` }"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div class="portal-glow" aria-hidden="true" />

      <span
        v-for="coin in coins"
        :key="coin.id"
        class="coin"
        :style="{ left: `${coin.left}%`, animationDuration: `${coin.duration}s`, animationDelay: `${coin.delay}s`, fontSize: `${coin.size}px` }"
        aria-hidden="true"
      >{{ coin.symbol }}</span>

      <div class="portal-content">
        <div class="logo-wrap" aria-hidden="true">
          <span class="ring ring-1" />
          <span class="ring ring-2" />
          <span class="ring ring-3" />
          <span class="logo-tile">
            <img src="/logo.png" alt="" width="64" height="64">
          </span>
        </div>

        <div class="chart" aria-hidden="true">
          <span v-for="(h, i) in bars" :key="i" class="bar" :style="{ height: `${h}%`, animationDelay: `${0.35 + i * 0.09}s` }" />
          <svg class="trend" viewBox="0 0 120 60" preserveAspectRatio="none">
            <path d="M2 52 L24 40 L46 44 L68 26 L90 30 L118 6" />
          </svg>
        </div>

        <p class="portal-title">
          {{ title }}<span class="dots"><span>.</span><span>.</span><span>.</span></span>
        </p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
const { phase, origin, title } = useFinancePortal()

const bars = [34, 52, 44, 70, 62, 92]
const symbols = ['R$', '$', '%', 'R$', '↗', 'R$']

// posições fixas (sem Math.random) pra animação ficar sempre igual
const coins = Array.from({ length: 16 }, (_, i) => ({
  id: i,
  symbol: symbols[i % symbols.length],
  left: (i * 37 + 11) % 100,
  duration: 2.4 + ((i * 7) % 10) / 10,
  delay: ((i * 13) % 9) / 10,
  size: 14 + ((i * 5) % 12),
}))
</script>

<style scoped>
.portal {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  color: #fff;
  background:
    radial-gradient(70% 60% at 50% 40%, rgb(34 196 122 / 0.28), transparent 70%),
    linear-gradient(160deg, oklch(0.34 0.11 263), oklch(0.18 0.07 263));
}

.portal.is-opening {
  animation: portal-open 750ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
.portal.is-closing {
  animation: portal-close 650ms cubic-bezier(0.5, 0, 0.75, 0) both;
}

.portal-glow {
  position: absolute;
  inset: -20%;
  background: conic-gradient(from 0deg, transparent, rgb(34 196 122 / 0.12), transparent 30%);
  animation: spin 6s linear infinite;
}

.portal-content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 28px;
  animation: content-in 700ms 200ms cubic-bezier(0.16, 1, 0.3, 1) both;
}
.is-closing .portal-content {
  animation: content-out 650ms cubic-bezier(0.5, 0, 0.75, 0) both;
}

.logo-wrap {
  position: relative;
  display: grid;
  place-items: center;
  width: 96px;
  height: 96px;
}
.logo-tile {
  position: relative;
  display: grid;
  place-items: center;
  width: 84px;
  height: 84px;
  padding: 12px;
  border-radius: 28%;
  background: #fff;
  box-shadow: 0 0 0 0 rgb(34 196 122 / 0.6), 0 20px 40px rgb(0 0 0 / 0.3);
  animation: logo-pulse 1.6s 0.6s ease-out infinite;
}
.logo-tile img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}
.ring {
  position: absolute;
  inset: 0;
  border: 1.5px solid rgb(126 240 180 / 0.55);
  border-radius: 50%;
  animation: ripple 2.2s ease-out infinite;
}
.ring-2 { animation-delay: 0.7s; }
.ring-3 { animation-delay: 1.4s; }

.chart {
  position: relative;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  width: 168px;
  height: 64px;
}
.bar {
  flex: 1;
  border-radius: 5px 5px 2px 2px;
  background: linear-gradient(to top, rgb(34 196 122 / 0.55), #7ef0b4);
  transform-origin: bottom;
  animation: bar-grow 600ms cubic-bezier(0.34, 1.56, 0.64, 1) both;
}
.trend {
  position: absolute;
  inset: -6px 0 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}
.trend path {
  fill: none;
  stroke: #fff;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 180;
  stroke-dashoffset: 180;
  filter: drop-shadow(0 2px 6px rgb(0 0 0 / 0.3));
  animation: draw 700ms 0.6s ease-out forwards;
}

.portal-title {
  font-size: 1.125rem;
  font-weight: 600;
  letter-spacing: -0.01em;
  text-align: center;
}
.dots span {
  animation: blink 1.2s infinite;
}
.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }

.coin {
  position: absolute;
  bottom: -40px;
  font-weight: 700;
  color: rgb(126 240 180 / 0.55);
  animation-name: rise;
  animation-timing-function: ease-in;
  animation-iteration-count: infinite;
}

@keyframes portal-open {
  from { clip-path: circle(0 at var(--x) var(--y)); }
  to { clip-path: circle(150vmax at var(--x) var(--y)); }
}
@keyframes portal-close {
  from { opacity: 1; transform: scale(1); }
  to { opacity: 0; transform: scale(1.35); }
}
@keyframes content-in {
  from { opacity: 0; transform: scale(0.85) translateY(10px); }
}
@keyframes content-out {
  to { opacity: 0; transform: scale(1.6); }
}
@keyframes logo-pulse {
  0% { box-shadow: 0 0 0 0 rgb(34 196 122 / 0.55), 0 20px 40px rgb(0 0 0 / 0.3); }
  100% { box-shadow: 0 0 0 22px rgb(34 196 122 / 0), 0 20px 40px rgb(0 0 0 / 0.3); }
}
@keyframes ripple {
  from { transform: scale(0.9); opacity: 0.9; }
  to { transform: scale(2.6); opacity: 0; }
}
@keyframes bar-grow {
  from { transform: scaleY(0); }
}
@keyframes draw {
  to { stroke-dashoffset: 0; }
}
@keyframes blink {
  0%, 100% { opacity: 0.2; }
  40% { opacity: 1; }
}
@keyframes rise {
  0% { transform: translateY(0) rotate(0deg); opacity: 0; }
  15% { opacity: 1; }
  100% { transform: translateY(-115vh) rotate(25deg); opacity: 0; }
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

@media (prefers-reduced-motion: reduce) {
  .portal.is-opening { animation: fade-in 200ms both; }
  .portal.is-closing { animation: fade-out 200ms both; }
  .coin, .ring, .portal-glow { display: none; }
  @keyframes fade-in { from { opacity: 0; } }
  @keyframes fade-out { to { opacity: 0; } }
}
</style>
