import { createContext, useContext, useReducer, useEffect } from 'react'
import type { ReactNode, Dispatch } from 'react'
import type { Customer, Vehicle } from '../types'
import { save, KEYS, loadCustomers, loadVehicles } from '../persistence/storage'
import { mockCustomers, mockVehicles } from '../data/mockData'

interface CustomerState {
  customers: Customer[]
  vehicles: Vehicle[]
}

type CustomerAction =
  | { type: 'UPSERT_CUSTOMER'; payload: Customer }
  | { type: 'DELETE_CUSTOMER'; payload: string }
  | { type: 'UPSERT_VEHICLE'; payload: Vehicle }
  | { type: 'DELETE_VEHICLE'; payload: string }

function customerReducer(state: CustomerState, action: CustomerAction): CustomerState {
  switch (action.type) {
    case 'UPSERT_CUSTOMER': {
      const exists = state.customers.some((c) => c.id === action.payload.id)
      return {
        ...state,
        customers: exists
          ? state.customers.map((c) =>
              c.id === action.payload.id ? action.payload : c
            )
          : [action.payload, ...state.customers],
      }
    }
    case 'DELETE_CUSTOMER':
      return {
        ...state,
        customers: state.customers.filter((c) => c.id !== action.payload),
        vehicles: state.vehicles.filter((v) => v.customerId !== action.payload),
      }
    case 'UPSERT_VEHICLE': {
      const exists = state.vehicles.some((v) => v.id === action.payload.id)
      return {
        ...state,
        vehicles: exists
          ? state.vehicles.map((v) =>
              v.id === action.payload.id ? action.payload : v
            )
          : [action.payload, ...state.vehicles],
      }
    }
    case 'DELETE_VEHICLE':
      return {
        ...state,
        vehicles: state.vehicles.filter((v) => v.id !== action.payload),
      }
    default:
      return state
  }
}

interface CustomerContextValue extends CustomerState {
  dispatch: Dispatch<CustomerAction>
}

const CustomerContext = createContext<CustomerContextValue | null>(null)

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(customerReducer, undefined, (_: undefined) => ({
    customers: loadCustomers(mockCustomers),
    vehicles: loadVehicles(mockVehicles),
  }))

  useEffect(() => {
    save(KEYS.customers, state.customers)
    save(KEYS.vehicles, state.vehicles)
  }, [state])

  return (
    <CustomerContext.Provider value={{ ...state, dispatch }}>
      {children}
    </CustomerContext.Provider>
  )
}

export function useCustomers() {
  const ctx = useContext(CustomerContext)
  if (!ctx) throw new Error('useCustomers must be used within CustomerProvider')
  return ctx
}
