import React, { useEffect, useMemo, useState } from "react";
import type { SessionUser, IntakeRecord, IntakeStatus, VehicleAccountType } from "../shared/types";
import { formatDateTime, getResponsiveSpan } from "../shared/helpers";

// --- local types ---

type InspectionStatus = "In Progress" | "Completed";
type InspectionCheckValue = "Good" | "Monitor" | "Needs Attention" | "Needs Replacement" | "Not Checked";
type WarningLightState = "Off" | "On" | "Not Checked";
type RearSuspensionType = "Coil Spring" | "Leaf Spring" | "Other";
type InspectionEvidenceType = "Photo" | "Video";
type FindingStatus = "OK" | "Monitor" | "Replace";

type InspectionEvidenceRecord = {
  id: string;
  type: InspectionEvidenceType;
  section: string;
  itemLabel: string;
  fileName: string;
  previewDataUrl: string;
  addedAt: string;
  mobileOptimized: boolean;
};

type CategoryAdditionalFinding = {
  id: string;
  title: string;
  note: string;
  status: FindingStatus;
  photoNotes: string[];
};

type InspectionRecord = {
  id: string;
  inspectionNumber: string;
  intakeId: string;
  intakeNumber: string;
  createdAt: string;
  updatedAt: string;
  startedBy: string;
  status: InspectionStatus;
  accountLabel: string;
  plateNumber: string;
  conductionNumber: string;
  make: string;
  model: string;
  year: string;
  color: string;
  odometerKm: string;
  concern: string;
  underHoodState: InspectionCheckValue;
  engineOilLevel: InspectionCheckValue;
  engineOilCondition: InspectionCheckValue;
  engineOilLeaks: InspectionCheckValue;
  coolantLevel: InspectionCheckValue;
  coolantCondition: InspectionCheckValue;
  radiatorHoseCondition: InspectionCheckValue;
  coolingLeaks: InspectionCheckValue;
  brakeFluidLevel: InspectionCheckValue;
  brakeFluidCondition: InspectionCheckValue;
  powerSteeringLevel: InspectionCheckValue;
  powerSteeringCondition: InspectionCheckValue;
  batteryCondition: InspectionCheckValue;
  batteryTerminalCondition: InspectionCheckValue;
  batteryHoldDownCondition: InspectionCheckValue;
  driveBeltCondition: InspectionCheckValue;
  airFilterCondition: InspectionCheckValue;
  intakeHoseCondition: InspectionCheckValue;
  engineMountCondition: InspectionCheckValue;
  wiringCondition: InspectionCheckValue;
  unusualSmellState: InspectionCheckValue;
  unusualSoundState: InspectionCheckValue;
  visibleEngineLeakState: InspectionCheckValue;
  engineOilNotes: string;
  coolantNotes: string;
  brakeFluidNotes: string;
  powerSteeringNotes: string;
  batteryNotes: string;
  beltNotes: string;
  intakeNotes: string;
  leakNotes: string;
  underHoodSummary: string;
  recommendedWork: string;
  recommendationLines: string[];
  inspectionPhotoNotes: string;
  arrivalFrontPhotoNote: string;
  arrivalDriverSidePhotoNote: string;
  arrivalRearPhotoNote: string;
  arrivalPassengerSidePhotoNote: string;
  additionalFindingPhotoNotes: string[];
  enableSafetyChecks: boolean;
  enableTires: boolean;
  enableUnderHood: boolean;
  enableBrakes: boolean;
  enableAlignmentCheck: boolean;
  enableAcCheck: boolean;
  enableCoolingCheck: boolean;
  coolingFanOperationState: InspectionCheckValue;
  radiatorConditionState: InspectionCheckValue;
  waterPumpConditionState: InspectionCheckValue;
  thermostatConditionState: InspectionCheckValue;
  overflowReservoirConditionState: InspectionCheckValue;
  coolingSystemPressureState: InspectionCheckValue;
  coolingSystemNotes: string;
  coolingAdditionalFindings: CategoryAdditionalFinding[];
  enableSteeringCheck: boolean;
  steeringWheelPlayState: InspectionCheckValue;
  steeringPumpMotorState: InspectionCheckValue;
  steeringFluidConditionState: InspectionCheckValue;
  steeringHoseConditionState: InspectionCheckValue;
  steeringColumnConditionState: InspectionCheckValue;
  steeringRoadFeelState: InspectionCheckValue;
  steeringSystemNotes: string;
  steeringAdditionalFindings: CategoryAdditionalFinding[];
  enableEnginePerformanceCheck: boolean;
  engineStartingState: InspectionCheckValue;
  idleQualityState: InspectionCheckValue;
  accelerationResponseState: InspectionCheckValue;
  engineMisfireState: InspectionCheckValue;
  engineSmokeState: InspectionCheckValue;
  fuelEfficiencyConcernState: InspectionCheckValue;
  enginePerformanceNotes: string;
  enginePerformanceAdditionalFindings: CategoryAdditionalFinding[];
  enableRoadTestCheck: boolean;
  roadTestNoiseState: InspectionCheckValue;
  roadTestBrakeFeelState: InspectionCheckValue;
  roadTestSteeringTrackingState: InspectionCheckValue;
  roadTestRideQualityState: InspectionCheckValue;
  roadTestAccelerationState: InspectionCheckValue;
  roadTestTransmissionShiftState: InspectionCheckValue;
  roadTestNotes: string;
  roadTestAdditionalFindings: CategoryAdditionalFinding[];
  acVentTemperature: string;
  acCoolingPerformanceState: InspectionCheckValue;
  acCompressorState: InspectionCheckValue;
  acCondenserFanState: InspectionCheckValue;
  acCabinFilterState: InspectionCheckValue;
  acAirflowState: InspectionCheckValue;
  acOdorState: InspectionCheckValue;
  acNotes: string;
  enableElectricalCheck: boolean;
  electricalBatteryVoltage: string;
  electricalChargingVoltage: string;
  electricalStarterState: InspectionCheckValue;
  electricalAlternatorState: InspectionCheckValue;
  electricalFuseRelayState: InspectionCheckValue;
  electricalWiringState: InspectionCheckValue;
  electricalWarningLightState: InspectionCheckValue;
  electricalNotes: string;
  enableTransmissionCheck: boolean;
  enableScanCheck: boolean;
  scanPerformed: boolean;
  scanToolUsed: string;
  scanNotes: string;
  scanUploadNames: string[];
  transmissionFluidState: InspectionCheckValue;
  transmissionFluidConditionState: InspectionCheckValue;
  transmissionLeakState: InspectionCheckValue;
  shiftingPerformanceState: InspectionCheckValue;
  clutchOperationState: InspectionCheckValue;
  drivetrainVibrationState: InspectionCheckValue;
  cvJointDriveAxleState: InspectionCheckValue;
  transmissionMountState: InspectionCheckValue;
  transmissionNotes: string;
  alignmentConcernNotes: string;
  alignmentRecommended: boolean;
  alignmentBeforePrintoutName: string;
  alignmentAfterPrintoutName: string;
  arrivalLights: InspectionCheckValue;
  arrivalBrokenGlass: InspectionCheckValue;
  arrivalWipers: InspectionCheckValue;
  arrivalHorn: InspectionCheckValue;
  arrivalCheckEngineLight: WarningLightState;
  arrivalAbsLight: WarningLightState;
  arrivalAirbagLight: WarningLightState;
  arrivalBatteryLight: WarningLightState;
  arrivalOilPressureLight: WarningLightState;
  arrivalTempLight: WarningLightState;
  arrivalTransmissionLight: WarningLightState;
  arrivalOtherWarningLight: WarningLightState;
  arrivalOtherWarningNote: string;
  frontLeftTreadMm: string;
  frontRightTreadMm: string;
  rearLeftTreadMm: string;
  rearRightTreadMm: string;
  frontLeftWearPattern: string;
  frontRightWearPattern: string;
  rearLeftWearPattern: string;
  rearRightWearPattern: string;
  frontLeftTireState: InspectionCheckValue;
  frontRightTireState: InspectionCheckValue;
  rearLeftTireState: InspectionCheckValue;
  rearRightTireState: InspectionCheckValue;
  frontBrakeCondition: string;
  rearBrakeCondition: string;
  frontBrakeState: InspectionCheckValue;
  rearBrakeState: InspectionCheckValue;
  enableSuspensionCheck: boolean;
  frontShockState: InspectionCheckValue;
  frontBallJointState: InspectionCheckValue;
  frontTieRodEndState: InspectionCheckValue;
  frontRackEndState: InspectionCheckValue;
  frontStabilizerLinkState: InspectionCheckValue;
  frontControlArmBushingState: InspectionCheckValue;
  frontUpperControlArmState: InspectionCheckValue;
  frontLowerControlArmState: InspectionCheckValue;
  frontStrutMountState: InspectionCheckValue;
  steeringRackConditionState: InspectionCheckValue;
  frontCvBootState: InspectionCheckValue;
  frontWheelBearingState: InspectionCheckValue;
  rearSuspensionType: RearSuspensionType;
  rearShockState: InspectionCheckValue;
  rearStabilizerLinkState: InspectionCheckValue;
  rearBushingState: InspectionCheckValue;
  rearSpringState: InspectionCheckValue;
  rearControlArmState: InspectionCheckValue;
  rearCoilSpringState: InspectionCheckValue;
  rearLeafSpringState: InspectionCheckValue;
  rearLeafSpringBushingState: InspectionCheckValue;
  rearUBoltMountState: InspectionCheckValue;
  rearAxleMountState: InspectionCheckValue;
  rearWheelBearingState: InspectionCheckValue;
  frontSuspensionNotes: string;
  rearSuspensionNotes: string;
  steeringFeelNotes: string;
  suspensionRoadTestNotes: string;
  inspectionNotes: string;
  evidenceItems: InspectionEvidenceRecord[];
  lastUpdatedBy?: string;
  reopenedAt?: string;
  reopenedBy?: string;
  linkedRoIds?: string[];
};

