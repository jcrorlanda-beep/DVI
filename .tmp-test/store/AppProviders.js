import { jsx as _jsx } from "react/jsx-runtime";
import { NavigationProvider } from './navigation';
import { ShopProvider } from './shopContext';
import { CustomerProvider } from './customerContext';
import { WorkProvider } from './workContext';
import { FinanceProvider } from './financeContext';
import { InventoryProvider } from './inventoryContext';
import { SchedulerProvider } from './schedulerContext';
export function AppProviders({ children }) {
    return (_jsx(NavigationProvider, { children: _jsx(ShopProvider, { children: _jsx(CustomerProvider, { children: _jsx(WorkProvider, { children: _jsx(FinanceProvider, { children: _jsx(InventoryProvider, { children: _jsx(SchedulerProvider, { children: children }) }) }) }) }) }) }));
}
