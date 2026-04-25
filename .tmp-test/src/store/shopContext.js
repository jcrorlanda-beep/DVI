"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShopProvider = ShopProvider;
exports.useShop = useShop;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const storage_1 = require("../persistence/storage");
const mockData_1 = require("../data/mockData");
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
const ShopContext = (0, react_1.createContext)(null);
function ShopProvider({ children }) {
    const [state, dispatch] = (0, react_1.useReducer)(shopReducer, undefined, (_) => ({
        settings: (0, storage_1.loadSettings)(mockData_1.defaultSettings),
        technicians: (0, storage_1.loadTechnicians)(mockData_1.mockTechnicians),
    }));
    (0, react_1.useEffect)(() => {
        (0, storage_1.save)(storage_1.KEYS.settings, state.settings);
        (0, storage_1.save)(storage_1.KEYS.technicians, state.technicians);
    }, [state]);
    return ((0, jsx_runtime_1.jsx)(ShopContext.Provider, { value: { ...state, dispatch }, children: children }));
}
function useShop() {
    const ctx = (0, react_1.useContext)(ShopContext);
    if (!ctx)
        throw new Error('useShop must be used within ShopProvider');
    return ctx;
}