type InspectionForm = Omit<
  InspectionRecord,
  | "id"
  | "inspectionNumber"
  | "intakeId"
  | "intakeNumber"
  | "createdAt"
  | "updatedAt"
  | "startedBy"
  | "accountLabel"
  | "plateNumber"
  | "conductionNumber"
  | "make"
  | "model"
  | "year"
  | "color"
  | "odometerKm"
  | "concern"
>;

type IntakeForm = {
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
  color: string;
  odometerKm: string;
  fuelLevel: string;
  assignedAdvisor: string;
  concern: string;
  notes: string;
  status: IntakeStatus;
};

type DraftSaveState = "Unsaved changes" | "Saving..." | "Saved";

// --- local helpers ---

const STORAGE_KEY_INTAKE_DRAFT = "dvi_phase17i_intake_draft_v1";
const STORAGE_KEY_COUNTERS = "dvi_phase2_counters_v1";

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}

function todayStamp(date = new Date()) {
  const yyyy = date.getFullYear().toString();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
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
  const counters = readLocalStorage<Record<string, number>>(STORAGE_KEY_COUNTERS, {});
  const key = `${prefix}_${stamp}`;
  const next = (counters[key] ?? 0) + 1;
  counters[key] = next;
  writeLocalStorage(STORAGE_KEY_COUNTERS, counters);
  return `${prefix}-${stamp}-${String(next).padStart(3, "0")}`;
}

