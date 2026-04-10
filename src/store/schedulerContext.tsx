import { createContext, useContext, useReducer, useEffect } from 'react'
import type { ReactNode, Dispatch } from 'react'
import type { Appointment } from '../types'
import { save, KEYS, loadAppointments } from '../persistence/storage'
import { mockAppointments } from '../data/mockData'

interface SchedulerState {
  appointments: Appointment[]
}

type SchedulerAction =
  | { type: 'UPSERT_APPOINTMENT'; payload: Appointment }
  | { type: 'DELETE_APPOINTMENT'; payload: string }

function schedulerReducer(state: SchedulerState, action: SchedulerAction): SchedulerState {
  switch (action.type) {
    case 'UPSERT_APPOINTMENT': {
      const exists = state.appointments.some((a) => a.id === action.payload.id)
      return {
        appointments: exists
          ? state.appointments.map((a) =>
              a.id === action.payload.id ? action.payload : a
            )
          : [action.payload, ...state.appointments],
      }
    }
    case 'DELETE_APPOINTMENT':
      return {
        appointments: state.appointments.filter((a) => a.id !== action.payload),
      }
    default:
      return state
  }
}

interface SchedulerContextValue extends SchedulerState {
  dispatch: Dispatch<SchedulerAction>
}

const SchedulerContext = createContext<SchedulerContextValue | null>(null)

export function SchedulerProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(schedulerReducer, undefined, (_: undefined) => ({
    appointments: loadAppointments(mockAppointments),
  }))

  useEffect(() => {
    save(KEYS.appointments, state.appointments)
  }, [state])

  return (
    <SchedulerContext.Provider value={{ ...state, dispatch }}>
      {children}
    </SchedulerContext.Provider>
  )
}

export function useScheduler() {
  const ctx = useContext(SchedulerContext)
  if (!ctx) throw new Error('useScheduler must be used within SchedulerProvider')
  return ctx
}
