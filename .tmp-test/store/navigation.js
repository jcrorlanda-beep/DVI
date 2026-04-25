import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState } from 'react';
const SUB_TO_TOP = {
    'customer-profile': 'customers',
    'workorder-detail': 'workorders',
    'workorder-form': 'workorders',
    'estimate-detail': 'estimates',
    'estimate-form': 'estimates',
    'invoice-detail': 'invoices',
};
const NavigationContext = createContext(null);
export function NavigationProvider({ children }) {
    const [history, setHistory] = useState([{ page: 'dashboard' }]);
    const nav = history[history.length - 1];
    const activeSection = (SUB_TO_TOP[nav.page] ?? nav.page);
    const navigate = (to) => setHistory((h) => [...h, to]);
    const back = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h));
    return (_jsx(NavigationContext.Provider, { value: { nav, navigate, back, activeSection }, children: children }));
}
export function useNavigation() {
    const ctx = useContext(NavigationContext);
    if (!ctx)
        throw new Error('useNavigation must be used within NavigationProvider');
    return ctx;
}
