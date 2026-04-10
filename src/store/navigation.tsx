import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import type { NavState, TopPage } from '../types'

const SUB_TO_TOP: Partial<Record<string, TopPage>> = {
  'customer-profile': 'customers',
  'workorder-detail': 'workorders',
  'workorder-form': 'workorders',
  'estimate-detail': 'estimates',
  'estimate-form': 'estimates',
  'invoice-detail': 'invoices',
}

interface NavigationContextValue {
  nav: NavState
  navigate: (to: NavState) => void
  back: () => void
  activeSection: TopPage
}

const NavigationContext = createContext<NavigationContextValue | null>(null)

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<NavState[]>([{ page: 'dashboard' }])
  const nav = history[history.length - 1]
  const activeSection = (SUB_TO_TOP[nav.page] ?? nav.page) as TopPage

  const navigate = (to: NavState) => setHistory((h) => [...h, to])
  const back = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h))

  return (
    <NavigationContext.Provider value={{ nav, navigate, back, activeSection }}>
      {children}
    </NavigationContext.Provider>
  )
}

export function useNavigation() {
  const ctx = useContext(NavigationContext)
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider')
  return ctx
}
