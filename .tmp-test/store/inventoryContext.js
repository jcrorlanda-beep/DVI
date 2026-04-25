import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer, useEffect } from 'react';
import { save, KEYS, loadInventory } from '../persistence/storage';
import { mockInventory } from '../data/mockData';
function inventoryReducer(state, action) {
    switch (action.type) {
        case 'UPSERT_PART': {
            const exists = state.parts.some((p) => p.id === action.payload.id);
            return {
                parts: exists
                    ? state.parts.map((p) => p.id === action.payload.id ? action.payload : p)
                    : [action.payload, ...state.parts],
            };
        }
        case 'DELETE_PART':
            return { parts: state.parts.filter((p) => p.id !== action.payload) };
        case 'ADJUST_STOCK':
            return {
                parts: state.parts.map((p) => p.id === action.payload.partId
                    ? { ...p, quantity: Math.max(0, p.quantity + action.payload.delta) }
                    : p),
            };
        default:
            return state;
    }
}
const InventoryContext = createContext(null);
export function InventoryProvider({ children }) {
    const [state, dispatch] = useReducer(inventoryReducer, undefined, (_) => ({
        parts: loadInventory(mockInventory),
    }));
    useEffect(() => {
        save(KEYS.inventory, state.parts);
    }, [state]);
    return (_jsx(InventoryContext.Provider, { value: { ...state, dispatch }, children: children }));
}
export function useInventory() {
    const ctx = useContext(InventoryContext);
    if (!ctx)
        throw new Error('useInventory must be used within InventoryProvider');
    return ctx;
}
