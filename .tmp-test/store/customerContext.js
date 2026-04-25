import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer, useEffect } from 'react';
import { save, KEYS, loadCustomers, loadVehicles } from '../persistence/storage';
import { mockCustomers, mockVehicles } from '../data/mockData';
function customerReducer(state, action) {
    switch (action.type) {
        case 'UPSERT_CUSTOMER': {
            const exists = state.customers.some((c) => c.id === action.payload.id);
            return {
                ...state,
                customers: exists
                    ? state.customers.map((c) => c.id === action.payload.id ? action.payload : c)
                    : [action.payload, ...state.customers],
            };
        }
        case 'DELETE_CUSTOMER':
            return {
                ...state,
                customers: state.customers.filter((c) => c.id !== action.payload),
                vehicles: state.vehicles.filter((v) => v.customerId !== action.payload),
            };
        case 'UPSERT_VEHICLE': {
            const exists = state.vehicles.some((v) => v.id === action.payload.id);
            return {
                ...state,
                vehicles: exists
                    ? state.vehicles.map((v) => v.id === action.payload.id ? action.payload : v)
                    : [action.payload, ...state.vehicles],
            };
        }
        case 'DELETE_VEHICLE':
            return {
                ...state,
                vehicles: state.vehicles.filter((v) => v.id !== action.payload),
            };
        default:
            return state;
    }
}
const CustomerContext = createContext(null);
export function CustomerProvider({ children }) {
    const [state, dispatch] = useReducer(customerReducer, undefined, (_) => ({
        customers: loadCustomers(mockCustomers),
        vehicles: loadVehicles(mockVehicles),
    }));
    useEffect(() => {
        save(KEYS.customers, state.customers);
        save(KEYS.vehicles, state.vehicles);
    }, [state]);
    return (_jsx(CustomerContext.Provider, { value: { ...state, dispatch }, children: children }));
}
export function useCustomers() {
    const ctx = useContext(CustomerContext);
    if (!ctx)
        throw new Error('useCustomers must be used within CustomerProvider');
    return ctx;
}
