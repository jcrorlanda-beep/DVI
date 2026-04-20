import React from "react";
import type { SessionUser, UserRole, RoleDefinition } from "../shared/types";
import { hasPermission } from "../shared/helpers";

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

function SettingsPage({
  currentUser,
  roleDefinitions,
  onResetDefaults,
  onResetIntakes,
}: {
  currentUser: SessionUser;
  roleDefinitions: RoleDefinition[];
  onResetDefaults: () => void;
  onResetIntakes: () => void;
}) {
  const canManageRoles = hasPermission(currentUser.role, roleDefinitions, "roles.manage");

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: "span 8" }}>
          <Card title="System Settings" subtitle="Phase 8 controls">
            <div style={styles.moduleText}>
              This build persists users, login session, current page, role permissions,
              intake records, inspection records, repair orders, QC records, release records, parts requests, and daily counters in localStorage.
            </div>
            <div style={styles.inlineActions}>
              <button
                type="button"
                style={{ ...styles.primaryButton, ...(canManageRoles ? {} : styles.buttonDisabled) }}
                disabled={!canManageRoles}
                onClick={onResetDefaults}
              >
                Reset Role Permissions to Default
              </button>
              <button type="button" style={styles.secondaryButton} onClick={onResetIntakes}>
                Clear Operational Records
              </button>
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 4" }}>
          <Card title="Current User" subtitle="Session summary">
            <div style={styles.quickAccessList}>
              <div>
                <strong>Name:</strong> {currentUser.fullName}
              </div>
              <div>
                <strong>Username:</strong> {currentUser.username}
              </div>
              <div>
                <strong>Role:</strong> <RoleBadge role={currentUser.role} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;

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

  moduleText: {
    fontSize: 15,
    lineHeight: 1.7,
    color: "#475569",
    marginBottom: 14,
  },

  inlineActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
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

  buttonDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },

  quickAccessList: {
    display: "grid",
    gap: 10,
  },
};
