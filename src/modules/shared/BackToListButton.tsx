import React from "react";

type Props = {
  onClick: () => void;
  label?: string;
  testId?: string;
};

export function BackToListButton({ onClick, label = "Back to list", testId = "back-to-list-button" }: Props) {
  return (
    <button type="button" data-testid={testId} onClick={onClick} style={styles.button}>
      {label}
    </button>
  );
}

const styles: Record<string, React.CSSProperties> = {
  button: {
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    borderRadius: 999,
    padding: "8px 12px",
    fontSize: 12,
    fontWeight: 800,
    cursor: "pointer",
  },
};
