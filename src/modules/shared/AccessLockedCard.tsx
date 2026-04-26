import React from "react";

const styles: Record<string, React.CSSProperties> = {
  card: {
    background: "var(--locked-card-bg, #fff)",
    border: "1px solid var(--locked-card-border, #e2e8f0)",
    borderRadius: 8,
    padding: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    color: "var(--locked-card-title, #0f172a)",
  },
  subtitle: {
    fontSize: 12,
    color: "var(--locked-card-subtitle, #64748b)",
    marginTop: 4,
  },
  badge: {
    display: "inline-block",
    marginTop: 10,
    padding: "3px 8px",
    borderRadius: 999,
    background: "#fee2e2",
    color: "#991b1b",
    fontSize: 11,
    fontWeight: 600,
  },
};

export function AccessLockedCard({
  title,
  subtitle,
  note = "Access blocked for the current role.",
}: {
  title: string;
  subtitle?: string;
  note?: string;
}) {
  return (
    <div style={styles.card}>
      <div style={styles.title}>{title}</div>
      {subtitle ? <div style={styles.subtitle}>{subtitle}</div> : null}
      <div style={styles.badge}>{note}</div>
    </div>
  );
}

