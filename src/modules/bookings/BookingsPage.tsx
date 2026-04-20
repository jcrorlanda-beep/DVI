import React, { useMemo, useState } from "react";
import type {
  SessionUser,
  IntakeRecord,
  VehicleAccountType,
} from "../shared/types";
import { getResponsiveSpan } from "../shared/helpers";

// ─── Booking-specific types ────────────────────────────────────────────────

type BookingStatus =
  | "New"
  | "Confirmed"
  | "Arrived"
  | "No Show"
  | "Rescheduled"
  | "Cancelled"
  | "Converted to Intake";

type BookingServiceType =
  | "Preventive Maintenance"
  | "Oil Change"
  | "Brake Service"
  | "Suspension / Steering"
  | "Wheel Alignment"
  | "Tire Service"
  | "Air Conditioning"
  | "Cooling System"
  | "Electrical / Battery"
  | "Transmission / Drivetrain"
  | "Engine Performance"
  | "Underchassis Check"
  | "OBD Scan / Computer Diagnosis"
  | "Backjob / Comeback"
  | "Follow-up";

type BookingServiceDetail = string;

type BookingRecord = {
  id: string;
  bookingNumber: string;
  createdAt: string;
  updatedAt: string;
  requestedDate: string;
  requestedTime: string;
  customerName: string;
  companyName: string;
  accountType: VehicleAccountType;
  phone: string;
  email: string;
  plateNumber: string;
  conductionNumber: string;
  make: string;
  model: string;
  year: string;
  serviceType: BookingServiceType;
  serviceDetail: BookingServiceDetail;
  concern: string;
  notes: string;
  status: BookingStatus;
  source: "Staff" | "Customer Portal";
  createdBy: string;
  linkedCustomerId?: string;
  convertedIntakeId?: string;
};

type BookingForm = {
  requestedDate: string;
  requestedTime: string;
  customerName: string;
  companyName: string;
  accountType: VehicleAccountType;
  phone: string;
  email: string;
  plateNumber: string;
  conductionNumber: string;
  make: string;
  model: string;
  year: string;
  serviceType: BookingServiceType;
  serviceDetail: BookingServiceDetail;
  concern: string;
  notes: string;
  status: BookingStatus;
};

// ─── Local constants ────────────────────────────────────────────────────────

const STORAGE_KEY_BOOKINGS = "dvi_phase17d_bookings_v1";
const STORAGE_KEY_BOOKING_DRAFT = "dvi_phase17i_booking_draft_v1";
const STORAGE_KEY_COUNTERS = "dvi_phase2_counters_v1";

const BOOKING_SERVICE_OPTIONS: BookingServiceType[] = [
  "Preventive Maintenance",
  "Oil Change",
  "Brake Service",
  "Suspension / Steering",
  "Wheel Alignment",
  "Tire Service",
  "Air Conditioning",
  "Cooling System",
  "Electrical / Battery",
  "Transmission / Drivetrain",
  "Engine Performance",
  "Underchassis Check",
  "OBD Scan / Computer Diagnosis",
  "Backjob / Comeback",
  "Follow-up",
];

