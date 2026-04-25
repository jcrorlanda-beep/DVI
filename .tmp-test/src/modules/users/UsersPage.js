"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const helpers_1 = require("../shared/helpers");
const constants_1 = require("../shared/constants");
function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
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
function UsersPage({ currentUser, users, setUsers, roleDefinitions, isCompactLayout, }) {
    const canManageUsers = (0, helpers_1.hasPermission)(currentUser.role, roleDefinitions, "users.manage");
    const [form, setForm] = (0, react_1.useState)({
        fullName: "",
        username: "",
        password: "",
        role: "Reception",
        active: true,
    });
    const [error, setError] = (0, react_1.useState)("");
    const resetForm = () => {
        setForm({
            fullName: "",
            username: "",
            password: "",
            role: "Reception",
            active: true,
        });
        setError("");
    };
    const handleCreateUser = (e) => {
        e.preventDefault();
        if (!canManageUsers)
            return;
        const fullName = form.fullName.trim();
        const username = form.username.trim().toLowerCase();
        const password = form.password;
        if (!fullName || !username || !password) {
            setError("Full name, username, and password are required.");
            return;
        }
        if (users.some((u) => u.username.toLowerCase() === username)) {
            setError("Username already exists.");
            return;
        }
        const newUser = {
            id: uid("usr"),
            fullName,
            username,
            password,
            role: form.role,
            active: form.active,
            createdAt: new Date().toISOString(),
        };
        setUsers((prev) => [newUser, ...prev]);
        resetForm();
    };
    const toggleUserActive = (id) => {
        if (!canManageUsers)
            return;
        setUsers((prev) => prev.map((user) => (user.id === id ? { ...user, active: !user.active } : user)));
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: styles.pageContent, children: (0, jsx_runtime_1.jsxs)("div", { style: styles.grid, children: [(0, jsx_runtime_1.jsx)("div", { style: { ...styles.gridItem, gridColumn: (0, helpers_1.getResponsiveSpan)(5, isCompactLayout) }, children: (0, jsx_runtime_1.jsx)(Card, { title: "Create User", subtitle: "Action is permission-restricted", right: (0, jsx_runtime_1.jsx)("span", { style: canManageUsers ? styles.statusOk : styles.statusLocked, children: canManageUsers ? "Manage Allowed" : "Manage Locked" }), children: (0, jsx_runtime_1.jsxs)("form", { onSubmit: handleCreateUser, style: styles.formStack, children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.formGroup, children: [(0, jsx_runtime_1.jsx)("label", { style: styles.label, children: "Full Name" }), (0, jsx_runtime_1.jsx)("input", { style: styles.input, value: form.fullName, onChange: (e) => setForm((prev) => ({ ...prev, fullName: e.target.value })), disabled: !canManageUsers, placeholder: "Enter full name" })] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.formGroup, children: [(0, jsx_runtime_1.jsx)("label", { style: styles.label, children: "Username" }), (0, jsx_runtime_1.jsx)("input", { style: styles.input, value: form.username, onChange: (e) => setForm((prev) => ({ ...prev, username: e.target.value })), disabled: !canManageUsers, placeholder: "Enter username" })] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.formGroup, children: [(0, jsx_runtime_1.jsx)("label", { style: styles.label, children: "Password" }), (0, jsx_runtime_1.jsx)("input", { style: styles.input, type: "password", value: form.password, onChange: (e) => setForm((prev) => ({ ...prev, password: e.target.value })), disabled: !canManageUsers, placeholder: "Enter password" })] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.formGroup, children: [(0, jsx_runtime_1.jsx)("label", { style: styles.label, children: "Role" }), (0, jsx_runtime_1.jsx)("select", { style: styles.select, value: form.role, onChange: (e) => setForm((prev) => ({ ...prev, role: e.target.value })), disabled: !canManageUsers, children: constants_1.ALL_ROLES.map((role) => ((0, jsx_runtime_1.jsx)("option", { value: role, children: role }, role))) })] }), (0, jsx_runtime_1.jsxs)("label", { style: styles.checkboxRow, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: form.active, onChange: (e) => setForm((prev) => ({ ...prev, active: e.target.checked })), disabled: !canManageUsers }), (0, jsx_runtime_1.jsx)("span", { children: "Active account" })] }), error ? (0, jsx_runtime_1.jsx)("div", { style: styles.errorBox, children: error }) : null, (0, jsx_runtime_1.jsxs)("div", { style: styles.inlineActions, children: [(0, jsx_runtime_1.jsx)("button", { type: "submit", style: {
                                                ...styles.primaryButton,
                                                ...(canManageUsers ? {} : styles.buttonDisabled),
                                            }, disabled: !canManageUsers, children: "Add User" }), (0, jsx_runtime_1.jsx)("button", { type: "button", style: styles.secondaryButton, onClick: resetForm, children: "Reset" })] })] }) }) }), (0, jsx_runtime_1.jsx)("div", { style: { ...styles.gridItem, gridColumn: (0, helpers_1.getResponsiveSpan)(7, isCompactLayout) }, children: (0, jsx_runtime_1.jsx)(Card, { title: "User Registry", subtitle: "All system users", children: isCompactLayout ? ((0, jsx_runtime_1.jsx)("div", { style: styles.mobileCardList, children: users.map((user) => ((0, jsx_runtime_1.jsxs)("div", { style: styles.mobileDataCard, children: [(0, jsx_runtime_1.jsxs)("div", { style: styles.mobileDataCardHeader, children: [(0, jsx_runtime_1.jsx)("strong", { children: user.fullName }), (0, jsx_runtime_1.jsx)(RoleBadge, { role: user.role })] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.mobileDataSecondary, children: ["Username: ", user.username] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.mobileMetaRow, children: [(0, jsx_runtime_1.jsx)("span", { children: "Status" }), (0, jsx_runtime_1.jsx)("span", { style: user.active ? styles.statusOk : styles.statusLocked, children: user.active ? "Active" : "Inactive" })] }), (0, jsx_runtime_1.jsxs)("div", { style: styles.mobileMetaRow, children: [(0, jsx_runtime_1.jsx)("span", { children: "Created" }), (0, jsx_runtime_1.jsx)("strong", { children: (0, helpers_1.formatDateTime)(user.createdAt) })] }), (0, jsx_runtime_1.jsx)("button", { type: "button", style: {
                                            ...styles.smallButton,
                                            ...(canManageUsers ? {} : styles.buttonDisabled),
                                            width: "100%",
                                        }, disabled: !canManageUsers || user.role === "Admin", onClick: () => toggleUserActive(user.id), children: user.active ? "Deactivate" : "Activate" })] }, user.id))) })) : ((0, jsx_runtime_1.jsx)("div", { style: styles.tableWrap, children: (0, jsx_runtime_1.jsxs)("table", { style: styles.table, children: [(0, jsx_runtime_1.jsx)("thead", { children: (0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("th", { style: styles.th, children: "Name" }), (0, jsx_runtime_1.jsx)("th", { style: styles.th, children: "Username" }), (0, jsx_runtime_1.jsx)("th", { style: styles.th, children: "Role" }), (0, jsx_runtime_1.jsx)("th", { style: styles.th, children: "Status" }), (0, jsx_runtime_1.jsx)("th", { style: styles.th, children: "Created" }), (0, jsx_runtime_1.jsx)("th", { style: styles.th, children: "Action" })] }) }), (0, jsx_runtime_1.jsx)("tbody", { children: users.map((user) => ((0, jsx_runtime_1.jsxs)("tr", { children: [(0, jsx_runtime_1.jsx)("td", { style: styles.td, children: user.fullName }), (0, jsx_runtime_1.jsx)("td", { style: styles.td, children: user.username }), (0, jsx_runtime_1.jsx)("td", { style: styles.td, children: (0, jsx_runtime_1.jsx)(RoleBadge, { role: user.role }) }), (0, jsx_runtime_1.jsx)("td", { style: styles.td, children: (0, jsx_runtime_1.jsx)("span", { style: user.active ? styles.statusOk : styles.statusLocked, children: user.active ? "Active" : "Inactive" }) }), (0, jsx_runtime_1.jsx)("td", { style: styles.td, children: (0, helpers_1.formatDateTime)(user.createdAt) }), (0, jsx_runtime_1.jsx)("td", { style: styles.td, children: (0, jsx_runtime_1.jsx)("button", { type: "button", style: {
                                                            ...styles.smallButton,
                                                            ...(canManageUsers ? {} : styles.buttonDisabled),
                                                        }, disabled: !canManageUsers || user.role === "Admin", onClick: () => toggleUserActive(user.id), children: user.active ? "Deactivate" : "Activate" }) })] }, user.id))) })] }) })) }) })] }) }));
}
exports.default = UsersPage;
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
    formStack: {
        display: "grid",
        gap: 14,
    },
    formGroup: {
        display: "grid",
        gap: 8,
    },
    label: {
        fontSize: 13,
        fontWeight: 700,
        color: "#334155",
    },
    input: {
        width: "100%",
        border: "1px solid rgba(148, 163, 184, 0.35)",
        borderRadius: 12,
        padding: "12px 14px",
        background: "#ffffff",
        outline: "none",
        color: "#0f172a",
        minHeight: 44,
    },
    select: {
        width: "100%",
        border: "1px solid rgba(148, 163, 184, 0.35)",
        borderRadius: 12,
        padding: "12px 14px",
        background: "#ffffff",
        outline: "none",
        color: "#0f172a",
        minHeight: 44,
    },
    checkboxRow: {
        display: "flex",
        alignItems: "center",
        gap: 8,
        color: "#334155",
        fontSize: 14,
    },
    errorBox: {
        background: "#fee2e2",
        color: "#991b1b",
        borderRadius: 12,
        padding: "10px 12px",
        fontSize: 14,
        fontWeight: 700,
    },
    primaryButton: {
        border: "none",
        borderRadius: 12,
        padding: "13px 16px",
        background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
        color: "#fff",
        fontWeight: 800,
        cursor: "pointer",
        boxShadow: "0 10px 24px rgba(37, 99, 235, 0.22)",
    },
    secondaryButton: {
        border: "1px solid rgba(148, 163, 184, 0.3)",
        borderRadius: 12,
        padding: "13px 16px",
        background: "#ffffff",
        color: "#0f172a",
        fontWeight: 700,
        cursor: "pointer",
    },
    smallButton: {
        border: "none",
        borderRadius: 10,
        padding: "8px 10px",
        background: "#1d4ed8",
        color: "#fff",
        fontWeight: 700,
        cursor: "pointer",
        fontSize: 12,
    },
    buttonDisabled: {
        opacity: 0.55,
        cursor: "not-allowed",
    },
    inlineActions: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
    },
    tableWrap: {
        width: "100%",
        overflowX: "auto",
        border: "1px solid rgba(148, 163, 184, 0.18)",
        borderRadius: 16,
        background: "#ffffff",
    },
    table: {
        minWidth: 900,
        width: "100%",
    },
    th: {
        textAlign: "left",
        padding: "13px 12px",
        borderBottom: "1px solid rgba(226, 232, 240, 0.95)",
        background: "#f8fafc",
        color: "#475569",
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: 0.2,
        whiteSpace: "nowrap",
    },
    td: {
        padding: "13px 12px",
        borderBottom: "1px solid rgba(226, 232, 240, 0.9)",
        color: "#111827",
        fontSize: 13,
        verticalAlign: "top",
        lineHeight: 1.5,
    },
    mobileCardList: {
        display: "grid",
        gap: 12,
    },
    mobileDataCard: {
        border: "1px solid rgba(148, 163, 184, 0.22)",
        background: "#ffffff",
        borderRadius: 18,
        padding: 14,
        boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
    },
    mobileDataCardHeader: {
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 8,
        flexWrap: "wrap",
    },
    mobileDataSecondary: {
        fontSize: 13,
        color: "#64748b",
        marginTop: 4,
        lineHeight: 1.5,
    },
    mobileMetaRow: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 12,
        paddingTop: 8,
        marginTop: 8,
        borderTop: "1px solid rgba(226, 232, 240, 0.9)",
        fontSize: 13,
        color: "#475569",
    },
};
