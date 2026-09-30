type Phase = 'idle' | 'opening' | 'closing'

// tempo mínimo com o portal aberto, pra animação ser vista mesmo se a página carregar rápido
const MIN_OPEN_MS = 1600
const CLOSE_MS = 650

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useFinancePortal() {
  const phase = useState<Phase>('portal-phase', () => 'idle')
  const origin = useState('portal-origin', () => ({ x: 0, y: 0 }))
  const title = useState('portal-title', () => '')

  /**
   * Abre o portal a partir do elemento clicado, roda `during` (ex.: ir pro
   * dashboard) e fecha quando os dois terminarem.
   */
  async function enter(from: HTMLElement | null | undefined, during: () => Promise<unknown>, text = 'Entrando no seu mundo financeiro') {
    const rect = from?.getBoundingClientRect()
    origin.value = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    title.value = text
    phase.value = 'opening'

    try {
      await Promise.all([during(), wait(MIN_OPEN_MS)])
    } finally {
      phase.value = 'closing'
      await wait(CLOSE_MS)
      phase.value = 'idle'
    }
  }

  return { phase, origin, title, enter }
}