const BOOKING_SERVICE_DETAIL_OPTIONS: Record<BookingServiceType, string[]> = {
  "Preventive Maintenance": [
    "5,000 km maintenance",
    "10,000 km maintenance",
    "20,000 km maintenance",
    "General maintenance check",
    "Periodic maintenance service",
    "Other / Describe in notes",
  ],
  "Oil Change": [
    "Oil only",
    "Oil and filter",
    "Fully synthetic",
    "Semi-synthetic",
    "Mineral oil",
    "Other / Describe in notes",
  ],
  "Brake Service": [
    "Brake inspection",
    "Brake cleaning",
    "Brake pad replacement",
    "Brake shoe replacement",
    "Rotor resurfacing",
    "Other / Describe in notes",
  ],
  "Suspension / Steering": [
    "Underchassis noise check",
    "Shock absorber check",
    "Ball joint check",
    "Tie rod end check",
    "Steering rack inspection",
    "Other / Describe in notes",
  ],
  "Wheel Alignment": [
    "Front wheel alignment",
    "Four-wheel alignment",
    "Steering pull correction",
    "Uneven tire wear check",
    "Post-suspension alignment",
    "Other / Describe in notes",
  ],
  "Tire Service": [
    "Tire replacement",
    "Tire rotation",
    "Tire balancing",
    "Flat tire repair",
    "Nitrogen refill",
    "Other / Describe in notes",
  ],
  "Air Conditioning": [
    "A/C check-up",
    "Not cold",
    "A/C cleaning",
    "Compressor inspection",
    "Blower issue",
    "Other / Describe in notes",
  ],
  "Cooling System": [
    "Overheating check",
    "Coolant leak check",
    "Radiator cleaning",
    "Water pump inspection",
    "Thermostat inspection",
    "Other / Describe in notes",
  ],
  "Electrical / Battery": [
    "Battery replacement",
    "Charging system check",
    "Starter issue",
    "Alternator check",
    "Lights / wiring issue",
    "Other / Describe in notes",
  ],
  "Transmission / Drivetrain": [
    "Hard shifting",
    "Transmission fluid service",
    "Clutch concern",
    "Vibration check",
    "Drive axle / CV joint check",
    "Other / Describe in notes",
  ],
  "Engine Performance": [
    "Rough idle",
    "Loss of power",
    "Misfire concern",
    "Smoke check",
    "Engine performance diagnosis",
    "Other / Describe in notes",
  ],
  "Underchassis Check": [
    "Full underchassis inspection",
    "Noise underchassis",
    "Suspension play check",
    "Leak inspection underneath",
    "Visual underchassis check",
    "Other / Describe in notes",
  ],
  "OBD Scan / Computer Diagnosis": [
    "Check engine light",
    "Warning light diagnosis",
    "Pre-repair scan",
    "Full system scan",
    "Computer diagnostic test",
    "Other / Describe in notes",
  ],
  "Backjob / Comeback": [
    "Return visit",
    "Same issue unresolved",
    "New issue after repair",
    "Warranty claim",
    "Backjob verification",
    "Other / Describe in notes",
  ],
  "Follow-up": [
    "Post-repair follow-up",
    "Maintenance follow-up",
    "Recheck after recommendation",
    "Monitoring visit",
    "Customer requested follow-up",
    "Other / Describe in notes",
  ],
};

// ─── Local helpers ───────────────────────────────────────────────────────────

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

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function todayStamp(date = new Date()) {
  const yyyy = date.getFullYear().toString();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}

function nextDailyNumber(prefix: string) {
  const stamp = todayStamp();
  const counters = readLocalStorage<Record<string, number>>(STORAGE_KEY_COUNTERS, {});
  const key = `${prefix}_${stamp}`;
  const next = (counters[key] ?? 0) + 1;
  counters[key] = next;
  writeLocalStorage(STORAGE_KEY_COUNTERS, counters);
  return `${prefix}-${stamp}-${String(next).padStart(3, "0")}`;
}

