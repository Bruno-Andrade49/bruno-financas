export function useCountUp(target: Ref<number>, duration = 900) {
  const value = ref(target.value)
  let frame = 0

  function run(to: number) {
    cancelAnimationFrame(frame)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const from = value.value
    if (reduced || from === to) {
      value.value = to
      return
    }
    const start = performance.now()
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - (1 - t) ** 4
      value.value = from + (to - from) * eased
      if (t < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
  }

  watch(target, (to) => run(to))
  onMounted(() => {
    value.value = 0
    run(target.value)
  })
  onBeforeUnmount(() => cancelAnimationFrame(frame))

  return value
}
