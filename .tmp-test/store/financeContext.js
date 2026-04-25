import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer, useEffect } from 'react';
import { save, KEYS, loadInvoices } from '../persistence/storage';
import { mockInvoices } from '../data/mockData';
function financeReducer(state, action) {
    switch (action.type) {
        case 'UPSERT_INVOICE': {
            const exists = state.invoices.some((i) => i.id === action.payload.id);
            return {
                invoices: exists
                    ? state.invoices.map((i) => i.id === action.payload.id ? action.payload : i)
                    : [action.payload, ...state.invoices],
            };
        }
        case 'DELETE_INVOICE':
            return { invoices: state.invoices.filter((i) => i.id !== action.payload) };
        default:
            return state;
    }
}
const FinanceContext = createContext(null);
export function FinanceProvider({ children }) {
    const [state, dispatch] = useReducer(financeReducer, undefined, (_) => ({
        invoices: loadInvoices(mockInvoices),
    }));
    useEffect(() => {
        save(KEYS.invoices, state.invoices);
    }, [state]);
    return (_jsx(FinanceContext.Provider, { value: { ...state, dispatch }, children: children }));
}
export function useFinance() {
    const ctx = useContext(FinanceContext);
    if (!ctx)
        throw new Error('useFinance must be used within FinanceProvider');
    return ctx;
}
