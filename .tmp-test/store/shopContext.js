import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useReducer, useEffect } from 'react';
import { save, KEYS, loadSettings, loadTechnicians } from '../persistence/storage';
import { defaultSettings, mockTechnicians } from '../data/mockData';
function shopReducer(state, action) {
    switch (action.type) {
        case 'UPDATE_SETTINGS':
            return { ...state, settings: action.payload };
        case 'UPSERT_TECHNICIAN': {
            const exists = state.technicians.some((t) => t.id === action.payload.id);
            return {
                ...state,
                technicians: exists
                    ? state.technicians.map((t) => t.id === action.payload.id ? action.payload : t)
                    : [...state.technicians, action.payload],
            };
        }
        case 'DELETE_TECHNICIAN':
            return {
                ...state,
                technicians: state.technicians.filter((t) => t.id !== action.payload),
            };
        default:
            return state;
    }
}
const ShopContext = createContext(null);
export function ShopProvider({ children }) {
    const [state, dispatch] = useReducer(shopReducer, undefined, (_) => ({
        settings: loadSettings(defaultSettings),
        technicians: loadTechnicians(mockTechnicians),
    }));
    useEffect(() => {
        save(KEYS.settings, state.settings);
        save(KEYS.technicians, state.technicians);
    }, [state]);
    return (_jsx(ShopContext.Provider, { value: { ...state, dispatch }, children: children }));
}
export function useShop() {
    const ctx = useContext(ShopContext);
    if (!ctx)
        throw new Error('useShop must be used within ShopProvider');
    return ctx;
}
