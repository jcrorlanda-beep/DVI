import React from "react";
import { BOOKING_MULTI_SERVICE_OPTIONS } from "./bookingMultiService";

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  label?: string;
  helperText?: string;
  dataTestIdPrefix?: string;
};

function slug(value: string) {
  return value.replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
}

export function BookingServiceSelection({ value, onChange, label = "Requested Services", helperText = "Select one or more services for this booking.", dataTestIdPrefix = "booking-service" }: Props) {
  const selected = new Set(value);

  const toggle = (option: string) => {
    const next = new Set(selected);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    onChange(Array.from(next));
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.header}>
        <div style={styles.label}>{label}</div>
        <div style={styles.helper}>{helperText}</div>
      </div>
      <div style={styles.chipGrid}>
        {BOOKING_MULTI_SERVICE_OPTIONS.map((option) => {
          const active = selected.has(option);
          return (
            <button
              key={option}
              type="button"
              data-testid={`${dataTestIdPrefix}-chip-${slug(option)}`}
              aria-pressed={active}
              onClick={() => toggle(option)}
              style={{
                ...styles.chip,
                ...(active ? styles.chipActive : {}),
              }}
            >
              {option}
            </button>
          );
        })}
      </div>
      <div style={styles.summary}>
        {value.length > 0 ? `Selected: ${value.join(", ")}` : "No additional service selected yet."}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrapper: { display: "grid", gap: 8 },
  header: { display: "grid", gap: 4 },
  label: { fontSize: 13, fontWeight: 800, color: "#334155", textTransform: "uppercase" },
  helper: { fontSize: 12, color: "#64748b", lineHeight: 1.4 },
  chipGrid: { display: "flex", flexWrap: "wrap", gap: 8 },
  chip: {
    border: "1px solid rgba(148, 163, 184, 0.42)",
    borderRadius: 999,
    padding: "8px 12px",
    background: "#fff",
    color: "#0f172a",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  },
  chipActive: {
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    borderColor: "#1d4ed8",
    boxShadow: "0 8px 18px rgba(37, 99, 235, 0.16)",
  },
  summary: { fontSize: 12, color: "#475569", lineHeight: 1.4 },
};
