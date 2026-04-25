"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkProvider = WorkProvider;
exports.useWork = useWork;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const storage_1 = require("../persistence/storage");
const mockData_1 = require("../data/mockData");
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
const WorkContext = (0, react_1.createContext)(null);
function WorkProvider({ children }) {
    const [state, dispatch] = (0, react_1.useReducer)(workReducer, undefined, (_) => ({
        workOrders: (0, storage_1.loadWorkOrders)(mockData_1.mockWorkOrders),
        estimates: (0, storage_1.loadEstimates)(mockData_1.mockEstimates),
    }));
    (0, react_1.useEffect)(() => {
        (0, storage_1.save)(storage_1.KEYS.workOrders, state.workOrders);
        (0, storage_1.save)(storage_1.KEYS.estimates, state.estimates);
    }, [state]);
    return ((0, jsx_runtime_1.jsx)(WorkContext.Provider, { value: { ...state, dispatch }, children: children }));
}
function useWork() {
    const ctx = (0, react_1.useContext)(WorkContext);
    if (!ctx)
        throw new Error('useWork must be used within WorkProvider');
    return ctx;
}
