import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useState } from "react";
import { hasPermission, formatDateTime, getResponsiveSpan } from "../shared/helpers";
import { ALL_ROLES } from "../shared/constants";
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
    return (_jsx("span", { style: {
            ...styles.roleBadge,
            background: ROLE_COLORS[role].bg,
            color: ROLE_COLORS[role].text,
        }, children: role }));
}
function Card({ title, subtitle, right, children, }) {
    return (_jsxs("div", { style: styles.card, children: [_jsxs("div", { style: styles.cardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.cardTitle, children: title }), subtitle ? _jsx("div", { style: styles.cardSubtitle, children: subtitle }) : null] }), right ? _jsx("div", { children: right }) : null] }), children] }));
}
function UsersPage({ currentUser, users, setUsers, roleDefinitions, isCompactLayout, }) {
    const canManageUsers = hasPermission(currentUser.role, roleDefinitions, "users.manage");
    const [form, setForm] = useState({
        fullName: "",
        username: "",
        password: "",
        role: "Reception",
        active: true,
    });
    const [error, setError] = useState("");
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
    return (_jsx("div", { style: styles.pageContent, children: _jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }, children: _jsx(Card, { title: "Create User", subtitle: "Action is permission-restricted", right: _jsx("span", { style: canManageUsers ? styles.statusOk : styles.statusLocked, children: canManageUsers ? "Manage Allowed" : "Manage Locked" }), children: _jsxs("form", { onSubmit: handleCreateUser, style: styles.formStack, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Full Name" }), _jsx("input", { style: styles.input, value: form.fullName, onChange: (e) => setForm((prev) => ({ ...prev, fullName: e.target.value })), disabled: !canManageUsers, placeholder: "Enter full name" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Username" }), _jsx("input", { style: styles.input, value: form.username, onChange: (e) => setForm((prev) => ({ ...prev, username: e.target.value })), disabled: !canManageUsers, placeholder: "Enter username" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Password" }), _jsx("input", { style: styles.input, type: "password", value: form.password, onChange: (e) => setForm((prev) => ({ ...prev, password: e.target.value })), disabled: !canManageUsers, placeholder: "Enter password" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Role" }), _jsx("select", { style: styles.select, value: form.role, onChange: (e) => setForm((prev) => ({ ...prev, role: e.target.value })), disabled: !canManageUsers, children: ALL_ROLES.map((role) => (_jsx("option", { value: role, children: role }, role))) })] }), _jsxs("label", { style: styles.checkboxRow, children: [_jsx("input", { type: "checkbox", checked: form.active, onChange: (e) => setForm((prev) => ({ ...prev, active: e.target.checked })), disabled: !canManageUsers }), _jsx("span", { children: "Active account" })] }), error ? _jsx("div", { style: styles.errorBox, children: error }) : null, _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "submit", style: {
                                                ...styles.primaryButton,
                                                ...(canManageUsers ? {} : styles.buttonDisabled),
                                            }, disabled: !canManageUsers, children: "Add User" }), _jsx("button", { type: "button", style: styles.secondaryButton, onClick: resetForm, children: "Reset" })] })] }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }, children: _jsx(Card, { title: "User Registry", subtitle: "All system users", children: isCompactLayout ? (_jsx("div", { style: styles.mobileCardList, children: users.map((user) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: user.fullName }), _jsx(RoleBadge, { role: user.role })] }), _jsxs("div", { style: styles.mobileDataSecondary, children: ["Username: ", user.username] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Status" }), _jsx("span", { style: user.active ? styles.statusOk : styles.statusLocked, children: user.active ? "Active" : "Inactive" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Created" }), _jsx("strong", { children: formatDateTime(user.createdAt) })] }), _jsx("button", { type: "button", style: {
                                            ...styles.smallButton,
                                            ...(canManageUsers ? {} : styles.buttonDisabled),
                                            width: "100%",
                                        }, disabled: !canManageUsers || user.role === "Admin", onClick: () => toggleUserActive(user.id), children: user.active ? "Deactivate" : "Activate" })] }, user.id))) })) : (_jsx("div", { style: styles.tableWrap, children: _jsxs("table", { style: styles.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: styles.th, children: "Name" }), _jsx("th", { style: styles.th, children: "Username" }), _jsx("th", { style: styles.th, children: "Role" }), _jsx("th", { style: styles.th, children: "Status" }), _jsx("th", { style: styles.th, children: "Created" }), _jsx("th", { style: styles.th, children: "Action" })] }) }), _jsx("tbody", { children: users.map((user) => (_jsxs("tr", { children: [_jsx("td", { style: styles.td, children: user.fullName }), _jsx("td", { style: styles.td, children: user.username }), _jsx("td", { style: styles.td, children: _jsx(RoleBadge, { role: user.role }) }), _jsx("td", { style: styles.td, children: _jsx("span", { style: user.active ? styles.statusOk : styles.statusLocked, children: user.active ? "Active" : "Inactive" }) }), _jsx("td", { style: styles.td, children: formatDateTime(user.createdAt) }), _jsx("td", { style: styles.td, children: _jsx("button", { type: "button", style: {
                                                            ...styles.smallButton,
                                                            ...(canManageUsers ? {} : styles.buttonDisabled),
                                                        }, disabled: !canManageUsers || user.role === "Admin", onClick: () => toggleUserActive(user.id), children: user.active ? "Deactivate" : "Activate" }) })] }, user.id))) })] }) })) }) })] }) }));
}
export default UsersPage;
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
