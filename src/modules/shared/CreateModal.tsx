import React from "react";

type CreateModalProps = {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  actions?: React.ReactNode;
  testId?: string;
};

export function CreateModal({ open, title, subtitle, onClose, children, actions, testId }: CreateModalProps) {
  if (!open) return null;

  return (
    <div
      data-testid={testId}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={styles.overlay}
    >
      <button type="button" aria-label="Close modal" style={styles.backdrop} onClick={onClose} />
      <div style={styles.panel}>
        <div style={styles.header}>
          <div>
            <div style={styles.title}>{title}</div>
            {subtitle ? <div style={styles.subtitle}>{subtitle}</div> : null}
          </div>
          <div style={styles.headerActions}>
            {actions}
            <button type="button" style={styles.closeButton} onClick={onClose}>
              Close
            </button>
          </div>
        </div>
        <div style={styles.body}>{children}</div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed",
    inset: 0,
    zIndex: 80,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  backdrop: {
    position: "absolute",
    inset: 0,
    border: "none",
    background: "rgba(15, 23, 42, 0.58)",
    cursor: "pointer",
  },
  panel: {
    position: "relative",
    width: "min(1180px, 100%)",
    maxHeight: "92vh",
    overflow: "auto",
    background: "#fff",
    borderRadius: 18,
    border: "1px solid rgba(148,163,184,0.24)",
    boxShadow: "0 30px 80px rgba(15, 23, 42, 0.35)",
    padding: 18,
  },
  header: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 800,
    color: "#0f172a",
  },
  subtitle: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.5,
  },
  headerActions: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  closeButton: {
    border: "1px solid rgba(148,163,184,0.4)",
    background: "#fff",
    color: "#0f172a",
    borderRadius: 10,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  body: {
    minHeight: 0,
  },
};

export default CreateModal;