function hasNonEmptyValues(value: unknown): boolean {
  if (value == null) return false;
  if (typeof value === "string") return value.trim().length > 0;
  if (typeof value === "number" || typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.some((item) => hasNonEmptyValues(item));
  if (typeof value === "object") return Object.values(value as Record<string, unknown>).some((item) => hasNonEmptyValues(item));
  return false;
}

function useDraftAutosave<T>(key: string, value: T, enabled = true) {
  const [draftState, setDraftState] = useState<DraftSaveState>("Saved");

  useEffect(() => {
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

function parseRecommendationLines(input: string) {
  return input
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function getDefaultIntakeForm(currentUserName: string): IntakeForm {
  return {
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
    color: "",
    odometerKm: "",
    fuelLevel: "",
    assignedAdvisor: currentUserName,
    concern: "",
    notes: "",
    status: "Waiting Inspection",
  };
}

function getDefaultInspectionForm(): InspectionForm {
  return {
    status: "In Progress",
    underHoodState: "Good",
    engineOilLevel: "Not Checked",
    engineOilCondition: "Not Checked",
    engineOilLeaks: "Not Checked",
    coolantLevel: "Not Checked",
    coolantCondition: "Not Checked",
    radiatorHoseCondition: "Not Checked",
    coolingLeaks: "Not Checked",
    brakeFluidLevel: "Not Checked",
    brakeFluidCondition: "Not Checked",
    powerSteeringLevel: "Not Checked",
    powerSteeringCondition: "Not Checked",
    batteryCondition: "Not Checked",
    batteryTerminalCondition: "Not Checked",
    batteryHoldDownCondition: "Not Checked",
    driveBeltCondition: "Not Checked",
    airFilterCondition: "Not Checked",
    intakeHoseCondition: "Not Checked",
    engineMountCondition: "Not Checked",
    wiringCondition: "Not Checked",
    unusualSmellState: "Not Checked",
    unusualSoundState: "Not Checked",
    visibleEngineLeakState: "Not Checked",
    engineOilNotes: "",
    coolantNotes: "",
    brakeFluidNotes: "",
    powerSteeringNotes: "",
    batteryNotes: "",
    beltNotes: "",
    intakeNotes: "",
    leakNotes: "",
    underHoodSummary: "",
    recommendedWork: "",
    recommendationLines: [],
    inspectionPhotoNotes: "",
    arrivalFrontPhotoNote: "",
    arrivalDriverSidePhotoNote: "",
    arrivalRearPhotoNote: "",
    arrivalPassengerSidePhotoNote: "",
    additionalFindingPhotoNotes: [],
    enableSafetyChecks: true,
    enableTires: true,
    enableUnderHood: true,
    enableBrakes: false,
    enableSuspensionCheck: false,
    enableAlignmentCheck: false,
    enableAcCheck: false,
    enableCoolingCheck: false,
    coolingFanOperationState: "Not Checked",
    radiatorConditionState: "Not Checked",
    waterPumpConditionState: "Not Checked",
    thermostatConditionState: "Not Checked",
    overflowReservoirConditionState: "Not Checked",
    coolingSystemPressureState: "Not Checked",
    coolingSystemNotes: "",
    coolingAdditionalFindings: [],
    enableSteeringCheck: false,
    steeringWheelPlayState: "Not Checked",
    steeringPumpMotorState: "Not Checked",
    steeringFluidConditionState: "Not Checked",
    steeringHoseConditionState: "Not Checked",
    steeringColumnConditionState: "Not Checked",
    steeringRoadFeelState: "Not Checked",
    steeringSystemNotes: "",
    steeringAdditionalFindings: [],
    enableEnginePerformanceCheck: false,
    engineStartingState: "Not Checked",
    idleQualityState: "Not Checked",
    accelerationResponseState: "Not Checked",
    engineMisfireState: "Not Checked",
    engineSmokeState: "Not Checked",
    fuelEfficiencyConcernState: "Not Checked",
    enginePerformanceNotes: "",
    enginePerformanceAdditionalFindings: [],
    enableRoadTestCheck: false,
    roadTestNoiseState: "Not Checked",
    roadTestBrakeFeelState: "Not Checked",
    roadTestSteeringTrackingState: "Not Checked",
    roadTestRideQualityState: "Not Checked",
    roadTestAccelerationState: "Not Checked",
    roadTestTransmissionShiftState: "Not Checked",
    roadTestNotes: "",
    roadTestAdditionalFindings: [],
    acVentTemperature: "",
    acCoolingPerformanceState: "Not Checked",
    acCompressorState: "Not Checked",
    acCondenserFanState: "Not Checked",
    acCabinFilterState: "Not Checked",
    acAirflowState: "Not Checked",
    acOdorState: "Not Checked",
    acNotes: "",
    enableElectricalCheck: false,
    electricalBatteryVoltage: "",
    electricalChargingVoltage: "",
    electricalStarterState: "Not Checked",
    electricalAlternatorState: "Not Checked",
    electricalFuseRelayState: "Not Checked",
    electricalWiringState: "Not Checked",
    electricalWarningLightState: "Not Checked",
    electricalNotes: "",
    enableTransmissionCheck: false,
    enableScanCheck: false,
    scanPerformed: false,
    scanToolUsed: "",
    scanNotes: "",
    scanUploadNames: [],
    transmissionFluidState: "Not Checked",
    transmissionFluidConditionState: "Not Checked",
    transmissionLeakState: "Not Checked",
    shiftingPerformanceState: "Not Checked",
    clutchOperationState: "Not Checked",
    drivetrainVibrationState: "Not Checked",
    cvJointDriveAxleState: "Not Checked",
    transmissionMountState: "Not Checked",
    transmissionNotes: "",
    alignmentConcernNotes: "",
    alignmentRecommended: false,
    alignmentBeforePrintoutName: "",
    alignmentAfterPrintoutName: "",
    arrivalLights: "Not Checked",
    arrivalBrokenGlass: "Not Checked",
    arrivalWipers: "Not Checked",
    arrivalHorn: "Not Checked",
    arrivalCheckEngineLight: "Not Checked",
    arrivalAbsLight: "Not Checked",
    arrivalAirbagLight: "Not Checked",
    arrivalBatteryLight: "Not Checked",
    arrivalOilPressureLight: "Not Checked",
    arrivalTempLight: "Not Checked",
    arrivalTransmissionLight: "Not Checked",
    arrivalOtherWarningLight: "Not Checked",
    arrivalOtherWarningNote: "",
    frontLeftTreadMm: "",
    frontRightTreadMm: "",
    rearLeftTreadMm: "",
    rearRightTreadMm: "",
    frontLeftWearPattern: "Even Wear",
    frontRightWearPattern: "Even Wear",
    rearLeftWearPattern: "Even Wear",
    rearRightWearPattern: "Even Wear",
    frontLeftTireState: "Not Checked",
    frontRightTireState: "Not Checked",
    rearLeftTireState: "Not Checked",
    rearRightTireState: "Not Checked",
    frontBrakeCondition: "",
    rearBrakeCondition: "",
    frontBrakeState: "Not Checked",
    rearBrakeState: "Not Checked",
    frontShockState: "Not Checked",
    frontBallJointState: "Not Checked",
    frontTieRodEndState: "Not Checked",
    frontRackEndState: "Not Checked",
    frontStabilizerLinkState: "Not Checked",
    frontControlArmBushingState: "Not Checked",
    frontUpperControlArmState: "Not Checked",
    frontLowerControlArmState: "Not Checked",
    frontStrutMountState: "Not Checked",
    steeringRackConditionState: "Not Checked",
    frontCvBootState: "Not Checked",
    frontWheelBearingState: "Not Checked",
    rearSuspensionType: "Coil Spring",
    rearShockState: "Not Checked",
    rearStabilizerLinkState: "Not Checked",
    rearBushingState: "Not Checked",
    rearSpringState: "Not Checked",
    rearControlArmState: "Not Checked",
    rearCoilSpringState: "Not Checked",
    rearLeafSpringState: "Not Checked",
    rearLeafSpringBushingState: "Not Checked",
    rearUBoltMountState: "Not Checked",
    rearAxleMountState: "Not Checked",
    rearWheelBearingState: "Not Checked",
    frontSuspensionNotes: "",
    rearSuspensionNotes: "",
    steeringFeelNotes: "",
    suspensionRoadTestNotes: "",
    inspectionNotes: "",
    evidenceItems: [],
  };
}

// --- local components ---

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

function StatusBadge({ status }: { status: IntakeStatus }) {
  const map: Record<IntakeStatus, React.CSSProperties> = {
    Draft: styles.statusNeutral,
    "Waiting Inspection": styles.statusInfo,
    "Converted to RO": styles.statusOk,
    Cancelled: styles.statusLocked,
  };
  return <span style={map[status]}>{status}</span>;
}

// --- component ---

function IntakePage({
  currentUser,
  intakeRecords,
  setIntakeRecords,
  inspectionRecords,
  setInspectionRecords,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  intakeRecords: IntakeRecord[];
  setIntakeRecords: React.Dispatch<React.SetStateAction<IntakeRecord[]>>;
  inspectionRecords: InspectionRecord[];
  setInspectionRecords: React.Dispatch<React.SetStateAction<InspectionRecord[]>>;
  isCompactLayout: boolean;
}) {
  const [form, setForm] = useState<IntakeForm>(() => {
    const defaultForm = getDefaultIntakeForm(currentUser.fullName);
    const savedDraft = readLocalStorage<IntakeForm | null>(STORAGE_KEY_INTAKE_DRAFT, null);
    return savedDraft ? { ...defaultForm, ...savedDraft, assignedAdvisor: savedDraft.assignedAdvisor || currentUser.fullName } : defaultForm;
  });
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [showDraftRestore, setShowDraftRestore] = useState(() => hasNonEmptyValues(readLocalStorage<IntakeForm | null>(STORAGE_KEY_INTAKE_DRAFT, null)));
  const intakeDraft = useDraftAutosave(STORAGE_KEY_INTAKE_DRAFT, form, true);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      assignedAdvisor: prev.assignedAdvisor || currentUser.fullName,
    }));
  }, [currentUser.fullName]);

  const filteredRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return intakeRecords;
    return intakeRecords.filter((row) =>
      [
        row.intakeNumber,
        row.plateNumber,
        row.conductionNumber,
        row.customerName,
        row.companyName,
        row.phone,
        row.make,
        row.model,
        row.concern,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [intakeRecords, search]);

  const vehicleHistoryMatches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return intakeRecords.filter((row) => row.plateNumber.toLowerCase() === term || row.conductionNumber.toLowerCase() === term).slice(0, 8);
  }, [intakeRecords, search]);

  const customerHistoryMatches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return intakeRecords.filter((row) => [row.customerName, row.companyName].join(" ").toLowerCase().includes(term)).slice(0, 8);
  }, [intakeRecords, search]);

  const resetForm = () => {
    setForm(getDefaultIntakeForm(currentUser.fullName));
    setError("");
    intakeDraft.clearDraft();
    setShowDraftRestore(false);
  };

  const loadHistoryIntoForm = (row: IntakeRecord) => {
    setForm({
      customerName: row.customerName,
      companyName: row.companyName,
      accountType: row.accountType,
      phone: row.phone,
      email: row.email,
      plateNumber: row.plateNumber,
      conductionNumber: row.conductionNumber,
      make: row.make,
      model: row.model,
      year: row.year,
      color: row.color,
      odometerKm: row.odometerKm,
      fuelLevel: row.fuelLevel,
      assignedAdvisor: row.assignedAdvisor || currentUser.fullName,
      concern: row.concern,
      notes: row.notes,
      status: row.status === "Converted to RO" ? "Waiting Inspection" : row.status,
    });
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const plateNumber = form.plateNumber.trim().toUpperCase();
    const conductionNumber = form.conductionNumber.trim().toUpperCase();
    const customerName = form.customerName.trim();
    const companyName = form.companyName.trim();
    const make = form.make.trim();
    const model = form.model.trim();
    const concern = form.concern.trim();

    if (!plateNumber && !conductionNumber) {
      setError("Plate number or conduction number is required.");
      return;
    }

    if (!make || !model) {
      setError("Vehicle make and model are required.");
      return;
    }

    if (!concern) {
      setError("Customer concern is required.");
      return;
    }

    if (form.accountType === "Personal" && !customerName) {
      setError("Customer name is required for personal accounts.");
      return;
    }

    if (form.accountType === "Company / Fleet" && !companyName) {
      setError("Company / fleet name is required for company or fleet accounts.");
      return;
    }

    if (
      plateNumber &&
      intakeRecords.some(
        (row) => row.plateNumber === plateNumber && row.status !== "Cancelled"
      )
    ) {
      setError("This plate number already has an active intake record.");
      return;
    }

    const now = new Date().toISOString();
    const newRecord: IntakeRecord = {
      id: uid("int"),
      intakeNumber: nextDailyNumber("INT"),
      createdAt: now,
      updatedAt: now,
      customerName,
      companyName,
      accountType: form.accountType,
      phone: form.phone.trim(),
      email: form.email.trim(),
      plateNumber,
      conductionNumber,
      make,
      model,
      year: form.year.trim(),
      color: form.color.trim(),
      odometerKm: form.odometerKm.trim(),
      fuelLevel: form.fuelLevel.trim(),
      assignedAdvisor: form.assignedAdvisor.trim() || currentUser.fullName,
      concern,
      notes: form.notes.trim(),
      status: form.status,
      encodedBy: currentUser.fullName,
    };

    setIntakeRecords((prev) => [newRecord, ...prev]);

    if (!inspectionRecords.some((row) => row.intakeId === newRecord.id)) {
      const inspectionSeedForm = getDefaultInspectionForm();
      const recommendationLines = parseRecommendationLines(inspectionSeedForm.recommendedWork || "");
      const draftInspection: InspectionRecord = {
        id: uid("insp"),
        inspectionNumber: nextDailyNumber("INSP"),
        intakeId: newRecord.id,
        intakeNumber: newRecord.intakeNumber,
        createdAt: now,
        updatedAt: now,
        startedBy: currentUser.fullName,
        status: "In Progress",
        accountLabel: newRecord.companyName || newRecord.customerName || "Unknown Customer",
        plateNumber: newRecord.plateNumber,
        conductionNumber: newRecord.conductionNumber,
        make: newRecord.make,
        model: newRecord.model,
        year: newRecord.year,
        color: newRecord.color,
        odometerKm: newRecord.odometerKm,
        concern: newRecord.concern,
        underHoodState: inspectionSeedForm.underHoodState,
        engineOilLevel: inspectionSeedForm.engineOilLevel,
        engineOilCondition: inspectionSeedForm.engineOilCondition,
        engineOilLeaks: inspectionSeedForm.engineOilLeaks,
        coolantLevel: inspectionSeedForm.coolantLevel,
        coolantCondition: inspectionSeedForm.coolantCondition,
        radiatorHoseCondition: inspectionSeedForm.radiatorHoseCondition,
        coolingLeaks: inspectionSeedForm.coolingLeaks,
        brakeFluidLevel: inspectionSeedForm.brakeFluidLevel,
        brakeFluidCondition: inspectionSeedForm.brakeFluidCondition,
        powerSteeringLevel: inspectionSeedForm.powerSteeringLevel,
        powerSteeringCondition: inspectionSeedForm.powerSteeringCondition,
        batteryCondition: inspectionSeedForm.batteryCondition,
        batteryTerminalCondition: inspectionSeedForm.batteryTerminalCondition,
        batteryHoldDownCondition: inspectionSeedForm.batteryHoldDownCondition,
        driveBeltCondition: inspectionSeedForm.driveBeltCondition,
        airFilterCondition: inspectionSeedForm.airFilterCondition,
        intakeHoseCondition: inspectionSeedForm.intakeHoseCondition,
        engineMountCondition: inspectionSeedForm.engineMountCondition,
        wiringCondition: inspectionSeedForm.wiringCondition,
        unusualSmellState: inspectionSeedForm.unusualSmellState,
        unusualSoundState: inspectionSeedForm.unusualSoundState,
        visibleEngineLeakState: inspectionSeedForm.visibleEngineLeakState,
        engineOilNotes: inspectionSeedForm.engineOilNotes,
        coolantNotes: inspectionSeedForm.coolantNotes,
        brakeFluidNotes: inspectionSeedForm.brakeFluidNotes,
        powerSteeringNotes: inspectionSeedForm.powerSteeringNotes,
        batteryNotes: inspectionSeedForm.batteryNotes,
        beltNotes: inspectionSeedForm.beltNotes,
        intakeNotes: inspectionSeedForm.intakeNotes,
        leakNotes: inspectionSeedForm.leakNotes,
        underHoodSummary: inspectionSeedForm.underHoodSummary,
        recommendedWork: inspectionSeedForm.recommendedWork,
        recommendationLines,
        inspectionPhotoNotes: inspectionSeedForm.inspectionPhotoNotes,
        arrivalFrontPhotoNote: inspectionSeedForm.arrivalFrontPhotoNote,
        arrivalDriverSidePhotoNote: inspectionSeedForm.arrivalDriverSidePhotoNote,
        arrivalRearPhotoNote: inspectionSeedForm.arrivalRearPhotoNote,
        arrivalPassengerSidePhotoNote: inspectionSeedForm.arrivalPassengerSidePhotoNote,
        additionalFindingPhotoNotes: inspectionSeedForm.additionalFindingPhotoNotes,
        enableSafetyChecks: inspectionSeedForm.enableSafetyChecks,
        enableTires: inspectionSeedForm.enableTires,
        enableUnderHood: inspectionSeedForm.enableUnderHood,
        enableBrakes: inspectionSeedForm.enableBrakes,
        enableAlignmentCheck: inspectionSeedForm.enableAlignmentCheck,
        enableAcCheck: inspectionSeedForm.enableAcCheck,
        enableCoolingCheck: inspectionSeedForm.enableCoolingCheck,
        coolingFanOperationState: inspectionSeedForm.coolingFanOperationState,
        radiatorConditionState: inspectionSeedForm.radiatorConditionState,
        waterPumpConditionState: inspectionSeedForm.waterPumpConditionState,
        thermostatConditionState: inspectionSeedForm.thermostatConditionState,
        overflowReservoirConditionState: inspectionSeedForm.overflowReservoirConditionState,
        coolingSystemPressureState: inspectionSeedForm.coolingSystemPressureState,
        coolingSystemNotes: inspectionSeedForm.coolingSystemNotes,
        coolingAdditionalFindings: inspectionSeedForm.coolingAdditionalFindings,
        enableSteeringCheck: inspectionSeedForm.enableSteeringCheck,
        steeringWheelPlayState: inspectionSeedForm.steeringWheelPlayState,
        steeringPumpMotorState: inspectionSeedForm.steeringPumpMotorState,
        steeringFluidConditionState: inspectionSeedForm.steeringFluidConditionState,
        steeringHoseConditionState: inspectionSeedForm.steeringHoseConditionState,
        steeringColumnConditionState: inspectionSeedForm.steeringColumnConditionState,
        steeringRoadFeelState: inspectionSeedForm.steeringRoadFeelState,
        steeringSystemNotes: inspectionSeedForm.steeringSystemNotes,
        steeringAdditionalFindings: inspectionSeedForm.steeringAdditionalFindings,
        enableEnginePerformanceCheck: inspectionSeedForm.enableEnginePerformanceCheck,
        engineStartingState: inspectionSeedForm.engineStartingState,
        idleQualityState: inspectionSeedForm.idleQualityState,
        accelerationResponseState: inspectionSeedForm.accelerationResponseState,
        engineMisfireState: inspectionSeedForm.engineMisfireState,
        engineSmokeState: inspectionSeedForm.engineSmokeState,
        fuelEfficiencyConcernState: inspectionSeedForm.fuelEfficiencyConcernState,
        enginePerformanceNotes: inspectionSeedForm.enginePerformanceNotes,
        enginePerformanceAdditionalFindings: inspectionSeedForm.enginePerformanceAdditionalFindings,
        enableRoadTestCheck: inspectionSeedForm.enableRoadTestCheck,
        roadTestNoiseState: inspectionSeedForm.roadTestNoiseState,
        roadTestBrakeFeelState: inspectionSeedForm.roadTestBrakeFeelState,
        roadTestSteeringTrackingState: inspectionSeedForm.roadTestSteeringTrackingState,
        roadTestRideQualityState: inspectionSeedForm.roadTestRideQualityState,
        roadTestAccelerationState: inspectionSeedForm.roadTestAccelerationState,
        roadTestTransmissionShiftState: inspectionSeedForm.roadTestTransmissionShiftState,
        roadTestNotes: inspectionSeedForm.roadTestNotes,
        roadTestAdditionalFindings: inspectionSeedForm.roadTestAdditionalFindings,
        acVentTemperature: inspectionSeedForm.acVentTemperature,
        acCoolingPerformanceState: inspectionSeedForm.acCoolingPerformanceState,
        acCompressorState: inspectionSeedForm.acCompressorState,
        acCondenserFanState: inspectionSeedForm.acCondenserFanState,
        acCabinFilterState: inspectionSeedForm.acCabinFilterState,
        acAirflowState: inspectionSeedForm.acAirflowState,
        acOdorState: inspectionSeedForm.acOdorState,
        acNotes: inspectionSeedForm.acNotes,
        enableElectricalCheck: inspectionSeedForm.enableElectricalCheck,
        electricalBatteryVoltage: inspectionSeedForm.electricalBatteryVoltage,
        electricalChargingVoltage: inspectionSeedForm.electricalChargingVoltage,
        electricalStarterState: inspectionSeedForm.electricalStarterState,
        electricalAlternatorState: inspectionSeedForm.electricalAlternatorState,
        electricalFuseRelayState: inspectionSeedForm.electricalFuseRelayState,
        electricalWiringState: inspectionSeedForm.electricalWiringState,
        electricalWarningLightState: inspectionSeedForm.electricalWarningLightState,
        electricalNotes: inspectionSeedForm.electricalNotes,
        enableTransmissionCheck: inspectionSeedForm.enableTransmissionCheck,
        enableScanCheck: inspectionSeedForm.enableScanCheck,
        scanPerformed: inspectionSeedForm.scanPerformed,
        scanToolUsed: inspectionSeedForm.scanToolUsed,
        scanNotes: inspectionSeedForm.scanNotes,
        scanUploadNames: inspectionSeedForm.scanUploadNames,
        transmissionFluidState: inspectionSeedForm.transmissionFluidState,
        transmissionFluidConditionState: inspectionSeedForm.transmissionFluidConditionState,
        transmissionLeakState: inspectionSeedForm.transmissionLeakState,
        shiftingPerformanceState: inspectionSeedForm.shiftingPerformanceState,
        clutchOperationState: inspectionSeedForm.clutchOperationState,
        drivetrainVibrationState: inspectionSeedForm.drivetrainVibrationState,
        cvJointDriveAxleState: inspectionSeedForm.cvJointDriveAxleState,
        transmissionMountState: inspectionSeedForm.transmissionMountState,
        transmissionNotes: inspectionSeedForm.transmissionNotes,
        alignmentConcernNotes: inspectionSeedForm.alignmentConcernNotes,
        alignmentRecommended: inspectionSeedForm.alignmentRecommended,
        alignmentBeforePrintoutName: inspectionSeedForm.alignmentBeforePrintoutName,
        alignmentAfterPrintoutName: inspectionSeedForm.alignmentAfterPrintoutName,
        arrivalLights: inspectionSeedForm.arrivalLights,
        arrivalBrokenGlass: inspectionSeedForm.arrivalBrokenGlass,
        arrivalWipers: inspectionSeedForm.arrivalWipers,
        arrivalHorn: inspectionSeedForm.arrivalHorn,
        arrivalCheckEngineLight: inspectionSeedForm.arrivalCheckEngineLight,
        arrivalAbsLight: inspectionSeedForm.arrivalAbsLight,
        arrivalAirbagLight: inspectionSeedForm.arrivalAirbagLight,
        arrivalBatteryLight: inspectionSeedForm.arrivalBatteryLight,
        arrivalOilPressureLight: inspectionSeedForm.arrivalOilPressureLight,
        arrivalTempLight: inspectionSeedForm.arrivalTempLight,
        arrivalTransmissionLight: inspectionSeedForm.arrivalTransmissionLight,
        arrivalOtherWarningLight: inspectionSeedForm.arrivalOtherWarningLight,
        arrivalOtherWarningNote: inspectionSeedForm.arrivalOtherWarningNote,
        frontLeftTreadMm: inspectionSeedForm.frontLeftTreadMm,
        frontRightTreadMm: inspectionSeedForm.frontRightTreadMm,
        rearLeftTreadMm: inspectionSeedForm.rearLeftTreadMm,
        rearRightTreadMm: inspectionSeedForm.rearRightTreadMm,
        frontLeftWearPattern: inspectionSeedForm.frontLeftWearPattern,
        frontRightWearPattern: inspectionSeedForm.frontRightWearPattern,
        rearLeftWearPattern: inspectionSeedForm.rearLeftWearPattern,
        rearRightWearPattern: inspectionSeedForm.rearRightWearPattern,
        frontLeftTireState: inspectionSeedForm.frontLeftTireState,
        frontRightTireState: inspectionSeedForm.frontRightTireState,
        rearLeftTireState: inspectionSeedForm.rearLeftTireState,
        rearRightTireState: inspectionSeedForm.rearRightTireState,
        frontBrakeCondition: inspectionSeedForm.frontBrakeCondition,
        rearBrakeCondition: inspectionSeedForm.rearBrakeCondition,
        frontBrakeState: inspectionSeedForm.frontBrakeState,
        rearBrakeState: inspectionSeedForm.rearBrakeState,
        enableSuspensionCheck: inspectionSeedForm.enableSuspensionCheck,
        frontShockState: inspectionSeedForm.frontShockState,
        frontBallJointState: inspectionSeedForm.frontBallJointState,
        frontTieRodEndState: inspectionSeedForm.frontTieRodEndState,
        frontRackEndState: inspectionSeedForm.frontRackEndState,
        frontStabilizerLinkState: inspectionSeedForm.frontStabilizerLinkState,
        frontControlArmBushingState: inspectionSeedForm.frontControlArmBushingState,
        frontUpperControlArmState: inspectionSeedForm.frontUpperControlArmState,
        frontLowerControlArmState: inspectionSeedForm.frontLowerControlArmState,
        frontStrutMountState: inspectionSeedForm.frontStrutMountState,
        steeringRackConditionState: inspectionSeedForm.steeringRackConditionState,
        frontCvBootState: inspectionSeedForm.frontCvBootState,
        frontWheelBearingState: inspectionSeedForm.frontWheelBearingState,
        rearSuspensionType: inspectionSeedForm.rearSuspensionType,
        rearShockState: inspectionSeedForm.rearShockState,
        rearStabilizerLinkState: inspectionSeedForm.rearStabilizerLinkState,
        rearBushingState: inspectionSeedForm.rearBushingState,
        rearSpringState: inspectionSeedForm.rearSpringState,
        rearControlArmState: inspectionSeedForm.rearControlArmState,
        rearCoilSpringState: inspectionSeedForm.rearCoilSpringState,
        rearLeafSpringState: inspectionSeedForm.rearLeafSpringState,
        rearLeafSpringBushingState: inspectionSeedForm.rearLeafSpringBushingState,
        rearUBoltMountState: inspectionSeedForm.rearUBoltMountState,
        rearAxleMountState: inspectionSeedForm.rearAxleMountState,
        rearWheelBearingState: inspectionSeedForm.rearWheelBearingState,
        frontSuspensionNotes: inspectionSeedForm.frontSuspensionNotes,
        rearSuspensionNotes: inspectionSeedForm.rearSuspensionNotes,
        steeringFeelNotes: inspectionSeedForm.steeringFeelNotes,
        suspensionRoadTestNotes: inspectionSeedForm.suspensionRoadTestNotes,
        inspectionNotes: inspectionSeedForm.inspectionNotes,
        evidenceItems: inspectionSeedForm.evidenceItems,
        lastUpdatedBy: currentUser.fullName,
        reopenedAt: "",
        reopenedBy: "",
        linkedRoIds: [],
      };
      setInspectionRecords((prev) => [draftInspection, ...prev]);
    }

    resetForm();
  };

  const updateStatus = (id: string, status: IntakeStatus) => {
    setIntakeRecords((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, status, updatedAt: new Date().toISOString() } : row
      )
    );
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }}>
          <Card
            title="New Intake"
            subtitle="Plate-based intake with support for company and fleet accounts"
            right={<span style={styles.statusInfo}>Reception Ready</span>}
          >
            <form onSubmit={handleSubmit} style={styles.formStack}>
              {showDraftRestore ? (
                <div style={styles.sectionCardMuted}>
                  <div style={styles.mobileDataCardHeader}>
                    <div>
                      <div style={styles.sectionTitle}>Draft Recovery</div>
                      <div style={styles.formHint}>An intake draft was restored automatically from your last unfinished work.</div>
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
                <strong>{intakeDraft.draftState}</strong>
              </div>
              <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Account Type</label>
                  <select
                    style={styles.select}
                    value={form.accountType}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        accountType: e.target.value as VehicleAccountType,
                      }))
                    }
                  >
                    <option value="Personal">Personal</option>
                    <option value="Company / Fleet">Company / Fleet</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Status</label>
                  <select
                    style={styles.select}
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, status: e.target.value as IntakeStatus }))
                    }
                  >
                    <option value="Draft">Draft</option>
                    <option value="Waiting Inspection">Waiting Inspection</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  {form.accountType === "Company / Fleet" ? "Company / Fleet Name" : "Customer Name"}
                </label>
                <input
                  style={styles.input}
                  value={form.accountType === "Company / Fleet" ? form.companyName : form.customerName}
                  onChange={(e) =>
                    setForm((prev) =>
                      prev.accountType === "Company / Fleet"
                        ? { ...prev, companyName: e.target.value }
                        : { ...prev, customerName: e.target.value }
                    )
                  }
                  placeholder={
                    form.accountType === "Company / Fleet"
                      ? "Enter company or fleet account name"
                      : "Enter customer name"
                  }
                />
              </div>

              {form.accountType === "Company / Fleet" ? (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Driver / Contact Person</label>
                  <input
                    style={styles.input}
                    value={form.customerName}
                    onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Optional driver or contact person"
                  />
                </div>
              ) : null}

              <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Phone</label>
                  <input
                    style={styles.input}
                    value={form.phone}
                    onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    style={styles.input}
                    value={form.email}
                    onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Optional email"
                  />
                </div>
              </div>

              <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Plate Number</label>
                  <input
                    style={styles.input}
                    value={form.plateNumber}
                    onChange={(e) => setForm((prev) => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))}
                    placeholder="Primary vehicle identifier"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Conduction Number</label>
                  <input
                    style={styles.input}
                    value={form.conductionNumber}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, conductionNumber: e.target.value.toUpperCase() }))
                    }
                    placeholder="Use when plate is not yet available"
                  />
                </div>
              </div>

              <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Make</label>
                  <input
                    style={styles.input}
                    value={form.make}
                    onChange={(e) => setForm((prev) => ({ ...prev, make: e.target.value }))}
                    placeholder="e.g. Toyota"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Model</label>
                  <input
                    style={styles.input}
                    value={form.model}
                    onChange={(e) => setForm((prev) => ({ ...prev, model: e.target.value }))}
                    placeholder="e.g. Hilux"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Year</label>
                  <input
                    style={styles.input}
                    value={form.year}
                    onChange={(e) => setForm((prev) => ({ ...prev, year: e.target.value }))}
                    placeholder="e.g. 2022"
                  />
                </div>
              </div>

              <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Color</label>
                  <input
                    style={styles.input}
                    value={form.color}
                    onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Odometer (km)</label>
                  <input
                    style={styles.input}
                    value={form.odometerKm}
                    onChange={(e) => setForm((prev) => ({ ...prev, odometerKm: e.target.value }))}
                    placeholder="Reception can encode"
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Fuel Level</label>
                  <input
                    style={styles.input}
                    value={form.fuelLevel}
                    onChange={(e) => setForm((prev) => ({ ...prev, fuelLevel: e.target.value }))}
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Assigned Service Advisor</label>
                <input
                  style={styles.input}
                  value={form.assignedAdvisor}
                  onChange={(e) => setForm((prev) => ({ ...prev, assignedAdvisor: e.target.value }))}
                  placeholder="Assigned advisor"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Customer Concern</label>
                <textarea
                  style={styles.textarea}
                  value={form.concern}
                  onChange={(e) => setForm((prev) => ({ ...prev, concern: e.target.value }))}
                  placeholder="Main complaint or requested work"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Internal Notes</label>
                <textarea
                  style={styles.textarea}
                  value={form.notes}
                  onChange={(e) => setForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Optional notes"
                />
              </div>

              {error ? <div style={styles.errorBox}>{error}</div> : null}

              <div
                style={{
                  ...(isCompactLayout ? styles.stickyActionBar : styles.inlineActions),
                  ...(isCompactLayout ? {} : styles.inlineActions),
                }}
              >
                <button type="submit" style={{ ...styles.primaryButton, ...(isCompactLayout ? styles.actionButtonWide : {}) }}>
                  Save Intake
                </button>
                <button
                  type="button"
                  style={{ ...styles.secondaryButton, ...(isCompactLayout ? styles.actionButtonWide : {}) }}
                  onClick={resetForm}
                >
                  Reset
                </button>
              </div>
            </form>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }}>
          <Card
            title="Customer / Vehicle History Lookup"
            subtitle="Search by plate, conduction, customer, company, phone, or email, then load prior details into intake"
            right={<span style={styles.statusInfo}>{vehicleHistoryMatches.length + customerHistoryMatches.length} match(es)</span>}
          >
            <div style={styles.formGroup}>
              <label style={styles.label}>History Search</label>
              <input
                style={styles.input}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by plate, conduction, name, company, phone, or email"
              />
            </div>

            {!search.trim() ? (
              <div style={styles.formHint}>Start typing to pull customer and vehicle history into the intake form.</div>
            ) : (
              <div style={styles.mobileCardList}>
                {[...vehicleHistoryMatches, ...customerHistoryMatches.filter((row) => !vehicleHistoryMatches.some((match) => match.id === row.id))]
                  .slice(0, 8)
                  .map((row) => (
                    <div key={row.id} style={styles.mobileDataCard}>
                      <div style={styles.mobileDataCardHeader}>
                        <strong>{row.intakeNumber}</strong>
                        <StatusBadge status={row.status} />
                      </div>
                      <div style={styles.mobileDataPrimary}>{row.plateNumber || row.conductionNumber || "-"}</div>
                      <div style={styles.mobileDataSecondary}>{row.companyName || row.customerName || "-"}</div>
                      <div style={styles.mobileDataSecondary}>{[row.make, row.model, row.year].filter(Boolean).join(" ") || "-"}</div>
                      <div style={styles.mobileMetaRow}>
                        <span>Phone / Email</span>
                        <strong>{row.phone || row.email || "-"}</strong>
                      </div>
                      <div style={styles.mobileMetaRow}>
                        <span>Latest Concern</span>
                        <strong>{row.concern || "-"}</strong>
                      </div>
                      <div style={styles.inlineActions}>
                        <button type="button" style={styles.smallButton} onClick={() => loadHistoryIntoForm(row)}>
                          Load Into Intake
                        </button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title="Intake Registry"
            subtitle="Newest to oldest, searchable by plate, conduction, customer, company, or concern"
            right={
              <div style={styles.registrySummary}>
                <span style={styles.statusNeutral}>{filteredRecords.length} shown</span>
              </div>
            }
          >
            <div style={styles.formGroup}>
              <label style={styles.label}>Search</label>
              <input
                style={styles.input}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search plate, conduction, customer, company, phone, make, model"
              />
            </div>

            {filteredRecords.length === 0 ? (
              <div style={styles.emptyState}>No intake records found.</div>
            ) : isCompactLayout ? (
              <div style={styles.mobileCardList}>
                {filteredRecords.map((row) => (
                  <div key={row.id} style={styles.mobileDataCard}>
                    <div style={styles.mobileDataCardHeader}>
                      <strong>{row.intakeNumber}</strong>
                      <StatusBadge status={row.status} />
                    </div>
                    <div style={styles.mobileDataPrimary}>
                      {row.plateNumber || row.conductionNumber || "-"}
                    </div>
                    <div style={styles.mobileDataSecondary}>
                      {row.companyName || row.customerName || "-"}
                    </div>
                    <div style={styles.mobileDataSecondary}>
                      {[row.make, row.model, row.year, row.color].filter(Boolean).join(" • ") || "-"}
                    </div>
                    <div style={styles.mobileDataSecondary}>
                      Odometer: {row.odometerKm || "-"} km
                    </div>
                    <div style={styles.concernCard}>{row.concern}</div>
                    <div style={styles.mobileActionStack}>
                      <button
                        type="button"
                        style={styles.smallButton}
                        onClick={() => updateStatus(row.id, "Waiting Inspection")}
                      >
                        Waiting Inspection
                      </button>
                      <button
                        type="button"
                        style={styles.smallButtonMuted}
                        onClick={() => updateStatus(row.id, "Draft")}
                      >
                        Set Draft
                      </button>
                      <button
                        type="button"
                        style={styles.smallButtonSuccess}
                        onClick={() => updateStatus(row.id, "Converted to RO")}
                      >
                        Converted to RO
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Intake No.</th>
                      <th style={styles.th}>Plate / Conduction</th>
                      <th style={styles.th}>Customer / Company</th>
                      <th style={styles.th}>Vehicle</th>
                      <th style={styles.th}>Odometer</th>
                      <th style={styles.th}>Concern</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Quick Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map((row) => (
                      <tr key={row.id}>
                        <td style={styles.td}>
                          <div style={styles.tablePrimary}>{row.intakeNumber}</div>
                          <div style={styles.tableSecondary}>{formatDateTime(row.createdAt)}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.tablePrimary}>{row.plateNumber || "-"}</div>
                          <div style={styles.tableSecondary}>{row.conductionNumber || "No conduction #"}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.tablePrimary}>{row.companyName || row.customerName || "-"}</div>
                          <div style={styles.tableSecondary}>{row.customerName && row.companyName ? row.customerName : row.phone || "No phone"}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.tablePrimary}>{`${row.make} ${row.model}`.trim()}</div>
                          <div style={styles.tableSecondary}>{[row.year, row.color].filter(Boolean).join(" • ") || "-"}</div>
                        </td>
                        <td style={styles.td}>{row.odometerKm || "-"}</td>
                        <td style={styles.td}>
                          <div style={styles.concernCell}>{row.concern}</div>
                        </td>
                        <td style={styles.td}>
                          <StatusBadge status={row.status} />
                        </td>
                        <td style={styles.td}>
                          <div style={styles.inlineActionsColumn}>
                            <button
                              type="button"
                              style={styles.smallButton}
                              onClick={() => updateStatus(row.id, "Waiting Inspection")}
                            >
                              Waiting Inspection
                            </button>
                            <button
                              type="button"
                              style={styles.smallButtonMuted}
                              onClick={() => updateStatus(row.id, "Draft")}
                            >
                              Set Draft
                            </button>
                            <button
                              type="button"
                              style={styles.smallButtonSuccess}
                              onClick={() => updateStatus(row.id, "Converted to RO")}
                            >
                              Converted to RO
                            </button>
                          </div>
                        </td>
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
  );
}

export default IntakePage;

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

  formStack: { display: "flex", flexDirection: "column" as const, gap: 12 },
  formGroup: { display: "flex", flexDirection: "column" as const, gap: 4 },
  formGrid2: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  formGrid3: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 },

  label: { fontSize: 13, fontWeight: 700, color: "#374151" },

  input: {
    border: "1px solid rgba(148,163,184,0.4)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  },

  select: {
    border: "1px solid rgba(148,163,184,0.4)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    width: "100%",
    boxSizing: "border-box" as const,
  },

  textarea: {
    border: "1px solid rgba(148,163,184,0.4)",
    borderRadius: 10,
    padding: "10px 12px",
    fontSize: 14,
    color: "#0f172a",
    background: "#fff",
    outline: "none",
    width: "100%",
    minHeight: 80,
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
  },

  sectionCardMuted: {
    background: "rgba(241,245,249,0.8)",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 10,
    padding: 12,
    display: "flex",
    flexDirection: "column" as const,
    gap: 8,
  },

  sectionTitle: { fontSize: 14, fontWeight: 800, color: "#0f172a" },

  formHint: { fontSize: 12, color: "#94a3b8" },

  errorBox: {
    background: "#fee2e2",
    border: "1px solid #fca5a5",
    borderRadius: 10,
    padding: "10px 14px",
    fontSize: 13,
    color: "#991b1b",
  },

  inlineActions: { display: "flex", gap: 10, flexWrap: "wrap" as const, alignItems: "center" },
  inlineActionsColumn: { display: "flex", flexDirection: "column" as const, gap: 6 },

  stickyActionBar: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap" as const,
    alignItems: "center",
    position: "sticky" as const,
    bottom: 0,
    background: "rgba(255,255,255,0.97)",
    padding: "10px 0 4px",
  },

  primaryButton: {
    border: "none",
    borderRadius: 12,
    padding: "13px 16px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: "0 10px 24px rgba(37,99,235,0.22)",
  },

  secondaryButton: {
    border: "1px solid rgba(148,163,184,0.3)",
    borderRadius: 12,
    padding: "13px 16px",
    background: "#ffffff",
    color: "#0f172a",
    fontWeight: 700,
    cursor: "pointer",
  },

  actionButtonWide: { flex: 1 },

  smallButton: {
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },

  smallButtonMuted: {
    border: "1px solid rgba(148,163,184,0.3)",
    borderRadius: 8,
    padding: "6px 12px",
    background: "#f8fafc",
    color: "#374151",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },

  smallButtonDanger: {
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    background: "linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },

  smallButtonSuccess: {
    border: "none",
    borderRadius: 8,
    padding: "6px 12px",
    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },

  emptyState: {
    textAlign: "center" as const,
    color: "#94a3b8",
    fontSize: 14,
    padding: "32px 0",
  },

  mobileCardList: { display: "flex", flexDirection: "column" as const, gap: 12 },

  mobileDataCard: {
    background: "#f8fafc",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 12,
    padding: 14,
    display: "flex",
    flexDirection: "column" as const,
    gap: 6,
  },

  mobileDataCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 14,
  },

  mobileDataPrimary: { fontSize: 14, fontWeight: 700, color: "#0f172a" },
  mobileDataSecondary: { fontSize: 13, color: "#64748b" },

  mobileMetaRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 13,
    color: "#475569",
    gap: 8,
  },

  mobileActionStack: { display: "flex", gap: 6, flexWrap: "wrap" as const, marginTop: 4 },

  concernCard: {
    background: "#fff",
    border: "1px solid rgba(148,163,184,0.2)",
    borderRadius: 8,
    padding: "8px 10px",
    fontSize: 13,
    color: "#374151",
  },

  quickAccessRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 13,
    color: "#475569",
    gap: 8,
  },

  registrySummary: { display: "flex", gap: 8, alignItems: "center" },

  tableWrap: { overflowX: "auto" as const },

  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },

  th: {
    padding: "10px 12px",
    textAlign: "left" as const,
    fontWeight: 700,
    color: "#374151",
    borderBottom: "2px solid rgba(148,163,184,0.2)",
    whiteSpace: "nowrap" as const,
    background: "#f8fafc",
  },

  td: {
    padding: "10px 12px",
    borderBottom: "1px solid rgba(148,163,184,0.12)",
    verticalAlign: "top" as const,
  },

  tablePrimary: { fontWeight: 700, color: "#0f172a", fontSize: 13 },
  tableSecondary: { fontSize: 12, color: "#64748b", marginTop: 2 },

  concernCell: {
    fontSize: 13,
    color: "#374151",
    maxWidth: 220,
    overflow: "hidden" as const,
    textOverflow: "ellipsis" as const,
    whiteSpace: "nowrap" as const,
  },

  statusOk: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    background: "#dcfce7",
    color: "#166534",
    whiteSpace: "nowrap" as const,
  },

  statusInfo: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    background: "#dbeafe",
    color: "#1d4ed8",
    whiteSpace: "nowrap" as const,
  },

  statusWarning: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    background: "#fef3c7",
    color: "#92400e",
    whiteSpace: "nowrap" as const,
  },

  statusNeutral: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    background: "#f1f5f9",
    color: "#475569",
    whiteSpace: "nowrap" as const,
  },

  statusLocked: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "4px 10px",
    fontSize: 12,
    fontWeight: 700,
    background: "#fee2e2",
    color: "#991b1b",
    whiteSpace: "nowrap" as const,
  },
};
