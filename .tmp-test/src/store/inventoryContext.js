"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventoryProvider = InventoryProvider;
exports.useInventory = useInventory;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const storage_1 = require("../persistence/storage");
const mockData_1 = require("../data/mockData");
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
const InventoryContext = (0, react_1.createContext)(null);
function InventoryProvider({ children }) {
    const [state, dispatch] = (0, react_1.useReducer)(inventoryReducer, undefined, (_) => ({
        parts: (0, storage_1.loadInventory)(mockData_1.mockInventory),
    }));
    (0, react_1.useEffect)(() => {
        (0, storage_1.save)(storage_1.KEYS.inventory, state.parts);
    }, [state]);
    return ((0, jsx_runtime_1.jsx)(InventoryContext.Provider, { value: { ...state, dispatch }, children: children }));
}
function useInventory() {
    const ctx = (0, react_1.useContext)(InventoryContext);
    if (!ctx)
        throw new Error('useInventory must be used within InventoryProvider');
    return ctx;
}
