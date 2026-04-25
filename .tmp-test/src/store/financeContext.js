"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceProvider = FinanceProvider;
exports.useFinance = useFinance;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const storage_1 = require("../persistence/storage");
const mockData_1 = require("../data/mockData");
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
const FinanceContext = (0, react_1.createContext)(null);
function FinanceProvider({ children }) {
    const [state, dispatch] = (0, react_1.useReducer)(financeReducer, undefined, (_) => ({
        invoices: (0, storage_1.loadInvoices)(mockData_1.mockInvoices),
    }));
    (0, react_1.useEffect)(() => {
        (0, storage_1.save)(storage_1.KEYS.invoices, state.invoices);
    }, [state]);
    return ((0, jsx_runtime_1.jsx)(FinanceContext.Provider, { value: { ...state, dispatch }, children: children }));
}
function useFinance() {
    const ctx = (0, react_1.useContext)(FinanceContext);
    if (!ctx)
        throw new Error('useFinance must be used within FinanceProvider');
    return ctx;
}
