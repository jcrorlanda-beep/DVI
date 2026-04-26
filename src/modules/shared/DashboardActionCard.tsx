import React from "react";

type Props = {
  label: string;
  value: string | number;
  sub?: string;
  onClick?: () => void;
  accent?: "blue" | "amber" | "green" | "red" | "purple";
  testId?: string;
};

const ACCENTS: Record<string, { bg: string; color: string; border: string }> = {
  blue:   { bg: "#dbeafe", color: "#1d4ed8", border: "rgba(37,99,235,0.2)" },
  amber:  { bg: "#fef3c7", color: "#92400e", border: "rgba(245,158,11,0.2)" },
  green:  { bg: "#dcfce7", color: "#166534", border: "rgba(22,163,74,0.2)" },
  red:    { bg: "#fee2e2", color: "#991b1b", border: "rgba(220,38,38,0.2)" },
  purple: { bg: "#ede9fe", color: "#6d28d9", border: "rgba(109,40,217,0.2)" },
};

export function DashboardActionCard({ label, value, sub, onClick, accent = "blue", testId }: Props) {
  const a = ACCENTS[accent] ?? ACCENTS.blue;
  return (
    <button
      type="button"
      data-testid={testId}
      onClick={onClick}
      disabled={!onClick}
      style={{
        ...styles.card,
        background: a.bg,
        border: `1px solid ${a.border}`,
        cursor: onClick ? "pointer" : "default",
      }}
    >
      <div style={{ ...styles.value, color: a.color }}>{value}</div>
      <div style={{ ...styles.label, color: a.color }}>{label}</div>
      {sub ? <div style={styles.sub}>{sub}</div> : null}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    borderRadius: 14,
    padding: "14px 16px",
    textAlign: "left",
    width: "100%",
    outline: "none",
  },
  value: {
    fontSize: 26,
    fontWeight: 800,
    lineHeight: 1.1,
  },
  label: {
    fontSize: 13,
    fontWeight: 700,
    marginTop: 4,
  },
  sub: {
    fontSize: 11,
    color: "#64748b",
    marginTop: 4,
  },
};
