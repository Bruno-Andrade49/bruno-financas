type Phase = 'idle' | 'opening' | 'closing'

// tempo mínimo com o portal aberto, pra animação ser vista mesmo se a página carregar rápido
const MIN_OPEN_MS = 1600
const CLOSE_MS = 650
// se a página nunca avisar que está pronta (erro de rede), fecha mesmo assim
const MAX_WAIT_MS = 20000

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export function useFinancePortal() {
  const phase = useState<Phase>('portal-phase', () => 'idle')
  const origin = useState('portal-origin', () => ({ x: 0, y: 0 }))
  const title = useState('portal-title', () => '')
  const readyPath = useState('portal-ready-path', () => '')
  const router = useRouter()

  /**
   * Chamado pela página de destino no onMounted. Nesse ponto os dados já
   * chegaram e ela está na tela. (O router.push termina antes disso, e o
   * "page:finish" do Nuxt não dispara quando o layout muda.)
   */
  function markReady(path: string) {
    readyPath.value = path
  }

  function navigateAndWait(path: string) {
    readyPath.value = ''
    return new Promise<void>((resolve) => {
      let done = false
      const finish = () => {
        if (done) return
        done = true
        stop()
        clearTimeout(timeout)
        resolve()
      }
      const stop = watch(readyPath, (value) => {
        if (value === path) finish()
      })
      const timeout = setTimeout(finish, MAX_WAIT_MS)
      router.push(path).then((failure) => {
        // navegação cancelada ou redirecionada: a página nunca vai avisar
        if (failure || router.currentRoute.value.path !== path) finish()
      }, finish)
    })
  }

  /** Abre o portal a partir do elemento clicado, vai pra `path` e só fecha com a página pronta. */
  async function enter(from: HTMLElement | null | undefined, path: string, text = 'Entrando no seu mundo financeiro') {
    const rect = from?.getBoundingClientRect()
    origin.value = rect
      ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
      : { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    title.value = text
    phase.value = 'opening'

    try {
      await Promise.all([navigateAndWait(path), wait(MIN_OPEN_MS)])
    } finally {
      phase.value = 'closing'
      await wait(CLOSE_MS)
      phase.value = 'idle'
    }
  }

  return { phase, origin, title, enter, markReady }
}
