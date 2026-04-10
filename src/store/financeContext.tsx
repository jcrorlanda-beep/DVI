import { createContext, useContext, useReducer, useEffect } from 'react'
import type { ReactNode, Dispatch } from 'react'
import type { Invoice } from '../types'
import { save, KEYS, loadInvoices } from '../persistence/storage'
import { mockInvoices } from '../data/mockData'

interface FinanceState {
  invoices: Invoice[]
}

type FinanceAction =
  | { type: 'UPSERT_INVOICE'; payload: Invoice }
  | { type: 'DELETE_INVOICE'; payload: string }

function financeReducer(state: FinanceState, action: FinanceAction): FinanceState {
  switch (action.type) {
    case 'UPSERT_INVOICE': {
      const exists = state.invoices.some((i) => i.id === action.payload.id)
      return {
        invoices: exists
          ? state.invoices.map((i) =>
              i.id === action.payload.id ? action.payload : i
            )
          : [action.payload, ...state.invoices],
      }
    }
    case 'DELETE_INVOICE':
      return { invoices: state.invoices.filter((i) => i.id !== action.payload) }
    default:
      return state
  }
}

interface FinanceContextValue extends FinanceState {
  dispatch: Dispatch<FinanceAction>
}

const FinanceContext = createContext<FinanceContextValue | null>(null)

export function FinanceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(financeReducer, undefined, (_: undefined) => ({
    invoices: loadInvoices(mockInvoices),
  }))

  useEffect(() => {
    save(KEYS.invoices, state.invoices)
  }, [state])

  return (
    <FinanceContext.Provider value={{ ...state, dispatch }}>
      {children}
    </FinanceContext.Provider>
  )
}

export function useFinance() {
  const ctx = useContext(FinanceContext)
  if (!ctx) throw new Error('useFinance must be used within FinanceProvider')
  return ctx
}
