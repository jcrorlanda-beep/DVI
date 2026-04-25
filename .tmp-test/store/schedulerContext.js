import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer, useEffect } from 'react';
import { save, KEYS, loadAppointments } from '../persistence/storage';
import { mockAppointments } from '../data/mockData';
function schedulerReducer(state, action) {
    switch (action.type) {
        case 'UPSERT_APPOINTMENT': {
            const exists = state.appointments.some((a) => a.id === action.payload.id);
            return {
                appointments: exists
                    ? state.appointments.map((a) => a.id === action.payload.id ? action.payload : a)
                    : [action.payload, ...state.appointments],
            };
        }
        case 'DELETE_APPOINTMENT':
            return {
                appointments: state.appointments.filter((a) => a.id !== action.payload),
            };
        default:
            return state;
    }
}
const SchedulerContext = createContext(null);
export function SchedulerProvider({ children }) {
    const [state, dispatch] = useReducer(schedulerReducer, undefined, (_) => ({
        appointments: loadAppointments(mockAppointments),
    }));
    useEffect(() => {
        save(KEYS.appointments, state.appointments);
    }, [state]);
    return (_jsx(SchedulerContext.Provider, { value: { ...state, dispatch }, children: children }));
}
export function useScheduler() {
    const ctx = useContext(SchedulerContext);
    if (!ctx)
        throw new Error('useScheduler must be used within SchedulerProvider');
    return ctx;
}
