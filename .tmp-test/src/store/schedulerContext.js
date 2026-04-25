"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerProvider = SchedulerProvider;
exports.useScheduler = useScheduler;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const storage_1 = require("../persistence/storage");
const mockData_1 = require("../data/mockData");
function schedulerReducer(state, action) {
    switch (action.type) {
        case 'UPSERT_APPOINTMENT': {
            const exists = state.appointments.some((a) => a.id === action.payload.id);
            return {
                appointments: exists
                    ? state.appointments.map((a) => a.id === action.payload.id ? action.payload : a)
                    : [action.payload, ...state.appointments],
            };
        }
        case 'DELETE_APPOINTMENT':
            return {
                appointments: state.appointments.filter((a) => a.id !== action.payload),
            };
        default:
            return state;
    }
}
const SchedulerContext = (0, react_1.createContext)(null);
function SchedulerProvider({ children }) {
    const [state, dispatch] = (0, react_1.useReducer)(schedulerReducer, undefined, (_) => ({
        appointments: (0, storage_1.loadAppointments)(mockData_1.mockAppointments),
    }));
    (0, react_1.useEffect)(() => {
        (0, storage_1.save)(storage_1.KEYS.appointments, state.appointments);
    }, [state]);
    return ((0, jsx_runtime_1.jsx)(SchedulerContext.Provider, { value: { ...state, dispatch }, children: children }));
}
function useScheduler() {
    const ctx = (0, react_1.useContext)(SchedulerContext);
    if (!ctx)
        throw new Error('useScheduler must be used within SchedulerProvider');
    return ctx;
}
