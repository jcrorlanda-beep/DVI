import React from "react";
import { BackToListButton } from "./BackToListButton";

type Props = {
  listSlot: React.ReactNode;
  detailSlot: React.ReactNode;
  detailTestId?: string;
  onBack?: () => void;
  backLabel?: string;
  isCompactLayout?: boolean;
};

export function DetailPageShell({
  listSlot,
  detailSlot,
  detailTestId,
  onBack,
  backLabel,
  isCompactLayout,
}: Props) {
  return (
    <div style={styles.wrapper}>
      <div style={styles.listCol}>{listSlot}</div>
      <div style={styles.detailCol}>
        {onBack ? (
          <div style={styles.backRow}>
            <BackToListButton onClick={onBack} label={backLabel} />
          </div>
        ) : null}
        <div data-testid={detailTestId} style={isCompactLayout ? styles.detailPanelCompact : styles.detailPanel}>
          {detailSlot}
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: {
    display: "grid",
    gridTemplateColumns: "340px 1fr",
    gap: 16,
    alignItems: "flex-start",
    width: "100%",
  },
  listCol: {
    minWidth: 0,
  },
  detailCol: {
    minWidth: 0,
  },
  backRow: {
    marginBottom: 10,
  },
  detailPanel: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.98) 100%)",
    border: "1px solid rgba(29,78,216,0.13)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 8px 28px rgba(5,11,29,0.10)",
    minHeight: 320,
  },
  detailPanelCompact: {
    background: "#fff",
    border: "1px solid rgba(148,163,184,0.22)",
    borderRadius: 16,
    padding: 14,
    minHeight: 200,
  },
};
