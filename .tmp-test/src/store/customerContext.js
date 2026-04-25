"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomerProvider = CustomerProvider;
exports.useCustomers = useCustomers;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const storage_1 = require("../persistence/storage");
const mockData_1 = require("../data/mockData");
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
const CustomerContext = (0, react_1.createContext)(null);
function CustomerProvider({ children }) {
    const [state, dispatch] = (0, react_1.useReducer)(customerReducer, undefined, (_) => ({
        customers: (0, storage_1.loadCustomers)(mockData_1.mockCustomers),
        vehicles: (0, storage_1.loadVehicles)(mockData_1.mockVehicles),
    }));
    (0, react_1.useEffect)(() => {
        (0, storage_1.save)(storage_1.KEYS.customers, state.customers);
        (0, storage_1.save)(storage_1.KEYS.vehicles, state.vehicles);
    }, [state]);
    return ((0, jsx_runtime_1.jsx)(CustomerContext.Provider, { value: { ...state, dispatch }, children: children }));
}
function useCustomers() {
    const ctx = (0, react_1.useContext)(CustomerContext);
    if (!ctx)
        throw new Error('useCustomers must be used within CustomerProvider');
    return ctx;
}
