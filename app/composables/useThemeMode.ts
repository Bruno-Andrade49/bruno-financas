export type ThemeMode = 'light' | 'dark' | 'system'

// mesma chave usada no script do nuxt.config.ts
const STORAGE_KEY = 'bf-theme'

function readStoredMode(): ThemeMode {
  try {
    const value = localStorage.getItem(STORAGE_KEY)
    return value === 'light' || value === 'dark' ? value : 'system'
  } catch {
    return 'system'
  }
}

function prefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export function useThemeMode() {
  const mode = useState<ThemeMode>('theme-mode', () => 'system')
  const isDark = useState<boolean>('theme-is-dark', () => false)

  function apply() {
    const dark = mode.value === 'dark' || (mode.value === 'system' && prefersDark())
    document.documentElement.classList.toggle('dark', dark)
    isDark.value = dark
  }

  function setMode(next: ThemeMode, origin?: { x: number; y: number }) {
    const commit = () => {
      mode.value = next
      try {
        if (next === 'system') localStorage.removeItem(STORAGE_KEY)
        else localStorage.setItem(STORAGE_KEY, next)
      } catch {
        // sem localStorage (aba anônima), o tema só não fica salvo
      }
      apply()
    }

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!origin || reducedMotion || !('startViewTransition' in document)) {
      commit()
      return
    }

    const radius = Math.hypot(
      Math.max(origin.x, window.innerWidth - origin.x),
      Math.max(origin.y, window.innerHeight - origin.y),
    )
    const transition = document.startViewTransition(commit)
    transition.ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${origin.x}px ${origin.y}px)`, `circle(${radius}px at ${origin.x}px ${origin.y}px)`] },
        { duration: 550, easing: 'cubic-bezier(0.16, 1, 0.3, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
  }

  function toggle(origin?: { x: number; y: number }) {
    setMode(isDark.value ? 'light' : 'dark', origin)
  }

  function init() {
    mode.value = readStoredMode()
    apply()
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (mode.value === 'system') apply()
    })
  }

  return { mode, isDark, setMode, toggle, init }
}
