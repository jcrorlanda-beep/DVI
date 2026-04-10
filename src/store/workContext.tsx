import { createContext, useContext, useReducer, useEffect } from 'react'
import type { ReactNode, Dispatch } from 'react'
import type { WorkOrder, Estimate } from '../types'
import { save, KEYS, loadWorkOrders, loadEstimates } from '../persistence/storage'
import { mockWorkOrders, mockEstimates } from '../data/mockData'

interface WorkState {
  workOrders: WorkOrder[]
  estimates: Estimate[]
}

type WorkAction =
  | { type: 'UPSERT_WORK_ORDER'; payload: WorkOrder }
  | { type: 'DELETE_WORK_ORDER'; payload: string }
  | { type: 'UPSERT_ESTIMATE'; payload: Estimate }
  | { type: 'DELETE_ESTIMATE'; payload: string }

function workReducer(state: WorkState, action: WorkAction): WorkState {
  switch (action.type) {
    case 'UPSERT_WORK_ORDER': {
      const exists = state.workOrders.some((w) => w.id === action.payload.id)
      return {
        ...state,
        workOrders: exists
          ? state.workOrders.map((w) =>
              w.id === action.payload.id ? action.payload : w
            )
          : [action.payload, ...state.workOrders],
      }
    }
    case 'DELETE_WORK_ORDER':
      return {
        ...state,
        workOrders: state.workOrders.filter((w) => w.id !== action.payload),
      }
    case 'UPSERT_ESTIMATE': {
      const exists = state.estimates.some((e) => e.id === action.payload.id)
      return {
        ...state,
        estimates: exists
          ? state.estimates.map((e) =>
              e.id === action.payload.id ? action.payload : e
            )
          : [action.payload, ...state.estimates],
      }
    }
    case 'DELETE_ESTIMATE':
      return {
        ...state,
        estimates: state.estimates.filter((e) => e.id !== action.payload),
      }
    default:
      return state
  }
}

interface WorkContextValue extends WorkState {
  dispatch: Dispatch<WorkAction>
}

const WorkContext = createContext<WorkContextValue | null>(null)

export function WorkProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(workReducer, undefined, (_: undefined) => ({
    workOrders: loadWorkOrders(mockWorkOrders),
    estimates: loadEstimates(mockEstimates),
  }))

  useEffect(() => {
    save(KEYS.workOrders, state.workOrders)
    save(KEYS.estimates, state.estimates)
  }, [state])

  return (
    <WorkContext.Provider value={{ ...state, dispatch }}>
      {children}
    </WorkContext.Provider>
  )
}

export function useWork() {
  const ctx = useContext(WorkContext)
  if (!ctx) throw new Error('useWork must be used within WorkProvider')
  return ctx
}
