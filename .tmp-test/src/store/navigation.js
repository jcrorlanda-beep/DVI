"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NavigationProvider = NavigationProvider;
exports.useNavigation = useNavigation;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const SUB_TO_TOP = {
    'customer-profile': 'customers',
    'workorder-detail': 'workorders',
    'workorder-form': 'workorders',
    'estimate-detail': 'estimates',
    'estimate-form': 'estimates',
    'invoice-detail': 'invoices',
};
const NavigationContext = (0, react_1.createContext)(null);
function NavigationProvider({ children }) {
    const [history, setHistory] = (0, react_1.useState)([{ page: 'dashboard' }]);
    const nav = history[history.length - 1];
    const activeSection = (SUB_TO_TOP[nav.page] ?? nav.page);
    const navigate = (to) => setHistory((h) => [...h, to]);
    const back = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
    return ((0, jsx_runtime_1.jsx)(NavigationContext.Provider, { value: { nav, navigate, back, activeSection }, children: children }));
}
function useNavigation() {
    const ctx = (0, react_1.useContext)(NavigationContext);
    if (!ctx)
        throw new Error('useNavigation must be used within NavigationProvider');
    return ctx;
}
