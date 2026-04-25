import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer, useEffect } from 'react';
import { save, KEYS, loadWorkOrders, loadEstimates } from '../persistence/storage';
import { mockWorkOrders, mockEstimates } from '../data/mockData';
function workReducer(state, action) {
    switch (action.type) {
        case 'UPSERT_WORK_ORDER': {
            const exists = state.workOrders.some((w) => w.id === action.payload.id);
            return {
                ...state,
                workOrders: exists
                    ? state.workOrders.map((w) => w.id === action.payload.id ? action.payload : w)
                    : [action.payload, ...state.workOrders],
            };
        }
        case 'DELETE_WORK_ORDER':
            return {
                ...state,
                workOrders: state.workOrders.filter((w) => w.id !== action.payload),
            };
        case 'UPSERT_ESTIMATE': {
            const exists = state.estimates.some((e) => e.id === action.payload.id);
            return {
                ...state,
                estimates: exists
                    ? state.estimates.map((e) => e.id === action.payload.id ? action.payload : e)
                    : [action.payload, ...state.estimates],
            };
        }
        case 'DELETE_ESTIMATE':
            return {
                ...state,
                estimates: state.estimates.filter((e) => e.id !== action.payload),
            };
        default:
            return state;
    }
}
const WorkContext = createContext(null);
export function WorkProvider({ children }) {
    const [state, dispatch] = useReducer(workReducer, undefined, (_) => ({
        workOrders: loadWorkOrders(mockWorkOrders),
        estimates: loadEstimates(mockEstimates),
    }));
    useEffect(() => {
        save(KEYS.workOrders, state.workOrders);
        save(KEYS.estimates, state.estimates);
    }, [state]);
    return (_jsx(WorkContext.Provider, { value: { ...state, dispatch }, children: children }));
}
export function useWork() {
    const ctx = useContext(WorkContext);
    if (!ctx)
        throw new Error('useWork must be used within WorkProvider');
    return ctx;
}
