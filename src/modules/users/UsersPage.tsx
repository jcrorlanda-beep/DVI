import React, { useState } from "react";
import type { SessionUser, UserAccount, UserRole, RoleDefinition } from "../shared/types";
import { hasPermission, formatDateTime, getResponsiveSpan } from "../shared/helpers";
import { ALL_ROLES } from "../shared/constants";

type UserForm = {
  fullName: string;
  username: string;
  password: string;
  role: UserRole;
  active: boolean;
};

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

const ROLE_COLORS: Record<UserRole, { bg: string; text: string }> = {
  Admin: { bg: "#fee2e2", text: "#991b1b" },
  "Service Advisor": { bg: "#dbeafe", text: "#1d4ed8" },
  "Chief Technician": { bg: "#dcfce7", text: "#166534" },
  "Senior Mechanic": { bg: "#fef3c7", text: "#92400e" },
  "General Mechanic": { bg: "#ede9fe", text: "#6d28d9" },
  "Office Staff": { bg: "#cffafe", text: "#155e75" },
  Reception: { bg: "#fae8ff", text: "#86198f" },
  OJT: { bg: "#e5e7eb", text: "#374151" },
};

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span
      style={{
        ...styles.roleBadge,
        background: ROLE_COLORS[role].bg,
        color: ROLE_COLORS[role].text,
      }}
    >
      {role}
    </span>
  );
}

function Card({
  title,
  subtitle,
  right,
  children,
}: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <div>
          <div style={styles.cardTitle}>{title}</div>
          {subtitle ? <div style={styles.cardSubtitle}>{subtitle}</div> : null}
        </div>
        {right ? <div>{right}</div> : null}
      </div>
      {children}
    </div>
  );
}

function UsersPage({
  currentUser,
  users,
  setUsers,
  roleDefinitions,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  roleDefinitions: RoleDefinition[];
  isCompactLayout: boolean;
}) {
  const canManageUsers = hasPermission(currentUser.role, roleDefinitions, "users.manage");

  const [form, setForm] = useState<UserForm>({
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

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageUsers) return;

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

    const newUser: UserAccount = {
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

  const toggleUserActive = (id: string) => {
    if (!canManageUsers) return;
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, active: !user.active } : user))
    );
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }}>
          <Card
            title="Create User"
            subtitle="Action is permission-restricted"
            right={
              <span style={canManageUsers ? styles.statusOk : styles.statusLocked}>
                {canManageUsers ? "Manage Allowed" : "Manage Locked"}
              </span>
            }
          >
            <form onSubmit={handleCreateUser} style={styles.formStack}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  disabled={!canManageUsers}
                  placeholder="Enter full name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Username</label>
                <input
                  style={styles.input}
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  disabled={!canManageUsers}
                  placeholder="Enter username"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  disabled={!canManageUsers}
                  placeholder="Enter password"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select
                  style={styles.select}
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                  disabled={!canManageUsers}
                >
                  {ALL_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                  disabled={!canManageUsers}
                />
                <span>Active account</span>
              </label>

              {error ? <div style={styles.errorBox}>{error}</div> : null}

              <div style={styles.inlineActions}>
                <button
                  type="submit"
                  style={{
                    ...styles.primaryButton,
                    ...(canManageUsers ? {} : styles.buttonDisabled),
                  }}
                  disabled={!canManageUsers}
                >
                  Add User
                </button>
                <button type="button" style={styles.secondaryButton} onClick={resetForm}>
                  Reset
                </button>
              </div>
            </form>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }}>
          <Card title="User Registry" subtitle="All system users">
            {isCompactLayout ? (
              <div style={styles.mobileCardList}>
                {users.map((user) => (
                  <div key={user.id} style={styles.mobileDataCard}>
                    <div style={styles.mobileDataCardHeader}>
                      <strong>{user.fullName}</strong>
                      <RoleBadge role={user.role} />
                    </div>
                    <div style={styles.mobileDataSecondary}>Username: {user.username}</div>
                    <div style={styles.mobileMetaRow}>
                      <span>Status</span>
                      <span style={user.active ? styles.statusOk : styles.statusLocked}>
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div style={styles.mobileMetaRow}>
                      <span>Created</span>
                      <strong>{formatDateTime(user.createdAt)}</strong>
                    </div>
                    <button
                      type="button"
                      style={{
                        ...styles.smallButton,
                        ...(canManageUsers ? {} : styles.buttonDisabled),
                        width: "100%",
                      }}
                      disabled={!canManageUsers || user.role === "Admin"}
                      onClick={() => toggleUserActive(user.id)}
                    >
                      {user.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Username</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Created</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td style={styles.td}>{user.fullName}</td>
                        <td style={styles.td}>{user.username}</td>
                        <td style={styles.td}>
                          <RoleBadge role={user.role} />
                        </td>
                        <td style={styles.td}>
                          <span style={user.active ? styles.statusOk : styles.statusLocked}>
                            {user.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={styles.td}>{formatDateTime(user.createdAt)}</td>
                        <td style={styles.td}>
                          <button
                            type="button"
                            style={{
                              ...styles.smallButton,
                              ...(canManageUsers ? {} : styles.buttonDisabled),
                            }}
                            disabled={!canManageUsers || user.role === "Admin"}
                            onClick={() => toggleUserActive(user.id)}
                          >
                            {user.active ? "Deactivate" : "Activate"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default UsersPage;

const styles: Record<string, React.CSSProperties> = {
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