function normalizeVehicleKey(plateNumber: string, conductionNumber: string) {
  const normalizedPlate = (plateNumber || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  const normalizedConduction = (conductionNumber || "").replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return normalizedPlate || normalizedConduction || "";
}

function hasNonEmptyValues(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some((item) => hasNonEmptyValues(item));
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some((item) => hasNonEmptyValues(item));
  return false;
}

type DraftSaveState = "Unsaved changes" | "Saving..." | "Saved";

function useDraftAutosave<T>(key: string, value: T, enabled = true) {
  const [draftState, setDraftState] = useState<DraftSaveState>("Saved");

  React.useEffect(() => {
    if (!enabled) return;
    setDraftState("Saving...");
    const timeout = window.setTimeout(() => {
      writeLocalStorage(key, value);
      setDraftState("Saved");
    }, 400);
    return () => window.clearTimeout(timeout);
  }, [key, value, enabled]);

  const clearDraft = () => {
    localStorage.removeItem(key);
    setDraftState("Saved");
  };

  const markUnsaved = () => setDraftState("Unsaved changes");

  return { draftState, clearDraft, markUnsaved };
}

function getBookingServiceDetailOptions(serviceType: BookingServiceType) {
  return BOOKING_SERVICE_DETAIL_OPTIONS[serviceType] ?? ["Other / Describe in notes"];
}

function getDefaultBookingForm(currentUserName: string): BookingForm {
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");
  return {
    requestedDate: `${yyyy}-${mm}-${dd}`,
    requestedTime: "09:00",
    customerName: "",
    companyName: "",
    accountType: "Personal",
    phone: "",
    email: "",
    plateNumber: "",
    conductionNumber: "",
    make: "",
    model: "",
    year: "",
    serviceType: "Preventive Maintenance",
    serviceDetail: "5,000 km maintenance",
    concern: "",
    notes: "",
    status: "New",
  };
}

function getBookingStatusStyle(status: BookingStatus): React.CSSProperties {
  if (status === "Converted to Intake") return styles.statusOk;
  if (status === "Cancelled" || status === "No Show") return styles.statusLocked;
  if (status === "Arrived" || status === "Confirmed" || status === "Rescheduled") return styles.statusWarning;
  return styles.statusInfo;
}

// ─── Sub-components ──────────────────────────────────────────────────────────

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

// ─── Component ───────────────────────────────────────────────────────────────

function BookingsPage({
  currentUser,
  bookings,
  setBookings,
  intakeRecords,
  setIntakeRecords,
  inspectionRecords,
  setInspectionRecords,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  bookings: BookingRecord[];
  setBookings: React.Dispatch<React.SetStateAction<BookingRecord[]>>;
  intakeRecords: IntakeRecord[];
  setIntakeRecords: React.Dispatch<React.SetStateAction<IntakeRecord[]>>;
  // InspectionRecord is a large type not yet in shared/types — typed as any[] for now
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  inspectionRecords: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  setInspectionRecords: React.Dispatch<React.SetStateAction<any[]>>;
  isCompactLayout: boolean;
}) {
  const bookingDraftInitial = readLocalStorage<BookingForm | null>(STORAGE_KEY_BOOKING_DRAFT, null);
  const [form, setForm] = useState<BookingForm>(() => bookingDraftInitial ? { ...getDefaultBookingForm(currentUser.fullName), ...bookingDraftInitial } : getDefaultBookingForm(currentUser.fullName));
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [showDraftRestore, setShowDraftRestore] = useState(() => !!bookingDraftInitial);
  const bookingDraft = useDraftAutosave(STORAGE_KEY_BOOKING_DRAFT, form, hasNonEmptyValues(form));

  const filteredBookings = useMemo(() => {
    const term = search.trim().toLowerCase();
    return bookings
      .filter((row) =>
        !term
          ? true
          : [
              row.bookingNumber,
              row.customerName,
              row.companyName,
              row.phone,
              row.email,
              row.plateNumber,
              row.conductionNumber,
              row.make,
              row.model,
              row.serviceType,
              row.serviceDetail,
              row.concern,
              row.status,
            ]
              .join(" ")
              .toLowerCase()
              .includes(term)
      )
      .sort((a, b) => (b.requestedDate + b.requestedTime).localeCompare(a.requestedDate + a.requestedTime));
  }, [bookings, search]);

  const resetForm = () => {
    setForm(getDefaultBookingForm(currentUser.fullName));
    setError("");
    bookingDraft.clearDraft();
    setShowDraftRestore(false);
  };

  const handleServiceTypeChange = (value: BookingServiceType) => {
    const nextDetail = getBookingServiceDetailOptions(value)[0] ?? "Other / Describe in notes";
    setForm((prev) => ({ ...prev, serviceType: value, serviceDetail: nextDetail as BookingServiceDetail }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customerName = form.customerName.trim();
    const companyName = form.companyName.trim();
    const concern = form.concern.trim();
    const plateNumber = form.plateNumber.trim().toUpperCase();
    const conductionNumber = form.conductionNumber.trim().toUpperCase();

    if (!customerName && !companyName) {
      setError("Customer or company name is required.");
      return;
    }
    if (!plateNumber && !conductionNumber) {
      setError("Plate number or conduction number is required.");
      return;
    }
    if (!concern) {
      setError("Concern is required.");
      return;
    }

    const record: BookingRecord = {
      id: uid("bkg"),
      bookingNumber: nextDailyNumber("BKG"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requestedDate: form.requestedDate,
      requestedTime: form.requestedTime,
      customerName,
      companyName: companyName.trim(),
      accountType: form.accountType,
      phone: form.phone.trim(),
      email: form.email.trim(),
      plateNumber,
      conductionNumber,
      make: form.make.trim(),
      model: form.model.trim(),
      year: form.year.trim(),
      serviceType: form.serviceType,
      serviceDetail: form.serviceDetail,
      concern,
      notes: form.notes.trim(),
      status: form.status,
      source: "Staff",
      createdBy: currentUser.fullName,
    };

    setBookings((prev) => [record, ...prev]);
    bookingDraft.clearDraft();
    setShowDraftRestore(false);
    setError("");
    setForm(getDefaultBookingForm(currentUser.fullName));
  };

  const updateBookingStatus = (bookingId: string, status: BookingStatus) => {
    setBookings((prev) =>
      prev.map((row) => (row.id === bookingId ? { ...row, status, updatedAt: new Date().toISOString() } : row))
    );
  };

  const convertBookingToIntake = (booking: BookingRecord) => {
    const existingInspection = inspectionRecords.find(
      (row) => normalizeVehicleKey(row.plateNumber, row.conductionNumber) === normalizeVehicleKey(booking.plateNumber, booking.conductionNumber)
    );
    const intakeId = uid("intake");
    const newIntake: IntakeRecord = {
      id: intakeId,
      intakeNumber: nextDailyNumber("INT"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      customerName: booking.customerName,
      companyName: booking.companyName,
      accountType: booking.accountType,
      phone: booking.phone,
      email: booking.email,
      plateNumber: booking.plateNumber,
      conductionNumber: booking.conductionNumber,
      make: booking.make,
      model: booking.model,
      year: booking.year,
      color: "",
      odometerKm: "",
      fuelLevel: "",
      assignedAdvisor: currentUser.fullName,
      concern: `${booking.serviceType} — ${booking.serviceDetail}: ${booking.concern}`,
      notes: booking.notes,
      status: "Waiting Inspection",
      encodedBy: currentUser.fullName,
    };
    setIntakeRecords((prev) => [newIntake, ...prev]);

    if (!existingInspection) {
      const draftInspection = {
        id: uid("insp"),
        inspectionNumber: nextDailyNumber("INSP"),
        intakeId,
        intakeNumber: newIntake.intakeNumber,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        startedBy: currentUser.fullName,
        status: "In Progress",
        accountLabel: newIntake.companyName || newIntake.customerName,
        plateNumber: newIntake.plateNumber,
        conductionNumber: newIntake.conductionNumber,
        make: newIntake.make,
        model: newIntake.model,
        year: newIntake.year,
        color: newIntake.color,
        odometerKm: newIntake.odometerKm,
        concern: newIntake.concern,
      };
      setInspectionRecords((prev) => [draftInspection, ...prev]);
    }

    updateBookingStatus(booking.id, "Converted to Intake");
    setBookings((prev) =>
      prev.map((row) => (row.id === booking.id ? { ...row, convertedIntakeId: intakeId, updatedAt: new Date().toISOString() } : row))
    );
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }}>
          <Card title="New Booking" subtitle="Create, confirm, and convert bookings into intake records" right={<span style={styles.statusInfo}>Front Desk Ready</span>}>
            <form onSubmit={handleSubmit} style={styles.formStack}>
              {showDraftRestore ? (
                <div style={styles.sectionCardMuted}>
                  <div style={styles.mobileDataCardHeader}>
                    <div>
                      <div style={styles.sectionTitle}>Draft Recovery</div>
                      <div style={styles.formHint}>A booking draft was recovered automatically from your last unfinished work.</div>
                    </div>
                    <span style={styles.statusWarning}>Recovered</span>
                  </div>
                  <div style={styles.inlineActions}>
                    <button type="button" style={styles.smallButtonMuted} onClick={() => setShowDraftRestore(false)}>Keep Draft</button>
                    <button type="button" style={styles.smallButtonDanger} onClick={resetForm}>Discard Draft</button>
                  </div>
                </div>
              ) : null}
              <div style={styles.quickAccessRow}>
                <span>Draft Status</span>
                <strong>{bookingDraft.draftState}</strong>
              </div>
              <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Requested Date</label>
                  <input style={styles.input} type="date" value={form.requestedDate} onChange={(e) => setForm((prev) => ({ ...prev, requestedDate: e.target.value }))} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Requested Time</label>
                  <input style={styles.input} type="time" value={form.requestedTime} onChange={(e) => setForm((prev) => ({ ...prev, requestedTime: e.target.value }))} />
                </div>
              </div>

              <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Customer Name</label>
                  <input style={styles.input} value={form.customerName} onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Company / Fleet</label>
                  <input style={styles.input} value={form.companyName} onChange={(e) => setForm((prev) => ({ ...prev, companyName: e.target.value }))} />
                </div>
              </div>

              <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone</label>
                  <input style={styles.input} value={form.phone} onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input style={styles.input} value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} />
                </div>
              </div>

              <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Plate Number</label>
                  <input style={styles.input} value={form.plateNumber} onChange={(e) => setForm((prev) => ({ ...prev, plateNumber: e.target.value }))} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Conduction Number</label>
                  <input style={styles.input} value={form.conductionNumber} onChange={(e) => setForm((prev) => ({ ...prev, conductionNumber: e.target.value }))} />
                </div>
              </div>

              <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Make</label>
                  <input style={styles.input} value={form.make} onChange={(e) => setForm((prev) => ({ ...prev, make: e.target.value }))} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Model</label>
                  <input style={styles.input} value={form.model} onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Year</label>
                  <input style={styles.input} value={form.year} onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))} />
                </div>
              </div>

              <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Service Type</label>
                  <select style={styles.select} value={form.serviceType} onChange={(e) => handleServiceTypeChange(e.target.value as BookingServiceType)}>
                    {BOOKING_SERVICE_OPTIONS.map((type) => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Service Detail</label>
                  <select style={styles.select} value={form.serviceDetail} onChange={(e) => setForm((prev) => ({ ...prev, serviceDetail: e.target.value as BookingServiceDetail }))}>
                    {getBookingServiceDetailOptions(form.serviceType).map((detail) => <option key={detail} value={detail}>{detail}</option>)}
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Concern</label>
                <textarea style={styles.textarea} value={form.concern} onChange={(e) => setForm((prev) => ({ ...prev, concern: e.target.value }))} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea style={styles.textarea} value={form.notes} onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))} />
              </div>

              {error ? <div style={styles.errorBox}>{error}</div> : null}

              <div style={styles.inlineActions}>
                <button type="submit" style={styles.primaryButton}>Save Booking</button>
                <button type="button" style={styles.secondaryButton} onClick={resetForm}>Reset</button>
              </div>
            </form>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }}>
          <Card title="Booking Queue" subtitle="Newest bookings first with quick status actions">
            <div style={styles.formGroup}>
              <label style={styles.label}>Search</label>
              <input style={styles.input} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Booking no., customer, plate, service type" />
            </div>

            {filteredBookings.length === 0 ? (
              <div style={styles.emptyState}>No bookings found.</div>
            ) : (
              <div style={styles.mobileCardList}>
                {filteredBookings.map((row) => (
                  <div key={row.id} style={styles.mobileDataCard}>
                    <div style={styles.mobileDataCardHeader}>
                      <strong>{row.bookingNumber}</strong>
                      <span style={getBookingStatusStyle(row.status)}>{row.status}</span>
                    </div>
                    <div style={styles.mobileDataPrimary}>{row.customerName || row.companyName || "-"}</div>
                    <div style={styles.mobileDataSecondary}>{row.plateNumber || row.conductionNumber || "-"}</div>
                    <div style={styles.mobileDataSecondary}>{[row.make, row.model, row.year].filter(Boolean).join(" ")}</div>
                    <div style={styles.mobileMetaRow}><span>Requested</span><strong>{row.requestedDate} {row.requestedTime}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Service</span><strong>{row.serviceType} • {row.serviceDetail}</strong></div>
                    <div style={styles.formHint}>{row.concern}</div>
                    <div style={styles.inlineActions}>
                      <button type="button" style={styles.smallButtonMuted} onClick={() => updateBookingStatus(row.id, "Confirmed")}>Confirm</button>
                      <button type="button" style={styles.smallButtonMuted} onClick={() => updateBookingStatus(row.id, "Arrived")}>Arrived</button>
                      <button type="button" style={styles.smallButtonMuted} onClick={() => updateBookingStatus(row.id, "Rescheduled")}>Reschedule</button>
                      <button type="button" style={styles.smallButtonDanger} onClick={() => updateBookingStatus(row.id, "Cancelled")}>Cancel</button>
                      {row.status !== "Converted to Intake" ? (
                        <button type="button" style={styles.smallButtonSuccess} onClick={() => convertBookingToIntake(row)}>Convert to Intake</button>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}

export default BookingsPage;

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles: Record<string, React.CSSProperties> = {
  pageContent: { width: "100%" },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    gap: 16,
  },

  gridItem: { minWidth: 0 },

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

  cardTitle: { fontSize: 19, fontWeight: 800, color: "#0f172a", lineHeight: 1.3 },

  cardSubtitle: { marginTop: 4, fontSize: 13, color: "#64748b", lineHeight: 1.5 },

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

  formStack: { display: "grid", gap: 14 },

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

  formGroup: { display: "grid", gap: 8 },

  label: { fontSize: 13, fontWeight: 700, color: "#334155" },

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

  inlineActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
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

  formHint: { fontSize: 12, color: "#64748b", lineHeight: 1.5 },

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

  emptyState: {
    border: "1px dashed rgba(148, 163, 184, 0.55)",
    background: "#f8fafc",
    borderRadius: 16,
    padding: 20,
    textAlign: "center",
    color: "#64748b",
    fontSize: 14,
  },

  mobileCardList: { display: "grid", gap: 12 },

  mobileDataCard: {
    border: "1px solid rgba(148, 163, 184, 0.22)",
    background: "#ffffff",
    borderRadius: 18,
    padding: 14,
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
  },

  mobileDataCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
    flexWrap: "wrap",
  },

  mobileDataPrimary: { fontSize: 14, fontWeight: 800, color: "#0f172a" },

  mobileDataSecondary: { fontSize: 13, color: "#64748b", marginTop: 4, lineHeight: 1.5 },

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
};
