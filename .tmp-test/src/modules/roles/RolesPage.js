"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const helpers_1 = require("../shared/helpers");
const constants_1 = require("../shared/constants");
const ROLE_COLORS = {
    Admin: { bg: "#fee2e2", text: "#991b1b" },
    "Service Advisor": { bg: "#dbeafe", text: "#1d4ed8" },
    "Chief Technician": { bg: "#dcfce7", text: "#166534" },
    "Senior Mechanic": { bg: "#fef3c7", text: "#92400e" },
    "General Mechanic": { bg: "#ede9fe", text: "#6d28d9" },
    "Office Staff": { bg: "#cffafe", text: "#155e75" },
    Reception: { bg: "#fae8ff", text: "#86198f" },
    OJT: { bg: "#e5e7eb", text: "#374151" },
};
function RoleBadge({ role }) {
    return ((0, jsx_runtime_1.jsx)("span", { style: {
            ...styles.roleBadge,
            background: ROLE_COLORS[role].bg,
            color: ROLE_COLORS[role].text,
        }, children: role }));
}
function Card({ title, subtitle, right, children, }) {
    return ((0, jsx_runtime_1.jsxs)("div", { style: styles.card, children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.cardHeader, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: styles.cardTitle, children: title }), subtitle ? (0, jsx_runtime_1.jsx)("div", { style: styles.cardSubtitle, children: subtitle }) : null] }), right ? (0, jsx_runtime_1.jsx)("div", { children: right }) : null] }), children] }));
}
function PermissionPill({ permission, checked, onToggle, disabled, }) {
    return ((0, jsx_runtime_1.jsxs)("button", { type: "button", onClick: onToggle, disabled: disabled, style: {
            ...styles.permissionPill,
            ...(checked ? styles.permissionPillOn : styles.permissionPillOff),
            ...(disabled ? styles.permissionPillDisabled : {}),
        }, children: [checked ? "✓ " : "", permission] }));
}
function RolesPage({ currentUser, roleDefinitions, setRoleDefinitions, }) {
    const canManageRoles = (0, helpers_1.hasPermission)(currentUser.role, roleDefinitions, "roles.manage");
    const togglePermission = (role, permission) => {
        if (!canManageRoles || role === "Admin")
            return;
        setRoleDefinitions((prev) => prev.map((def) => {
            if (def.role !== role)
                return def;
            const exists = def.permissions.includes(permission);
            const nextPermissions = exists
                ? def.permissions.filter((p) => p !== permission)
                : [...def.permissions, permission];
            return {
                ...def,
                permissions: constants_1.ALL_PERMISSIONS.filter((p) => nextPermissions.includes(p)),
            };
        }));
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: styles.pageContent, children: (0, jsx_runtime_1.jsx)("div", { style: styles.grid, children: (0, jsx_runtime_1.jsx)("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: (0, jsx_runtime_1.jsx)(Card, { title: "Position + Permission System", subtitle: "Sidebar visibility and action access are driven by these permissions", right: (0, jsx_runtime_1.jsx)("span", { style: canManageRoles ? styles.statusOk : styles.statusLocked, children: canManageRoles ? "Edit Allowed" : "Edit Locked" }), children: (0, jsx_runtime_1.jsx)("div", { style: styles.rolePermissionStack, children: roleDefinitions.map((def) => ((0, jsx_runtime_1.jsxs)("div", { style: styles.rolePermissionCard, children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.rolePermissionHeader, children: [(0, jsx_runtime_1.jsx)(RoleBadge, { role: def.role }), def.role === "Admin" ? ((0, jsx_runtime_1.jsx)("span", { style: styles.statusOk, children: "Full Access" })) : ((0, jsx_runtime_1.jsxs)("span", { style: styles.statusNeutral, children: [def.permissions.length, " permissions"] }))] }), (0, jsx_runtime_1.jsx)("div", { style: styles.permissionWrap, children: constants_1.ALL_PERMISSIONS.map((permission) => ((0, jsx_runtime_1.jsx)(PermissionPill, { permission: permission, checked: def.role === "Admin" ? true : def.permissions.includes(permission), onToggle: () => togglePermission(def.role, permission), disabled: !canManageRoles || def.role === "Admin" }, `${def.role}_${permission}`))) })] }, def.role))) }) }) }) }) }));
}
exports.default = RolesPage;
const styles = {
    pageContent: {
        width: "100%",
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
        gap: 16,
    },
    gridItem: {
        minWidth: 0,
    },
    card: {
        background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.98) 100%)",
        border: "1px solid rgba(29,78,216,0.16)",
        borderRadius: 18,
        padding: 18,
        boxShadow: "0 8px 28px rgba(5, 11, 29, 0.12)",
        height: "100%",
    },
    cardHeader: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: 14,
        flexWrap: "wrap",
    },
    cardTitle: {
        fontSize: 19,
        fontWeight: 800,
        color: "#0f172a",
        lineHeight: 1.3,
    },
    cardSubtitle: {
        marginTop: 4,
        fontSize: 13,
        color: "#64748b",
        lineHeight: 1.5,
    },
    roleBadge: {
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 999,
        padding: "6px 10px",
        fontSize: 12,
        fontWeight: 800,
        whiteSpace: "nowrap",
    },
    statusOk: {
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "6px 10px",
        background: "#dcfce7",
        color: "#166534",
        fontSize: 12,
        fontWeight: 800,
        whiteSpace: "nowrap",
    },
    statusLocked: {
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "6px 10px",
        background: "#fee2e2",
        color: "#991b1b",
        fontSize: 12,
        fontWeight: 800,
        whiteSpace: "nowrap",
    },
    statusNeutral: {
        display: "inline-flex",
        alignItems: "center",
        borderRadius: 999,
        padding: "6px 10px",
        background: "#e2e8f0",
        color: "#475569",
        fontSize: 12,
        fontWeight: 800,
        whiteSpace: "nowrap",
    },
    permissionWrap: {
        display: "flex",
        flexWrap: "wrap",
        gap: 10,
    },
    permissionPill: {
        borderRadius: 999,
        padding: "8px 12px",
        border: "1px solid #d1d5db",
        fontSize: 12,
        fontWeight: 700,
        cursor: "pointer",
        transition: "all 0.15s ease",
    },
    permissionPillOn: {
        background: "#dcfce7",
        color: "#166534",
        borderColor: "#86efac",
    },
    permissionPillOff: {
        background: "#f8fafc",
        color: "#475569",
        borderColor: "#cbd5e1",
    },
    permissionPillDisabled: {
        cursor: "default",
        opacity: 0.9,
    },
    rolePermissionStack: {
        display: "grid",
        gap: 16,
    },
    rolePermissionCard: {
        border: "1px solid #e5e7eb",
        borderRadius: 16,
        padding: 14,
        background: "#f8fafc",
    },
    rolePermissionHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 12,
        flexWrap: "wrap",
    },
};
