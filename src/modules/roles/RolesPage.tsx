import React from "react";
import type { SessionUser, UserRole, Permission, RoleDefinition } from "../shared/types";
import { hasPermission } from "../shared/helpers";
import { ALL_PERMISSIONS } from "../shared/constants";

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

function PermissionPill({
  permission,
  checked,
  onToggle,
  disabled,
}: {
  permission: Permission;
  checked: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      style={{
        ...styles.permissionPill,
        ...(checked ? styles.permissionPillOn : styles.permissionPillOff),
        ...(disabled ? styles.permissionPillDisabled : {}),
      }}
    >
      {checked ? "✓ " : ""}
      {permission}
    </button>
  );
}

function RolesPage({
  currentUser,
  roleDefinitions,
  setRoleDefinitions,
}: {
  currentUser: SessionUser;
  roleDefinitions: RoleDefinition[];
  setRoleDefinitions: React.Dispatch<React.SetStateAction<RoleDefinition[]>>;
}) {
  const canManageRoles = hasPermission(currentUser.role, roleDefinitions, "roles.manage");

  const togglePermission = (role: UserRole, permission: Permission) => {
    if (!canManageRoles || role === "Admin") return;

    setRoleDefinitions((prev) =>
      prev.map((def) => {
        if (def.role !== role) return def;
        const exists = def.permissions.includes(permission);
        const nextPermissions = exists
          ? def.permissions.filter((p) => p !== permission)
          : [...def.permissions, permission];

        return {
          ...def,
          permissions: ALL_PERMISSIONS.filter((p) => nextPermissions.includes(p)),
        };
      })
    );
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title="Position + Permission System"
            subtitle="Sidebar visibility and action access are driven by these permissions"
            right={
              <span style={canManageRoles ? styles.statusOk : styles.statusLocked}>
                {canManageRoles ? "Edit Allowed" : "Edit Locked"}
              </span>
            }
          >
            <div style={styles.rolePermissionStack}>
              {roleDefinitions.map((def) => (
                <div key={def.role} style={styles.rolePermissionCard}>
                  <div style={styles.rolePermissionHeader}>
                    <RoleBadge role={def.role} />
                    {def.role === "Admin" ? (
                      <span style={styles.statusOk}>Full Access</span>
                    ) : (
                      <span style={styles.statusNeutral}>{def.permissions.length} permissions</span>
                    )}
                  </div>

                  <div style={styles.permissionWrap}>
                    {ALL_PERMISSIONS.map((permission) => (
                      <PermissionPill
                        key={`${def.role}_${permission}`}
                        permission={permission}
                        checked={def.role === "Admin" ? true : def.permissions.includes(permission)}
                        onToggle={() => togglePermission(def.role, permission)}
                        disabled={!canManageRoles || def.role === "Admin"}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default RolesPage;

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
