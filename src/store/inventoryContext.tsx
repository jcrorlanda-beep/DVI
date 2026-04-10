import { createContext, useContext, useReducer, useEffect } from 'react'
import type { ReactNode, Dispatch } from 'react'
import type { InventoryPart } from '../types'
import { save, KEYS, loadInventory } from '../persistence/storage'
import { mockInventory } from '../data/mockData'

interface InventoryState {
  parts: InventoryPart[]
}

type InventoryAction =
  | { type: 'UPSERT_PART'; payload: InventoryPart }
  | { type: 'DELETE_PART'; payload: string }
  | { type: 'ADJUST_STOCK'; payload: { partId: string; delta: number } }

function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'UPSERT_PART': {
      const exists = state.parts.some((p) => p.id === action.payload.id)
      return {
        parts: exists
          ? state.parts.map((p) =>
              p.id === action.payload.id ? action.payload : p
            )
          : [action.payload, ...state.parts],
      }
    }
    case 'DELETE_PART':
      return { parts: state.parts.filter((p) => p.id !== action.payload) }
    case 'ADJUST_STOCK':
      return {
        parts: state.parts.map((p) =>
          p.id === action.payload.partId
            ? { ...p, quantity: Math.max(0, p.quantity + action.payload.delta) }
            : p
        ),
      }
    default:
      return state
  }
}

interface InventoryContextValue extends InventoryState {
  dispatch: Dispatch<InventoryAction>
}

const InventoryContext = createContext<InventoryContextValue | null>(null)

export function InventoryProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(inventoryReducer, undefined, (_: undefined) => ({
    parts: loadInventory(mockInventory),
  }))

  useEffect(() => {
    save(KEYS.inventory, state.parts)
  }, [state])

  return (
    <InventoryContext.Provider value={{ ...state, dispatch }}>
      {children}
    </InventoryContext.Provider>
  )
}

export function useInventory() {
  const ctx = useContext(InventoryContext)
  if (!ctx) throw new Error('useInventory must be used within InventoryProvider')
  return ctx
}
