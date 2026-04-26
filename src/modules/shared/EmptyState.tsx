import React from "react";

type Props = {
  message?: string;
  hint?: string;
  testId?: string;
};

export function EmptyState({ message = "Nothing here yet.", hint, testId }: Props) {
  return (
    <div data-testid={testId} style={styles.container}>
      <div style={styles.message}>{message}</div>
      {hint ? <div style={styles.hint}>{hint}</div> : null}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    border: "1px dashed rgba(148, 163, 184, 0.55)",
    background: "#f8fafc",
    borderRadius: 16,
    padding: 24,
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
  },
  message: {
    fontWeight: 600,
    color: "#475569",
    marginBottom: 4,
  },
  hint: {
    fontSize: 12,
    color: "#94a3b8",
    lineHeight: 1.5,
  },
};
