"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppProviders = AppProviders;
const jsx_runtime_1 = require("react/jsx-runtime");
const navigation_1 = require("./navigation");
const shopContext_1 = require("./shopContext");
const customerContext_1 = require("./customerContext");
const workContext_1 = require("./workContext");
const financeContext_1 = require("./financeContext");
const inventoryContext_1 = require("./inventoryContext");
const schedulerContext_1 = require("./schedulerContext");
function AppProviders({ children }) {
    return ((0, jsx_runtime_1.jsx)(navigation_1.NavigationProvider, { children: (0, jsx_runtime_1.jsx)(shopContext_1.ShopProvider, { children: (0, jsx_runtime_1.jsx)(customerContext_1.CustomerProvider, { children: (0, jsx_runtime_1.jsx)(workContext_1.WorkProvider, { children: (0, jsx_runtime_1.jsx)(financeContext_1.FinanceProvider, { children: (0, jsx_runtime_1.jsx)(inventoryContext_1.InventoryProvider, { children: (0, jsx_runtime_1.jsx)(schedulerContext_1.SchedulerProvider, { children: children }) }) }) }) }) }) }));
}
