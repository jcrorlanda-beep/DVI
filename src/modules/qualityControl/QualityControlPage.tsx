import React, { useState, useEffect, useMemo } from "react";
import type {
  UserRole,
  SessionUser,
  RepairOrderRecord,
  QCRecord,
  QCResult,
  ROStatus,
  WorkLineStatus,
  WorkLog,
} from "../shared/types";
import {
  todayStamp,
  parseMoneyInput,
  formatCurrency,
  formatDateTime,
  getResponsiveSpan,
} from "../shared/helpers";

const STORAGE_KEYS = {
  counters: "dvi_phase2_counters_v1",
} as const;

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

const styles: Record<string, React.CSSProperties> = {
  appShell: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #050b1d 0%, #08152f 34%, #101a2d 100%)",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    zIndex: 30,
  },

  sidebar: {
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    background: "linear-gradient(180deg, #071126 0%, #0d2d74 42%, #7f1018 100%)",
    color: "#fff",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    zIndex: 40,
    transition: "transform 0.2s ease",
    boxShadow: "0 10px 30px rgba(0,0,0,0.18)",
  },

  sidebarDesktop: {
    transform: "translateX(0)",
  },

  sidebarMobileOpen: {
    transform: "translateX(0)",
  },

  sidebarMobileClosed: {
    transform: "translateX(-100%)",
  },

  sidebarHeader: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    borderBottom: "1px solid rgba(255,255,255,0.12)",
    paddingBottom: 14,
  },

  sidebarLogo: {
    width: 46,
    height: 46,
    borderRadius: 14,
    background: "linear-gradient(135deg, #facc15 0%, #f59e0b 42%, #dc2626 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    letterSpacing: 1,
    flexShrink: 0,
  },

  sidebarTitle: {
    fontSize: 18,
    fontWeight: 800,
  },

  sidebarSubtitle: {
    fontSize: 12,
    color: "#f8e7a5",
    marginTop: 2,
  },

  userPanel: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    background: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    padding: 12,
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: "50%",
    background: "#1d4ed8",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    flexShrink: 0,
  },

  userPanelName: {
    fontSize: 14,
    fontWeight: 700,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },

  userPanelRole: {
    fontSize: 12,
    color: "#cbd5e1",
    marginTop: 3,
  },

  navList: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflowY: "auto",
    flex: 1,
    paddingRight: 2,
  },

  navButton: {
    width: "100%",
    border: "none",
    background: "transparent",
    color: "#e5e7eb",
    borderRadius: 12,
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    cursor: "pointer",
    textAlign: "left",
    fontWeight: 700,
  },

  navButtonActive: {
    background: "linear-gradient(90deg, rgba(220,38,38,0.92) 0%, rgba(29,78,216,0.96) 100%)",
    color: "#ffffff",
  },

  navIcon: {
    width: 22,
    textAlign: "center",
    flexShrink: 0,
  },

  sidebarFooter: {
    borderTop: "1px solid rgba(255,255,255,0.12)",
    paddingTop: 14,
  },

  logoutButton: {
    width: "100%",
    border: "none",
    background: "linear-gradient(90deg, #dc2626 0%, #b91c1c 100%)",
    color: "#fff",
    borderRadius: 12,
    padding: "12px 14px",
    fontWeight: 800,
    cursor: "pointer",
  },

  mainArea: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    transition: "margin-left 0.2s ease",
  },

  topBar: {
    position: "sticky",
    top: 0,
    zIndex: 20,
    background: "rgba(7, 17, 38, 0.92)",
    backdropFilter: "blur(10px)",
    borderBottom: "1px solid rgba(250, 204, 21, 0.35)",
    padding: "14px 18px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },

  topBarLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    minWidth: 0,
  },

  topBarRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    justifyContent: "flex-end",
  },

  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    border: "1px solid #d1d5db",
    background: "#fff",
    cursor: "pointer",
    flexShrink: 0,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: 800,
    color: "#f8fafc",
  },

  pageSubtitle: {
    fontSize: 12,
    color: "#cbd5e1",
    marginTop: 2,
  },

  topBarName: {
    fontSize: 14,
    fontWeight: 700,
    color: "#e2e8f0",
  },

  mainContent: {
    padding: 18,
    minWidth: 0,
  },

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

  heroText: {
    fontSize: 15,
    lineHeight: 1.7,
    color: "#475569",
  },

  statCard: {
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
    height: "100%",
  },

  statLabel: {
    fontSize: 13,
    fontWeight: 700,
    color: "#64748b",
    marginBottom: 8,
  },

  statValue: {
    fontSize: 28,
    fontWeight: 800,
    color: "#111827",
    lineHeight: 1.2,
    wordBreak: "break-word",
  },

  roleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
    gap: 12,
  },

  roleTile: {
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 16,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    color: "#334155",
    alignItems: "flex-start",
  },

  roleTileCount: {
    fontSize: 24,
    color: "#0f172a",
  },

  quickAccessList: {
    display: "grid",
    gap: 10,
  },

  quickAccessRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 12,
    padding: "10px 12px",
    background: "#f8fafc",
    color: "#334155",
    fontWeight: 600,
  },

  quickAccessIcon: {
    width: 20,
    textAlign: "center",
    flexShrink: 0,
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

  moduleText: {
    fontSize: 15,
    lineHeight: 1.7,
    color: "#475569",
    marginBottom: 14,
  },

  moduleMetaRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
    marginTop: 8,
    color: "#334155",
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

  loginShell: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    background: "linear-gradient(135deg, #0f172a 0%, #1d4ed8 45%, #eff6ff 100%)",
  },

  loginPanel: {
    width: "100%",
    maxWidth: 520,
    background: "rgba(255,255,255,0.97)",
    borderRadius: 24,
    padding: 26,
    border: "1px solid rgba(255,255,255,0.72)",
    boxShadow: "0 24px 70px rgba(2, 8, 23, 0.24)",
  },

  loginBrand: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 22,
  },

  brandLogo: {
    width: 54,
    height: 54,
    borderRadius: 16,
    background: "linear-gradient(90deg, #dc2626 0%, #1d4ed8 100%)",
    color: "#fff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    letterSpacing: 1,
    flexShrink: 0,
  },

  loginTitle: {
    fontSize: 24,
    fontWeight: 800,
    color: "#0f172a",
  },

  loginSubtitle: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },

  buildNoteBox: {
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
    borderRadius: 16,
    padding: 14,
    marginBottom: 18,
  },

  buildNoteTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: "#1d4ed8",
    marginBottom: 6,
  },

  buildNoteText: {
    fontSize: 14,
    lineHeight: 1.6,
    color: "#334155",
  },

  loginForm: {
    display: "grid",
    gap: 14,
  },

  formStack: {
    display: "grid",
    gap: 14,
  },

  formGroup: {
    display: "grid",
    gap: 8,
  },

  formGrid2: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },

  formGrid3: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
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

  textarea: {
    width: "100%",
    minHeight: 96,
    border: "1px solid rgba(148, 163, 184, 0.35)",
    borderRadius: 12,
    padding: "12px 14px",
    background: "#ffffff",
    outline: "none",
    color: "#0f172a",
    lineHeight: 1.5,
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

  smallButtonMuted: {
    border: "none",
    borderRadius: 10,
    padding: "8px 10px",
    background: "#64748b",
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

  inlineActionsColumn: {
    display: "grid",
    gap: 8,
  },

  demoBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTop: "1px solid rgba(148, 163, 184, 0.28)",
  },

  demoTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 10,
  },

  demoGrid: {
    display: "grid",
    gap: 8,
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.55,
  },

  updateNoteBox: {
    background: "linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)",
    border: "1px solid rgba(37, 99, 235, 0.16)",
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
  },

  updateNoteTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 6,
  },

  updateNoteText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.55,
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

  statusInfo: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    background: "#dbeafe",
    color: "#1d4ed8",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  statusWarning: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    background: "#fef3c7",
    color: "#92400e",
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

  inspectionActionBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(29,78,216,0.16)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(239,246,255,0.98) 100%)",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
    position: "sticky",
    top: 12,
    zIndex: 4,
  },

  inspectionActionSummary: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    flex: 1,
  },

  inspectionSummaryPill: {
    minWidth: 118,
    display: "grid",
    gap: 4,
    padding: "10px 12px",
    borderRadius: 14,
    background: "#ffffff",
    border: "1px solid #dbeafe",
    color: "#1e3a8a",
    fontSize: 12,
  },

  pillWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },

  pillButton: {
    border: "1px solid #bfdbfe",
    borderRadius: 999,
    padding: "8px 12px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 700,
    cursor: "pointer",
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

  portalTabActive: {
    background: "#1d4ed8",
    color: "#ffffff",
    borderColor: "#1d4ed8",
    boxShadow: "0 10px 24px rgba(29, 78, 216, 0.22)",
  },

  textareaLarge: {
    width: "100%",
    minHeight: 140,
    border: "1px solid rgba(37, 99, 235, 0.22)",
    borderRadius: 14,
    padding: "12px 14px",
    background: "#ffffff",
    outline: "none",
    color: "#0f172a",
    lineHeight: 1.5,
  },

  smallButtonSuccess: {
    border: "none",
    borderRadius: 10,
    padding: "8px 10px",
    background: "#16a34a",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },

  smallButtonDanger: {
    border: "none",
    borderRadius: 10,
    padding: "8px 10px",
    background: "#dc2626",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },

  sectionCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 6px 22px rgba(15, 23, 42, 0.06)",
  },

  sectionCardMuted: {
    background: "#f8fafc",
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 16,
    padding: 14,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 10,
  },

  formHint: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 1.5,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 10,
    marginBottom: 12,
  },

  concernBanner: {
    borderRadius: 14,
    padding: "12px 14px",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    fontSize: 13,
    lineHeight: 1.5,
    marginBottom: 12,
  },

  queueStack: {
    display: "grid",
    gap: 10,
  },

  queueCard: {
    width: "100%",
    textAlign: "left",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: 16,
    padding: 14,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
  },

  queueCardActive: {
    border: "1px solid #1d4ed8",
    boxShadow: "0 0 0 3px rgba(29, 78, 216, 0.12)",
  },

  queueCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },

  queueLine: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
  },

  queueLineMuted: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
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

  mobileDataCardSelected: {
    border: "1px solid #1d4ed8",
    boxShadow: "0 0 0 3px rgba(29, 78, 216, 0.12)",
  },

  mobileDataCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
    flexWrap: "wrap",
  },

  mobileDataPrimary: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
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

  mobileActionStack: {
    display: "grid",
    gap: 8,
    marginTop: 12,
  },

  emptyState: {
    border: "1px dashed rgba(148, 163, 184, 0.55)",
    background: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
  },

  stickyActionBar: {
    position: "sticky",
    bottom: 0,
    display: "grid",
    gap: 8,
    padding: 12,
    background: "rgba(255,255,255,0.96)",
    borderTop: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: 16,
    boxShadow: "0 -8px 24px rgba(15, 23, 42, 0.08)",
  },

  actionButtonWide: {
    width: "100%",
    justifyContent: "center",
  },

  toggleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 10,
  },

  checkboxTile: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    background: "#ffffff",
    color: "#334155",
    fontSize: 13,
    fontWeight: 700,
  },

  tablePrimary: {
    fontSize: 13,
    fontWeight: 800,
    color: "#0f172a",
  },

  tableSecondary: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 1.4,
  },

  concernCell: {
    maxWidth: 260,
    whiteSpace: "normal",
    lineHeight: 1.5,
    color: "#334155",
  },

  concernCard: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 12,
    background: "#f8fafc",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    fontSize: 13,
    color: "#334155",
    lineHeight: 1.5,
  },

  registrySummary: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  logoutButtonCompact: {
    border: "none",
    background: "#dc2626",
    color: "#fff",
    borderRadius: 10,
    padding: "9px 12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  statNote: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 8,
  },

  summaryBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    padding: "12px 14px",
    borderRadius: 14,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  summaryPanel: {
    padding: 14,
    borderRadius: 16,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  summaryTile: {
    padding: 12,
    borderRadius: 14,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
  },

  summaryLabel: {
    fontSize: 12,
    fontWeight: 700,
    color: "#64748b",
    marginBottom: 6,
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: 800,
    color: "#0f172a",
    lineHeight: 1.4,
  },

  detailPanel: {
    padding: 16,
    borderRadius: 18,
    background: "#ffffff",
    border: "1px solid #dbe4f0",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  },

  detailBanner: {
    padding: 14,
    borderRadius: 16,
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },

  filterBar: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto auto",
    gap: 10,
    alignItems: "end",
  },

  twoColumnForm: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  },

  threeColumnForm: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
  },

  formGrid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
  },

  checkboxList: {
    display: "grid",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  checkboxCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    background: "#ffffff",
    border: "1px solid #dbe4f0",
    fontWeight: 600,
    color: "#334155",
  },

  mobileCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    background: "#ffffff",
    padding: 14,
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
  },

  mobileCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },

  mobileCardTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "#0f172a",
  },

  mobileCardSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },

  mobileCardMeta: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.6,
  },

  mobileCardNote: {
    marginTop: 8,
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.6,
    padding: "10px 12px",
    borderRadius: 12,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  mobileDataCardButton: {
    width: "100%",
    border: "1px solid #dbe4f0",
    borderRadius: 16,
    background: "#ffffff",
    padding: 12,
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },

  mobileDataCardButtonActive: {
    borderColor: "#93c5fd",
    background: "#eff6ff",
    boxShadow: "0 0 0 1px #bfdbfe inset",
  },

  partsMediaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 10,
  },

  partsMediaCard: {
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 14,
    padding: 10,
    background: "#ffffff",
  },

  partsMediaImage: {
    width: "100%",
    height: 110,
    objectFit: "cover",
    borderRadius: 10,
    border: "1px solid rgba(148, 163, 184, 0.2)",
    marginBottom: 8,
  },
};

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}


function readLocalStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeLocalStorage<T>(key: string, value: T) {
  localStorage.setItem(key, JSON.stringify(value));
}

function nextDailyNumber(prefix: string) {
  const stamp = todayStamp();
  const counters = readLocalStorage<Record<string, number>>(STORAGE_KEYS.counters, {});
  const key = `${prefix}_${stamp}`;
  const next = (counters[key] ?? 0) + 1;
  counters[key] = next;
  writeLocalStorage(STORAGE_KEYS.counters, counters);
  return `${prefix}-${stamp}-${String(next).padStart(3, "0")}`;
}


function formatElapsedTime(startValue?: string) {
  if (!startValue) return "Not started";
  const start = new Date(startValue);
  if (Number.isNaN(start.getTime())) return "Not started";
  const diffMs = Math.max(0, Date.now() - start.getTime());
  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h ${minutes}m`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

function formatMinutesAsHours(minutes: number) {
  if (!minutes || minutes <= 0) return "0.0h";
  return `${(minutes / 60).toFixed(1)}h`;
}

function getWorkLogMinutes(log: WorkLog) {
  if (log.endedAt) return Math.max(0, log.totalMinutes || 0);
  const started = new Date(log.startedAt).getTime();
  if (Number.isNaN(started)) return Math.max(0, log.totalMinutes || 0);
  return Math.max(0, Math.floor((Date.now() - started) / 60000));
}


function getROStatusStyle(status: ROStatus): React.CSSProperties {
  if (status === "Draft") return styles.statusNeutral;
  if (status === "Waiting Inspection" || status === "Waiting Approval") return styles.statusInfo;
  if (status === "Approved / Ready to Work" || status === "Ready Release" || status === "Released" || status === "Closed") return styles.statusOk;
  if (status === "Waiting Parts" || status === "Quality Check") return styles.statusWarning;
  return styles.statusInfo;
}

function getWorkLineStatusStyle(status: WorkLineStatus): React.CSSProperties {
  if (status === "Completed") return styles.statusOk;
  if (status === "Waiting Parts") return styles.statusWarning;
  if (status === "In Progress") return styles.statusInfo;
  return styles.statusNeutral;
}

function downloadTextFile(filename: string, content: string) {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function printTextDocument(title: string, content: string) {
  if (typeof window === "undefined") return;
  const popup = window.open("", "_blank", "width=900,height=700");
  if (!popup) return;
  const escapedTitle = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapedBody = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  popup.document.write(`
    <html>
      <head>
        <title>${escapedTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { font-size: 24px; margin-bottom: 16px; }
          pre { white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.5; font-size: 13px; }
        </style>
      </head>
      <body>
        <h1>${escapedTitle}</h1>
        <pre>${escapedBody}</pre>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
}

function buildQcExportText(ro: RepairOrderRecord, qc: QCRecord | null) {
  return [
    `QC Record for ${ro.roNumber}`,
    `RO Status: ${ro.status}`,
    `Customer: ${ro.accountLabel}`,
    `Plate: ${ro.plateNumber || ro.conductionNumber || "-"}`,
    `Vehicle: ${[ro.make, ro.model, ro.year].filter(Boolean).join(" ") || "-"}`,
    "",
    qc
      ? `Latest QC: ${qc.qcNumber} | ${qc.result} | ${formatDateTime(qc.createdAt)} | By: ${qc.qcBy}`
      : "Latest QC: No QC record yet",
    qc ? `Notes: ${qc.notes || "-"}` : "",
    "",
    "Approved Work Lines:",
    ro.workLines
      .filter((line) => line.approvalDecision === "Approved")
      .map((line, index) => `${index + 1}. ${line.title} | ${line.status} | ${formatCurrency(parseMoneyInput(line.totalEstimate))}`)
      .join("\n") || "No approved work lines.",
  ].join("\n");
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

function ROStatusBadge({ status }: { status: ROStatus }) {
  return <span style={getROStatusStyle(status)}>{status}</span>;
}

function QualityControlPage({
  currentUser,
  repairOrders,
  setRepairOrders,
  qcRecords,
  setQcRecords,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  repairOrders: RepairOrderRecord[];
  setRepairOrders: React.Dispatch<React.SetStateAction<RepairOrderRecord[]>>;
  qcRecords: QCRecord[];
  setQcRecords: React.Dispatch<React.SetStateAction<QCRecord[]>>;
  isCompactLayout: boolean;
}) {
  const canPerformQC = ["Admin", "Chief Technician", "Senior Mechanic"].includes(currentUser.role);

  const queue = useMemo(
    () =>
      [...repairOrders]
        .filter((row) => row.status === "Quality Check")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [repairOrders]
  );

  const [selectedRoId, setSelectedRoId] = useState("");
  const [checks, setChecks] = useState({
    allApprovedWorkCompleted: true,
    noLeaksOrWarningLights: true,
    roadTestDone: true,
    cleanlinessCheck: true,
    noNewDamage: true,
    toolsRemoved: true,
  });
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedRoId && queue[0]) {
      setSelectedRoId(queue[0].id);
    }
    if (selectedRoId && !queue.some((row) => row.id === selectedRoId)) {
      setSelectedRoId(queue[0]?.id ?? "");
    }
  }, [queue, selectedRoId]);

  const selectedRO = useMemo(
    () => queue.find((row) => row.id === selectedRoId) ?? null,
    [queue, selectedRoId]
  );

  const selectedApprovedLines = useMemo(
    () => (selectedRO ? selectedRO.workLines.filter((line) => (line.approvalDecision ?? "Pending") === "Approved") : []),
    [selectedRO]
  );

  const selectedCompletedApprovedCount = useMemo(
    () => selectedApprovedLines.filter((line) => line.status === "Completed").length,
    [selectedApprovedLines]
  );

  const selectedOutstandingApprovedCount = Math.max(selectedApprovedLines.length - selectedCompletedApprovedCount, 0);

  const latestQcForSelected = useMemo(
    () =>
      selectedRO
        ? [...qcRecords]
            .filter((row) => row.roId === selectedRO.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null
        : null,
    [qcRecords, selectedRO]
  );

  useEffect(() => {
    if (!selectedRO) return;
    setChecks({
      allApprovedWorkCompleted: selectedOutstandingApprovedCount === 0,
      noLeaksOrWarningLights: true,
      roadTestDone: true,
      cleanlinessCheck: true,
      noNewDamage: true,
      toolsRemoved: true,
    });
    setNotes("");
    setError("");
  }, [selectedRO?.id, selectedOutstandingApprovedCount]);

  const history = useMemo(
    () =>
      [...qcRecords]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10),
    [qcRecords]
  );

  const submitQC = (result: QCResult) => {
    if (!selectedRO || !canPerformQC) return;
    if (selectedRO.status !== "Quality Check") return;
    if (result === "Failed" && !notes.trim()) {
      setError("Failure notes are required when QC fails.");
      return;
    }
    if (result === "Passed" && (!checks.allApprovedWorkCompleted || !checks.noLeaksOrWarningLights || !checks.roadTestDone || !checks.cleanlinessCheck || !checks.noNewDamage || !checks.toolsRemoved)) {
      setError("All QC checklist items must pass before the job can move to Ready Release.");
      return;
    }

    const record: QCRecord = {
      id: uid("qc"),
      qcNumber: nextDailyNumber("QC"),
      roId: selectedRO.id,
      roNumber: selectedRO.roNumber,
      createdAt: new Date().toISOString(),
      qcBy: currentUser.fullName,
      result,
      allApprovedWorkCompleted: checks.allApprovedWorkCompleted,
      noLeaksOrWarningLights: checks.noLeaksOrWarningLights,
      roadTestDone: checks.roadTestDone,
      cleanlinessCheck: checks.cleanlinessCheck,
      noNewDamage: checks.noNewDamage,
      toolsRemoved: checks.toolsRemoved,
      notes: notes.trim(),
    };

    setQcRecords((prev) => [record, ...prev]);
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === selectedRO.id
          ? {
              ...row,
              status: result === "Passed" ? "Ready Release" : "In Progress",
              updatedAt: new Date().toISOString(),
            }
          : row
      )
    );
    setChecks({
      allApprovedWorkCompleted: true,
      noLeaksOrWarningLights: true,
      roadTestDone: true,
      cleanlinessCheck: true,
      noNewDamage: true,
      toolsRemoved: true,
    });
    setNotes("");
    setError("");
  };

  const checklistItems: Array<{ key: keyof typeof checks; label: string }> = [
    { key: "allApprovedWorkCompleted", label: "All approved work completed" },
    { key: "noLeaksOrWarningLights", label: "No leaks, errors, or warning lights" },
    { key: "roadTestDone", label: "Road test done if applicable" },
    { key: "cleanlinessCheck", label: "Cleanliness check passed" },
    { key: "noNewDamage", label: "No new damage found" },
    { key: "toolsRemoved", label: "Tools removed and secured" },
  ];

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }}>
          <Card
            title="QC Queue"
            subtitle="Only jobs already moved to Quality Check"
            right={<span style={styles.statusWarning}>{queue.length} waiting</span>}
          >
            {!queue.length ? (
              <div style={styles.emptyState}>No repair orders are waiting for QC.</div>
            ) : (
              <div style={styles.mobileCardList}>
                {queue.map((row) => {
                  const active = row.id === selectedRoId;
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => setSelectedRoId(row.id)}
                      style={{
                        ...styles.mobileCard,
                        textAlign: "left",
                        borderColor: active ? "#2563eb" : "#e5e7eb",
                        background: active ? "#eff6ff" : "#ffffff",
                      }}
                    >
                      <div style={styles.mobileCardHeader}>
                        <div>
                          <div style={styles.mobileCardTitle}>{row.roNumber}</div>
                          <div style={styles.mobileCardSubtitle}>
                            {row.plateNumber || row.conductionNumber || "No plate"}
                          </div>
                        </div>
                        <span style={getROStatusStyle(row.status)}>{row.status}</span>
                      </div>
                      <div style={styles.mobileCardMeta}>
                        <strong>{row.accountLabel}</strong>
                      </div>
                      <div style={styles.mobileCardMeta}>
                        {row.make} {row.model} {row.year}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(8, isCompactLayout) }}>
          <Card
            title="QC Form"
            subtitle="Chief Technician / Senior Mechanic gate before release"
            right={
              selectedRO ? (
                <div style={styles.inlineActions}>
                  <button
                    type="button"
                    style={styles.smallButtonMuted}
                    onClick={() => printTextDocument(`QC ${selectedRO.roNumber}`, buildQcExportText(selectedRO, latestQcForSelected))}
                  >
                    Print QC
                  </button>
                  <button
                    type="button"
                    style={styles.smallButton}
                    onClick={() => downloadTextFile(`${selectedRO.roNumber}_qc.txt`, buildQcExportText(selectedRO, latestQcForSelected))}
                  >
                    Export QC
                  </button>
                  {canPerformQC ? <span style={styles.statusOk}>QC Allowed</span> : <span style={styles.statusLocked}>QC Locked</span>}
                </div>
              ) : canPerformQC ? (
                <span style={styles.statusOk}>QC Allowed</span>
              ) : (
                <span style={styles.statusLocked}>QC Locked</span>
              )
            }
          >
            {!selectedRO ? (
              <div style={styles.emptyState}>Select a repair order from the QC queue.</div>
            ) : (
              <div style={styles.formStack}>
                <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                  <div style={styles.summaryTile}>
                    <div style={styles.summaryLabel}>RO Number</div>
                    <div style={styles.summaryValue}>{selectedRO.roNumber}</div>
                  </div>
                  <div style={styles.summaryTile}>
                    <div style={styles.summaryLabel}>Vehicle</div>
                    <div style={styles.summaryValue}>{selectedRO.plateNumber || selectedRO.conductionNumber || "-"}</div>
                  </div>
                  <div style={styles.summaryTile}>
                    <div style={styles.summaryLabel}>Customer</div>
                    <div style={styles.summaryValue}>{selectedRO.accountLabel}</div>
                  </div>
                </div>
                <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                  <div style={styles.summaryTile}>
                    <div style={styles.summaryLabel}>RO Created</div>
                    <div style={styles.summaryValue}>{formatDateTime(selectedRO.createdAt)}</div>
                  </div>
                  <div style={styles.summaryTile}>
                    <div style={styles.summaryLabel}>Encoded By</div>
                    <div style={styles.summaryValue}>{selectedRO.encodedBy || "-"}</div>
                  </div>
                  {selectedRO.updatedBy ? (
                    <div style={styles.summaryTile}>
                      <div style={styles.summaryLabel}>Last Updated By</div>
                      <div style={styles.summaryValue}>{selectedRO.updatedBy}</div>
                    </div>
                  ) : <div style={styles.summaryTile} />}
                </div>

                <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                  <div style={styles.summaryTile}>
                    <div style={styles.summaryLabel}>Approved Lines</div>
                    <div style={styles.summaryValue}>{selectedApprovedLines.length}</div>
                  </div>
                  <div style={styles.summaryTile}>
                    <div style={styles.summaryLabel}>Completed Approved</div>
                    <div style={styles.summaryValue}>{selectedCompletedApprovedCount}</div>
                  </div>
                  <div style={styles.summaryTile}>
                    <div style={styles.summaryLabel}>Outstanding</div>
                    <div style={styles.summaryValue}>{selectedOutstandingApprovedCount}</div>
                  </div>
                </div>

                {latestQcForSelected ? (
                  <div style={styles.quickAccessRow}>
                    <span>Latest QC Result</span>
                    <strong>{latestQcForSelected.qcNumber} • {latestQcForSelected.result} • {formatDateTime(latestQcForSelected.createdAt)}</strong>
                  </div>
                ) : (
                  <div style={styles.quickAccessRow}>
                    <span>Latest QC Result</span>
                    <strong>No prior QC record yet</strong>
                  </div>
                )}

                <div style={styles.formStack}>
                  {checklistItems.map((item) => (
                    <label key={item.key} style={styles.checkboxCard}>
                      <input
                        type="checkbox"
                        checked={checks[item.key]}
                        disabled={!canPerformQC}
                        onChange={(e) => setChecks((prev) => ({ ...prev, [item.key]: e.target.checked }))}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>QC Notes</label>
                  <textarea
                    style={{ ...styles.textarea, minHeight: 120 }}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    disabled={!canPerformQC}
                    placeholder="Enter findings. Required when QC fails."
                  />
                </div>

                {error ? <div style={styles.errorBox}>{error}</div> : null}

                <div style={isCompactLayout ? styles.stickyActionBar : styles.inlineActions}>
                  <button
                    type="button"
                    style={{ ...styles.smallButtonDanger, ...(isCompactLayout ? styles.actionButtonWide : {}) }}
                    disabled={!canPerformQC}
                    onClick={() => submitQC("Failed")}
                  >
                    Fail QC
                  </button>
                  <button
                    type="button"
                    style={{ ...styles.smallButtonSuccess, ...(isCompactLayout ? styles.actionButtonWide : {}) }}
                    disabled={!canPerformQC}
                    onClick={() => submitQC("Passed")}
                  >
                    Pass QC
                  </button>
                </div>
              </div>
            )}
          </Card>

          <div style={{ marginTop: 16 }}>
            <Card title="Recent QC History" subtitle="Latest QC results">
              {!history.length ? (
                <div style={styles.emptyState}>No QC history yet.</div>
              ) : isCompactLayout ? (
                <div style={styles.mobileCardList}>
                  {history.map((row) => (
                    <div key={row.id} style={styles.mobileCard}>
                      <div style={styles.mobileCardHeader}>
                        <div>
                          <div style={styles.mobileCardTitle}>{row.qcNumber}</div>
                          <div style={styles.mobileCardSubtitle}>{row.roNumber}</div>
                        </div>
                        <span style={row.result === "Passed" ? styles.statusOk : styles.statusLocked}>{row.result}</span>
                      </div>
                      <div style={styles.mobileCardMeta}>By: {row.qcBy}</div>
                      <div style={styles.mobileCardMeta}>{formatDateTime(row.createdAt)}</div>
                      {row.notes ? <div style={styles.mobileCardNote}>{row.notes}</div> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>QC No.</th>
                        <th style={styles.th}>RO</th>
                        <th style={styles.th}>Result</th>
                        <th style={styles.th}>By</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((row) => (
                        <tr key={row.id}>
                          <td style={styles.td}>{row.qcNumber}</td>
                          <td style={styles.td}>{row.roNumber}</td>
                          <td style={styles.td}>
                            <span style={row.result === "Passed" ? styles.statusOk : styles.statusLocked}>{row.result}</span>
                          </td>
                          <td style={styles.td}>{row.qcBy}</td>
                          <td style={styles.td}>{formatDateTime(row.createdAt)}</td>
                          <td style={styles.td}>{row.notes || "-"}</td>
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
    </div>
  );
}

export default QualityControlPage;
