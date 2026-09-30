export function useQuickAdd() {
  const isOpen = useState('quick-add-open', () => false)
  const version = useState('transactions-version', () => 0)

  return {
    isOpen,
    version,
    open: () => {
      isOpen.value = true
    },
    notifySaved: () => {
      version.value++
    },
  }
}
