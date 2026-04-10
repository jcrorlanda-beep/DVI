import { createContext, useContext, useReducer, useEffect } from 'react'
import type { ReactNode, Dispatch } from 'react'
import type { WorkshopSettings, Technician } from '../types'
import { save, KEYS, loadSettings, loadTechnicians } from '../persistence/storage'
import { defaultSettings, mockTechnicians } from '../data/mockData'

interface ShopState {
  settings: WorkshopSettings
  technicians: Technician[]
}

type ShopAction =
  | { type: 'UPDATE_SETTINGS'; payload: WorkshopSettings }
  | { type: 'UPSERT_TECHNICIAN'; payload: Technician }
  | { type: 'DELETE_TECHNICIAN'; payload: string }

function shopReducer(state: ShopState, action: ShopAction): ShopState {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      return { ...state, settings: action.payload }
    case 'UPSERT_TECHNICIAN': {
      const exists = state.technicians.some((t) => t.id === action.payload.id)
      return {
        ...state,
        technicians: exists
          ? state.technicians.map((t) =>
              t.id === action.payload.id ? action.payload : t
            )
          : [...state.technicians, action.payload],
      }
    }
    case 'DELETE_TECHNICIAN':
      return {
        ...state,
        technicians: state.technicians.filter((t) => t.id !== action.payload),
      }
    default:
      return state
  }
}

interface ShopContextValue extends ShopState {
  dispatch: Dispatch<ShopAction>
}

const ShopContext = createContext<ShopContextValue | null>(null)

export function ShopProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(shopReducer, undefined, (_: undefined) => ({
    settings: loadSettings(defaultSettings),
    technicians: loadTechnicians(mockTechnicians),
  }))

  useEffect(() => {
    save(KEYS.settings, state.settings)
    save(KEYS.technicians, state.technicians)
  }, [state])

  return (
    <ShopContext.Provider value={{ ...state, dispatch }}>
      {children}
    </ShopContext.Provider>
  )
}

export function useShop() {
  const ctx = useContext(ShopContext)
  if (!ctx) throw new Error('useShop must be used within ShopProvider')
  return ctx
}
