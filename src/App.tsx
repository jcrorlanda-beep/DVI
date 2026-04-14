import React, { useEffect, useMemo, useState } from "react";

type UserRole =
  | "Admin"
  | "Service Advisor"
  | "Chief Technician"
  | "Senior Mechanic"
  | "General Mechanic"
  | "Office Staff"
  | "Reception"
  | "OJT";

type Permission =
  | "dashboard.view"
  | "intake.view"
  | "inspection.view"
  | "repairOrders.view"
  | "shopFloor.view"
  | "qualityControl.view"
  | "release.view"
  | "parts.view"
  | "users.view"
  | "users.manage"
  | "roles.view"
  | "roles.manage"
  | "settings.view";

type ViewKey =
  | "dashboard"
  | "intake"
  | "inspection"
  | "repairOrders"
  | "shopFloor"
  | "qualityControl"
  | "release"
  | "parts"
  | "users"
  | "roles"
  | "settings";

type RoleDefinition = {
  role: UserRole;
  permissions: Permission[];
};

type UserAccount = {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
};

type SessionUser = Omit<UserAccount, "password">;

type NavItem = {
  key: ViewKey;
  label: string;
  icon: string;
  permission: Permission;
};

type LoginForm = {
  username: string;
  password: string;
};

type UserForm = {
  fullName: string;
  username: string;
  password: string;
  role: UserRole;
  active: boolean;
};

type VehicleAccountType = "Personal" | "Company / Fleet";
type IntakeStatus = "Draft" | "Waiting Inspection" | "Converted to RO" | "Cancelled";

type IntakeRecord = {
  id: string;
  intakeNumber: string;
  createdAt: string;
  updatedAt: string;
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
  encodedBy: string;
};

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

type InspectionStatus = "In Progress" | "Completed";

type InspectionCheckValue = "Good" | "Monitor" | "Needs Attention" | "Needs Replacement" | "Not Checked";
type WarningLightState = "Off" | "On" | "Not Checked";
type RearSuspensionType = "Coil Spring" | "Leaf Spring" | "Other";
type ApprovalDecision = "Pending" | "Approved" | "Declined" | "Deferred";
type BackjobOutcome = "Customer Pay" | "Internal" | "Warranty" | "Goodwill";

type InspectionEvidenceType = "Photo" | "Video";

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

type RepairOrderSourceType = "Intake" | "Manual";
type ROStatus =
  | "Draft"
  | "Waiting Inspection"
  | "Waiting Approval"
  | "Approved / Ready to Work"
  | "In Progress"
  | "Waiting Parts"
  | "Quality Check"
  | "Ready Release"
  | "Released"
  | "Closed";

type WorkLineStatus = "Pending" | "In Progress" | "Waiting Parts" | "Completed";
type WorkLinePriority = "Low" | "Medium" | "High";

type RepairOrderWorkLine = {
  id: string;
  title: string;
  category: string;
  priority: WorkLinePriority;
  status: WorkLineStatus;
  serviceEstimate: string;
  partsEstimate: string;
  totalEstimate: string;
  notes: string;
  estimateUploadName?: string;
  recommendationSource?: string;
  approvalDecision?: ApprovalDecision;
  approvalAt?: string;
};

type RepairOrderRecord = {
  id: string;
  roNumber: string;
  createdAt: string;
  updatedAt: string;
  workStartedAt?: string;
  sourceType: RepairOrderSourceType;
  intakeId: string;
  inspectionId: string;
  intakeNumber: string;
  inspectionNumber: string;
  customerName: string;
  companyName: string;
  accountType: VehicleAccountType;
  accountLabel: string;
  phone: string;
  email: string;
  plateNumber: string;
  conductionNumber: string;
  make: string;
  model: string;
  year: string;
  color: string;
  odometerKm: string;
  customerConcern: string;
  advisorName: string;
  status: ROStatus;
  primaryTechnicianId: string;
  supportTechnicianIds: string[];
  workLines: RepairOrderWorkLine[];
  latestApprovalRecordId: string;
  deferredLineTitles: string[];
  backjobReferenceRoId: string;
  encodedBy: string;
};

type RepairOrderForm = {
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
  customerConcern: string;
  advisorName: string;
  status: ROStatus;
  primaryTechnicianId: string;
  supportTechnicianIds: string[];
  workLines: RepairOrderWorkLine[];
};

type QCResult = "Passed" | "Failed";

type QCRecord = {
  id: string;
  qcNumber: string;
  roId: string;
  roNumber: string;
  createdAt: string;
  qcBy: string;
  result: QCResult;
  allApprovedWorkCompleted: boolean;
  noLeaksOrWarningLights: boolean;
  roadTestDone: boolean;
  cleanlinessCheck: boolean;
  noNewDamage: boolean;
  toolsRemoved: boolean;
  notes: string;
};

type ReleaseRecord = {
  id: string;
  releaseNumber: string;
  roId: string;
  roNumber: string;
  createdAt: string;
  releasedBy: string;
  finalServiceAmount: string;
  finalPartsAmount: string;
  finalTotalAmount: string;
  releaseSummary: string;
  documentsReady: boolean;
  paymentSettled: boolean;
  noNewDamage: boolean;
  cleanVehicle: boolean;
  toolsRemoved: boolean;
};


type PartsRequestStatus =
  | "Draft"
  | "Requested"
  | "Sent to Suppliers"
  | "Waiting for Bids"
  | "Bidding"
  | "Supplier Selected"
  | "Ordered"
  | "Shipped"
  | "Arrived"
  | "Parts Arrived"
  | "Closed"
  | "Cancelled";

type PartsRequestUrgency = "Low" | "Medium" | "High";
type SupplierBidCondition = "Brand New" | "OEM" | "Replacement" | "Surplus";

type SupplierBid = {
  id: string;
  supplierName: string;
  brand: string;
  quantity: string;
  unitCost: string;
  totalCost: string;
  deliveryTime: string;
  warrantyNote: string;
  condition: SupplierBidCondition;
  notes: string;
  createdAt: string;
};

type PartsRequestRecord = {
  id: string;
  requestNumber: string;
  roId: string;
  roNumber: string;
  createdAt: string;
  updatedAt: string;
  requestedBy: string;
  status: PartsRequestStatus;
  partName: string;
  partNumber: string;
  quantity: string;
  urgency: PartsRequestUrgency;
  notes: string;
  customerSellingPrice: string;
  selectedBidId: string;
  plateNumber: string;
  vehicleLabel: string;
  accountLabel: string;
  bids: SupplierBid[];
};

type ApprovalWorkItem = {
  workLineId: string;
  title: string;
  decision: ApprovalDecision;
  approvedAt: string;
  note: string;
};

type ApprovalRecord = {
  id: string;
  approvalNumber: string;
  roId: string;
  roNumber: string;
  createdAt: string;
  decidedBy: string;
  customerName: string;
  customerContact: string;
  summary: string;
  communicationHook: string;
  items: ApprovalWorkItem[];
};

type BackjobRecord = {
  id: string;
  backjobNumber: string;
  linkedRoId: string;
  linkedRoNumber: string;
  createdAt: string;
  plateNumber: string;
  customerLabel: string;
  complaint: string;
  rootCause: string;
  responsibility: BackjobOutcome;
  resolutionNotes: string;
  createdBy: string;
};

type InvoiceStatus = "Draft" | "Finalized" | "Voided";
type PaymentStatus = "Unpaid" | "Partial" | "Paid";
type PaymentMethod = "Cash" | "GCash" | "Bank Transfer" | "Card" | "Charge Account / Fleet";

type InvoiceRecord = {
  id: string;
  invoiceNumber: string;
  roId: string;
  roNumber: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  laborSubtotal: string;
  partsSubtotal: string;
  discountAmount: string;
  totalAmount: string;
  status: InvoiceStatus;
  paymentStatus: PaymentStatus;
  chargeAccountApproved: boolean;
  notes: string;
};

type PaymentRecord = {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  roId: string;
  roNumber: string;
  createdAt: string;
  receivedBy: string;
  amount: string;
  method: PaymentMethod;
  referenceNumber: string;
  notes: string;
};


const BUILD_VERSION = "Phase 13M — Customer Approval UI";

const STORAGE_KEYS = {
  users: "dvi_phase1_users_v2",
  session: "dvi_phase1_session_v2",
  currentView: "dvi_phase1_current_view_v2",
  rolePermissions: "dvi_phase1_role_permissions_v2",
  intakeRecords: "dvi_phase2_intake_records_v1",
  inspectionRecords: "dvi_phase3_inspection_records_v1",
  repairOrders: "dvi_phase4_repair_orders_v1",
  qcRecords: "dvi_phase6_qc_records_v1",
  releaseRecords: "dvi_phase7_release_records_v1",
  partsRequests: "dvi_phase8_parts_requests_v1",
  approvalRecords: "dvi_phase9_approval_records_v1",
  backjobRecords: "dvi_phase9_backjob_records_v1",
  invoiceRecords: "dvi_phase10_invoice_records_v1",
  paymentRecords: "dvi_phase10_payment_records_v1",
  counters: "dvi_phase2_counters_v1",
} as const;

const ALL_ROLES: UserRole[] = [
  "Admin",
  "Service Advisor",
  "Chief Technician",
  "Senior Mechanic",
  "General Mechanic",
  "Office Staff",
  "Reception",
  "OJT",
];

const ALL_PERMISSIONS: Permission[] = [
  "dashboard.view",
  "intake.view",
  "inspection.view",
  "repairOrders.view",
  "shopFloor.view",
  "qualityControl.view",
  "release.view",
  "parts.view",
  "users.view",
  "users.manage",
  "roles.view",
  "roles.manage",
  "settings.view",
];

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "🏠", permission: "dashboard.view" },
  { key: "intake", label: "Intake", icon: "📝", permission: "intake.view" },
  { key: "inspection", label: "Inspection", icon: "🔎", permission: "inspection.view" },
  {
    key: "repairOrders",
    label: "Repair Orders",
    icon: "📋",
    permission: "repairOrders.view",
  },
  { key: "shopFloor", label: "Shop Floor", icon: "🛠️", permission: "shopFloor.view" },
  {
    key: "qualityControl",
    label: "Quality Control",
    icon: "✅",
    permission: "qualityControl.view",
  },
  { key: "release", label: "Release", icon: "🚗", permission: "release.view" },
  { key: "parts", label: "Parts", icon: "📦", permission: "parts.view" },
  { key: "users", label: "Users", icon: "👥", permission: "users.view" },
  { key: "roles", label: "Roles & Permissions", icon: "🛡️", permission: "roles.view" },
  { key: "settings", label: "Settings", icon: "⚙️", permission: "settings.view" },
];

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
  const counters = readLocalStorage<Record<string, number>>(STORAGE_KEYS.counters, {});
  const key = `${prefix}_${stamp}`;
  const next = (counters[key] ?? 0) + 1;
  counters[key] = next;
  writeLocalStorage(STORAGE_KEYS.counters, counters);
  return `${prefix}-${stamp}-${String(next).padStart(3, "0")}`;
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString();
}

function getResponsiveSpan(span: number, isCompactLayout: boolean) {
  return isCompactLayout ? "span 12" : `span ${span}`;
}

function getDefaultRoleDefinitions(): RoleDefinition[] {
  return [
    { role: "Admin", permissions: [...ALL_PERMISSIONS] },
    {
      role: "Service Advisor",
      permissions: [
        "dashboard.view",
        "intake.view",
        "inspection.view",
        "repairOrders.view",
        "shopFloor.view",
        "release.view",
        "parts.view",
      ],
    },
    {
      role: "Chief Technician",
      permissions: [
        "dashboard.view",
        "inspection.view",
        "repairOrders.view",
        "shopFloor.view",
        "qualityControl.view",
      ],
    },
    {
      role: "Senior Mechanic",
      permissions: [
        "dashboard.view",
        "inspection.view",
        "shopFloor.view",
        "qualityControl.view",
      ],
    },
    {
      role: "General Mechanic",
      permissions: ["dashboard.view", "inspection.view", "shopFloor.view"],
    },
    {
      role: "Office Staff",
      permissions: [
        "dashboard.view",
        "intake.view",
        "repairOrders.view",
        "release.view",
        "parts.view",
      ],
    },
    {
      role: "Reception",
      permissions: ["dashboard.view", "intake.view", "release.view"],
    },
    {
      role: "OJT",
      permissions: ["dashboard.view", "inspection.view", "shopFloor.view"],
    },
  ];
}

function getDefaultUsers(): UserAccount[] {
  const now = new Date().toISOString();
  return [
    {
      id: uid("usr"),
      username: "admin",
      password: "admin123",
      fullName: "System Admin",
      role: "Admin",
      active: true,
      createdAt: now,
    },
    {
      id: uid("usr"),
      username: "advisor",
      password: "advisor123",
      fullName: "Service Advisor",
      role: "Service Advisor",
      active: true,
      createdAt: now,
    },
    {
      id: uid("usr"),
      username: "chieftech",
      password: "chief123",
      fullName: "Chief Technician",
      role: "Chief Technician",
      active: true,
      createdAt: now,
    },
    {
      id: uid("usr"),
      username: "senior",
      password: "senior123",
      fullName: "Senior Mechanic",
      role: "Senior Mechanic",
      active: true,
      createdAt: now,
    },
    {
      id: uid("usr"),
      username: "mechanic",
      password: "mechanic123",
      fullName: "General Mechanic",
      role: "General Mechanic",
      active: true,
      createdAt: now,
    },
    {
      id: uid("usr"),
      username: "office",
      password: "office123",
      fullName: "Office Staff",
      role: "Office Staff",
      active: true,
      createdAt: now,
    },
    {
      id: uid("usr"),
      username: "reception",
      password: "reception123",
      fullName: "Reception Staff",
      role: "Reception",
      active: true,
      createdAt: now,
    },
    {
      id: uid("usr"),
      username: "ojt",
      password: "ojt123",
      fullName: "OJT Trainee",
      role: "OJT",
      active: true,
      createdAt: now,
    },
  ];
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

function parseMoneyInput(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
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


function getEmptyWorkLine(): RepairOrderWorkLine {
  return {
    id: uid("wl"),
    title: "",
    category: "General",
    priority: "Medium",
    status: "Pending",
    serviceEstimate: "",
    partsEstimate: "",
    totalEstimate: "0.00",
    notes: "",
    estimateUploadName: "",
    recommendationSource: "",
    approvalDecision: "Pending",
    approvalAt: "",
  };
}

function recalculateWorkLine(line: RepairOrderWorkLine): RepairOrderWorkLine {
  const total = parseMoneyInput(line.serviceEstimate) + parseMoneyInput(line.partsEstimate);
  return {
    ...line,
    totalEstimate: total.toFixed(2),
  };
}

function getDefaultRepairOrderForm(currentUserName: string): RepairOrderForm {
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
    customerConcern: "",
    advisorName: currentUserName,
    status: "Draft",
    primaryTechnicianId: "",
    supportTechnicianIds: [],
    workLines: [getEmptyWorkLine()],
  };
}

function getPartsRequestStatusStyle(status: PartsRequestStatus): React.CSSProperties {
  if (["Closed", "Parts Arrived", "Arrived"].includes(status)) return styles.statusOk;
  if (["Cancelled"].includes(status)) return styles.statusLocked;
  if (["Ordered", "Shipped", "Waiting for Bids", "Sent to Suppliers", "Bidding", "Supplier Selected"].includes(status)) return styles.statusWarning;
  return styles.statusInfo;
}

function getApprovalDecisionStyle(decision: ApprovalDecision): React.CSSProperties {
  if (decision === "Approved") return styles.statusOk;
  if (decision === "Declined") return styles.statusLocked;
  if (decision === "Deferred") return styles.statusWarning;
  return styles.statusNeutral;
}

function getPaymentStatusStyle(status: PaymentStatus): React.CSSProperties {
  if (status === "Paid") return styles.statusOk;
  if (status === "Partial") return styles.statusWarning;
  return styles.statusLocked;
}

function getInvoiceStatusStyle(status: InvoiceStatus): React.CSSProperties {
  if (status === "Finalized") return styles.statusOk;
  if (status === "Voided") return styles.statusLocked;
  return styles.statusNeutral;
}

function calculateInvoiceTotal(laborSubtotal: string, partsSubtotal: string, discountAmount: string) {
  return Math.max(parseMoneyInput(laborSubtotal) + parseMoneyInput(partsSubtotal) - parseMoneyInput(discountAmount), 0);
}

function getPaymentStatusFromAmounts(totalAmount: string, paymentTotal: number): PaymentStatus {
  const total = parseMoneyInput(totalAmount);
  if (paymentTotal <= 0) return "Unpaid";
  if (paymentTotal + 0.0001 >= total && total > 0) return "Paid";
  return "Partial";
}


function normalizeLegacyPartsStatus(status: PartsRequestStatus): PartsRequestStatus {
  if (status === "Bidding") return "Waiting for Bids";
  if (status === "Arrived") return "Parts Arrived";
  return status;
}

function parseRecommendationLines(input: string) {
  return input
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function isAttentionOrReplacement(value: InspectionCheckValue) {
  return value === "Needs Attention" || value === "Needs Replacement";
}


function getWarningLightStyle(value: WarningLightState): React.CSSProperties {
  if (value === "On") return styles.statusLocked;
  if (value === "Off") return styles.statusOk;
  return styles.statusNeutral;
}

function buildDetailedUnderHoodRecommendations(form: InspectionForm) {
  const recommendations: string[] = [];

  const push = (condition: boolean, rec: string) => {
    if (condition && !recommendations.includes(rec)) recommendations.push(rec);
  };

  push(isAttentionOrReplacement(form.engineOilLevel) || isAttentionOrReplacement(form.engineOilCondition), "Engine oil service / oil change");
  push(isAttentionOrReplacement(form.engineOilLeaks) || isAttentionOrReplacement(form.visibleEngineLeakState), "Engine oil leak inspection");
  push(isAttentionOrReplacement(form.coolantLevel) || isAttentionOrReplacement(form.coolantCondition), "Coolant service / coolant top-up and system check");
  push(isAttentionOrReplacement(form.radiatorHoseCondition) || isAttentionOrReplacement(form.coolingLeaks), "Cooling system leak and hose inspection");
  push(isAttentionOrReplacement(form.brakeFluidLevel) || isAttentionOrReplacement(form.brakeFluidCondition), "Brake fluid inspection / flush recommendation");
  push(isAttentionOrReplacement(form.powerSteeringLevel) || isAttentionOrReplacement(form.powerSteeringCondition), "Power steering fluid and hose inspection");
  push(isAttentionOrReplacement(form.batteryCondition) || isAttentionOrReplacement(form.batteryTerminalCondition), "Battery and terminal service");
  push(isAttentionOrReplacement(form.batteryHoldDownCondition), "Battery hold-down correction");
  push(isAttentionOrReplacement(form.driveBeltCondition), "Drive belt inspection / replacement");
  push(isAttentionOrReplacement(form.airFilterCondition) || isAttentionOrReplacement(form.intakeHoseCondition), "Air intake / air filter service");
  push(isAttentionOrReplacement(form.engineMountCondition), "Engine mounting inspection");
  push(isAttentionOrReplacement(form.wiringCondition), "Visible wiring / connector inspection");
  push(isAttentionOrReplacement(form.unusualSmellState) || isAttentionOrReplacement(form.unusualSoundState), "Engine noise / smell diagnosis");

  return recommendations;
}


function buildSuspensionRecommendations(form: InspectionForm) {
  const recommendations: string[] = [];

  const push = (condition: boolean, rec: string) => {
    if (condition && !recommendations.includes(rec)) recommendations.push(rec);
  };

  push(isAttentionOrReplacement(form.frontShockState), "Front shock / strut inspection or replacement");
  push(isAttentionOrReplacement(form.frontStrutMountState), "Front strut mount inspection / replacement");
  push(isAttentionOrReplacement(form.frontBallJointState), "Front ball joint inspection / replacement");
  push(isAttentionOrReplacement(form.frontTieRodEndState), "Front tie rod end inspection / replacement");
  push(isAttentionOrReplacement(form.frontRackEndState), "Front rack end inspection / replacement");
  push(isAttentionOrReplacement(form.steeringRackConditionState), "Steering rack inspection / replacement");
  push(isAttentionOrReplacement(form.frontStabilizerLinkState), "Front stabilizer link inspection / replacement");
  push(isAttentionOrReplacement(form.frontControlArmBushingState), "Front control arm bushing inspection / replacement");
  push(isAttentionOrReplacement(form.frontUpperControlArmState), "Front upper control arm inspection / replacement");
  push(isAttentionOrReplacement(form.frontLowerControlArmState), "Front lower control arm inspection / replacement");
  push(isAttentionOrReplacement(form.frontCvBootState), "CV boot inspection / service");
  push(isAttentionOrReplacement(form.frontWheelBearingState), "Front wheel bearing inspection");
  push(isAttentionOrReplacement(form.rearShockState), "Rear shock absorber inspection / replacement");
  push(isAttentionOrReplacement(form.rearStabilizerLinkState), "Rear stabilizer link inspection / replacement");
  push(isAttentionOrReplacement(form.rearBushingState), "Rear suspension bushing inspection / replacement");
  push(isAttentionOrReplacement(form.rearSpringState), "Rear spring inspection / replacement");
  push(isAttentionOrReplacement(form.rearControlArmState), "Rear control arm inspection / replacement");
  push(isAttentionOrReplacement(form.rearCoilSpringState), "Rear coil spring inspection / replacement");
  push(isAttentionOrReplacement(form.rearLeafSpringState), "Rear leaf spring inspection / replacement");
  push(isAttentionOrReplacement(form.rearLeafSpringBushingState), "Rear leaf spring bushing inspection / replacement");
  push(isAttentionOrReplacement(form.rearUBoltMountState), "Rear U-bolt / mounting inspection");
  push(isAttentionOrReplacement(form.rearAxleMountState), "Rear axle mount inspection");
  push(isAttentionOrReplacement(form.rearWheelBearingState), "Rear wheel bearing inspection");

  const suspensionCritical = [
    form.frontShockState, form.frontStrutMountState, form.frontBallJointState, form.frontTieRodEndState,
    form.frontRackEndState, form.steeringRackConditionState, form.frontStabilizerLinkState,
    form.frontControlArmBushingState, form.frontUpperControlArmState, form.frontLowerControlArmState,
    form.frontCvBootState, form.frontWheelBearingState, form.rearShockState, form.rearStabilizerLinkState,
    form.rearBushingState, form.rearSpringState, form.rearControlArmState, form.rearCoilSpringState,
    form.rearLeafSpringState, form.rearLeafSpringBushingState, form.rearUBoltMountState,
    form.rearAxleMountState, form.rearWheelBearingState,
  ].some(isAttentionOrReplacement);

  push(suspensionCritical, "Suspension check / repair");
  push(suspensionCritical || !!form.steeringFeelNotes.trim() || !!form.suspensionRoadTestNotes.trim(), "Alignment check after suspension / steering findings");

  return recommendations;
}




function buildAcRecommendations(form: InspectionForm) {
  const recommendations: string[] = [];

  const push = (condition: boolean, rec: string) => {
    if (condition && !recommendations.includes(rec)) recommendations.push(rec);
  };

  push(isAttentionOrReplacement(form.acCoolingPerformanceState) || !!form.acVentTemperature.trim(), "Air conditioning cooling performance inspection");
  push(isAttentionOrReplacement(form.acCompressorState) || isAttentionOrReplacement(form.acCondenserFanState), "A/C compressor and condenser fan inspection");
  push(isAttentionOrReplacement(form.acCabinFilterState) || isAttentionOrReplacement(form.acAirflowState), "Cabin filter / A/C airflow inspection");
  push(isAttentionOrReplacement(form.acOdorState), "A/C odor / evaporator cleaning inspection");
  push(
    [
      form.acCoolingPerformanceState,
      form.acCompressorState,
      form.acCondenserFanState,
      form.acCabinFilterState,
      form.acAirflowState,
      form.acOdorState,
    ].some(isAttentionOrReplacement) || !!form.acNotes.trim(),
    "Air conditioning system diagnosis"
  );

  return recommendations;
}


function buildElectricalRecommendations(form: InspectionForm) {
  const recommendations: string[] = [];

  const push = (condition: boolean, rec: string) => {
    if (condition && !recommendations.includes(rec)) recommendations.push(rec);
  };

  push(!!form.electricalBatteryVoltage.trim() || isAttentionOrReplacement(form.electricalStarterState), "Battery starting system check");
  push(!!form.electricalChargingVoltage.trim() || isAttentionOrReplacement(form.electricalAlternatorState), "Charging system / alternator inspection");
  push(isAttentionOrReplacement(form.electricalFuseRelayState), "Fuse and relay inspection");
  push(isAttentionOrReplacement(form.electricalWiringState), "Electrical wiring / connector inspection");
  push(isAttentionOrReplacement(form.electricalWarningLightState), "Warning light scan and diagnosis");
  push(
    [
      form.electricalStarterState,
      form.electricalAlternatorState,
      form.electricalFuseRelayState,
      form.electricalWiringState,
      form.electricalWarningLightState,
    ].some(isAttentionOrReplacement) || !!form.electricalNotes.trim(),
    "Electrical system diagnosis"
  );

  return recommendations;
}

function buildTransmissionRecommendations(form: InspectionForm) {
  const recommendations: string[] = [];

  const push = (condition: boolean, rec: string) => {
    if (condition && !recommendations.includes(rec)) recommendations.push(rec);
  };

  push(isAttentionOrReplacement(form.transmissionFluidState) || isAttentionOrReplacement(form.transmissionFluidConditionState), "Transmission fluid inspection / service");
  push(isAttentionOrReplacement(form.transmissionLeakState), "Transmission leak inspection");
  push(isAttentionOrReplacement(form.shiftingPerformanceState), "Transmission shifting diagnosis");
  push(isAttentionOrReplacement(form.clutchOperationState), "Clutch operation inspection");
  push(isAttentionOrReplacement(form.drivetrainVibrationState), "Drivetrain vibration diagnosis");
  push(isAttentionOrReplacement(form.cvJointDriveAxleState), "CV joint / drive axle inspection");
  push(isAttentionOrReplacement(form.transmissionMountState), "Transmission mount inspection");
  push(
    [
      form.transmissionFluidState,
      form.transmissionFluidConditionState,
      form.transmissionLeakState,
      form.shiftingPerformanceState,
      form.clutchOperationState,
      form.drivetrainVibrationState,
      form.cvJointDriveAxleState,
      form.transmissionMountState,
    ].some(isAttentionOrReplacement) || !!form.transmissionNotes.trim(),
    "Transmission / drivetrain diagnosis"
  );

  return recommendations;
}


function getCustomerFriendlyLineDescription(line: RepairOrderWorkLine) {
  const category = line.category?.trim() || "General Service";
  const title = line.title?.trim() || "Recommended Work";
  const lower = `${category} ${title}`.toLowerCase();

  if (lower.includes("brake")) return "Brake-related work recommended for safety and braking performance.";
  if (lower.includes("suspension")) return "Suspension work recommended to improve ride quality, stability, and safety.";
  if (lower.includes("alignment")) return "Wheel alignment is recommended to correct pull, steering angle, or uneven tire wear.";
  if (lower.includes("tire")) return "Tire-related service recommended due to tread, wear pattern, or safety condition.";
  if (lower.includes("battery") || lower.includes("electrical")) return "Electrical work recommended to address charging, starting, or warning-light concerns.";
  if (lower.includes("air") || lower.includes("a/c")) return "Air conditioning service recommended to improve cabin cooling and comfort.";
  if (lower.includes("transmission") || lower.includes("drivetrain") || lower.includes("clutch")) return "Drivetrain or transmission service recommended to address shifting, vibration, or drivability concerns.";
  if (lower.includes("cooling") || lower.includes("radiator") || lower.includes("coolant")) return "Cooling system work recommended to prevent overheating and coolant-related issues.";
  if (lower.includes("oil") || lower.includes("fluid")) return "Fluid-related service recommended to protect components and maintain vehicle reliability.";

  return `${category} service recommended based on inspection findings.`;
}

function buildCustomerApprovalMessage(ro: RepairOrderRecord | null) {
  if (!ro) return "";
  const lines = ro.workLines;
  const approved = lines.filter((line) => line.approvalDecision === "Approved");
  const deferred = lines.filter((line) => line.approvalDecision === "Deferred");
  const declined = lines.filter((line) => line.approvalDecision === "Declined");
  const pending = lines.filter((line) => (line.approvalDecision ?? "Pending") === "Pending");

  const summaryLines = lines.map((line, index) => {
    const decision = line.approvalDecision ?? "Pending";
    const amount = formatCurrency(parseMoneyInput(line.totalEstimate));
    return `${index + 1}. ${line.title || "Untitled Work Line"} — ${amount} — ${decision}`;
  });

  return [
    `Repair Order: ${ro.roNumber}`,
    `Vehicle: ${[ro.make, ro.model, ro.year].filter(Boolean).join(" ") || ro.plateNumber || ro.conductionNumber || "-"}`,
    `Plate: ${ro.plateNumber || ro.conductionNumber || "-"}`,
    `Customer: ${ro.accountLabel}`,
    "",
    "Recommended work items:",
    ...summaryLines,
    "",
    `Approved: ${approved.length}`,
    `Deferred: ${deferred.length}`,
    `Declined: ${declined.length}`,
    `Pending: ${pending.length}`,
  ].join("\n");
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


function getInspectionStatusStyle(status: InspectionStatus): React.CSSProperties {
  return status === "Completed" ? styles.statusOk : styles.statusInfo;
}

function getCheckValueStyle(value: InspectionCheckValue): React.CSSProperties {
  if (value === "Good") return styles.statusOk;
  if (value === "Needs Replacement") return styles.statusLocked;
  if (value === "Needs Attention") return styles.statusWarning;
  return styles.statusNeutral;
}

function getPermissionsForRole(role: UserRole, defs: RoleDefinition[]) {
  return defs.find((d) => d.role === role)?.permissions ?? [];
}

function hasPermission(role: UserRole, defs: RoleDefinition[], permission: Permission) {
  if (role === "Admin") return true;
  return getPermissionsForRole(role, defs).includes(permission);
}

function getAllowedNav(role: UserRole, defs: RoleDefinition[]) {
  return NAV_ITEMS.filter((item) => hasPermission(role, defs, item.permission));
}

function getDefaultViewForRole(role: UserRole, defs: RoleDefinition[]): ViewKey {
  return getAllowedNav(role, defs)[0]?.key ?? "dashboard";
}

function canAccessView(role: UserRole, defs: RoleDefinition[], view: ViewKey) {
  const nav = NAV_ITEMS.find((n) => n.key === view);
  if (!nav) return false;
  return hasPermission(role, defs, nav.permission);
}


function migrateInspectionRecord(record: InspectionRecord): InspectionRecord {
  return {
    ...record,
    underHoodState: (record as any).underHoodState ?? "Good",
    engineOilLevel: (record as any).engineOilLevel ?? "Not Checked",
    engineOilCondition: (record as any).engineOilCondition ?? "Not Checked",
    engineOilLeaks: (record as any).engineOilLeaks ?? "Not Checked",
    coolantLevel: (record as any).coolantLevel ?? "Not Checked",
    coolantCondition: (record as any).coolantCondition ?? "Not Checked",
    radiatorHoseCondition: (record as any).radiatorHoseCondition ?? "Not Checked",
    coolingLeaks: (record as any).coolingLeaks ?? "Not Checked",
    brakeFluidLevel: (record as any).brakeFluidLevel ?? "Not Checked",
    brakeFluidCondition: (record as any).brakeFluidCondition ?? "Not Checked",
    powerSteeringLevel: (record as any).powerSteeringLevel ?? "Not Checked",
    powerSteeringCondition: (record as any).powerSteeringCondition ?? "Not Checked",
    batteryCondition: (record as any).batteryCondition ?? "Not Checked",
    batteryTerminalCondition: (record as any).batteryTerminalCondition ?? "Not Checked",
    batteryHoldDownCondition: (record as any).batteryHoldDownCondition ?? "Not Checked",
    driveBeltCondition: (record as any).driveBeltCondition ?? "Not Checked",
    airFilterCondition: (record as any).airFilterCondition ?? "Not Checked",
    intakeHoseCondition: (record as any).intakeHoseCondition ?? "Not Checked",
    engineMountCondition: (record as any).engineMountCondition ?? "Not Checked",
    wiringCondition: (record as any).wiringCondition ?? "Not Checked",
    unusualSmellState: (record as any).unusualSmellState ?? "Not Checked",
    unusualSoundState: (record as any).unusualSoundState ?? "Not Checked",
    visibleEngineLeakState: (record as any).visibleEngineLeakState ?? "Not Checked",
    engineOilNotes: (record as any).engineOilNotes ?? "",
    coolantNotes: (record as any).coolantNotes ?? "",
    brakeFluidNotes: (record as any).brakeFluidNotes ?? "",
    powerSteeringNotes: (record as any).powerSteeringNotes ?? "",
    batteryNotes: (record as any).batteryNotes ?? "",
    beltNotes: (record as any).beltNotes ?? "",
    intakeNotes: (record as any).intakeNotes ?? "",
    leakNotes: (record as any).leakNotes ?? "",
    recommendationLines: (record as any).recommendationLines ?? parseRecommendationLines(record.recommendedWork || ""),
    inspectionPhotoNotes: (record as any).inspectionPhotoNotes ?? "",
    arrivalFrontPhotoNote: (record as any).arrivalFrontPhotoNote ?? "",
    arrivalDriverSidePhotoNote: (record as any).arrivalDriverSidePhotoNote ?? "",
    arrivalRearPhotoNote: (record as any).arrivalRearPhotoNote ?? "",
    arrivalPassengerSidePhotoNote: (record as any).arrivalPassengerSidePhotoNote ?? "",
    additionalFindingPhotoNotes: (record as any).additionalFindingPhotoNotes ?? [],
    enableUnderHood: (record as any).enableUnderHood ?? true,
    enableAlignmentCheck: (record as any).enableAlignmentCheck ?? false,
    enableAcCheck: (record as any).enableAcCheck ?? false,
    acVentTemperature: (record as any).acVentTemperature ?? "",
    acCoolingPerformanceState: (record as any).acCoolingPerformanceState ?? "Not Checked",
    acCompressorState: (record as any).acCompressorState ?? "Not Checked",
    acCondenserFanState: (record as any).acCondenserFanState ?? "Not Checked",
    acCabinFilterState: (record as any).acCabinFilterState ?? "Not Checked",
    acAirflowState: (record as any).acAirflowState ?? "Not Checked",
    acOdorState: (record as any).acOdorState ?? "Not Checked",
    acNotes: (record as any).acNotes ?? "",
    enableElectricalCheck: (record as any).enableElectricalCheck ?? false,
    electricalBatteryVoltage: (record as any).electricalBatteryVoltage ?? "",
    electricalChargingVoltage: (record as any).electricalChargingVoltage ?? "",
    electricalStarterState: (record as any).electricalStarterState ?? "Not Checked",
    electricalAlternatorState: (record as any).electricalAlternatorState ?? "Not Checked",
    electricalFuseRelayState: (record as any).electricalFuseRelayState ?? "Not Checked",
    electricalWiringState: (record as any).electricalWiringState ?? "Not Checked",
    electricalWarningLightState: (record as any).electricalWarningLightState ?? "Not Checked",
    electricalNotes: (record as any).electricalNotes ?? "",
    enableTransmissionCheck: (record as any).enableTransmissionCheck ?? false,
    enableScanCheck: (record as any).enableScanCheck ?? false,
    scanPerformed: (record as any).scanPerformed ?? false,
    scanToolUsed: (record as any).scanToolUsed ?? "",
    scanNotes: (record as any).scanNotes ?? "",
    scanUploadNames: (record as any).scanUploadNames ?? [],
    transmissionFluidState: (record as any).transmissionFluidState ?? "Not Checked",
    transmissionFluidConditionState: (record as any).transmissionFluidConditionState ?? "Not Checked",
    transmissionLeakState: (record as any).transmissionLeakState ?? "Not Checked",
    shiftingPerformanceState: (record as any).shiftingPerformanceState ?? "Not Checked",
    clutchOperationState: (record as any).clutchOperationState ?? "Not Checked",
    drivetrainVibrationState: (record as any).drivetrainVibrationState ?? "Not Checked",
    cvJointDriveAxleState: (record as any).cvJointDriveAxleState ?? "Not Checked",
    transmissionMountState: (record as any).transmissionMountState ?? "Not Checked",
    transmissionNotes: (record as any).transmissionNotes ?? "",
    alignmentConcernNotes: (record as any).alignmentConcernNotes ?? "",
    alignmentRecommended: (record as any).alignmentRecommended ?? false,
    alignmentBeforePrintoutName: (record as any).alignmentBeforePrintoutName ?? "",
    alignmentAfterPrintoutName: (record as any).alignmentAfterPrintoutName ?? "",
    arrivalCheckEngineLight: (record as any).arrivalCheckEngineLight ?? "Not Checked",
    arrivalAbsLight: (record as any).arrivalAbsLight ?? "Not Checked",
    arrivalAirbagLight: (record as any).arrivalAirbagLight ?? "Not Checked",
    arrivalBatteryLight: (record as any).arrivalBatteryLight ?? "Not Checked",
    arrivalOilPressureLight: (record as any).arrivalOilPressureLight ?? "Not Checked",
    arrivalTempLight: (record as any).arrivalTempLight ?? "Not Checked",
    arrivalTransmissionLight: (record as any).arrivalTransmissionLight ?? "Not Checked",
    arrivalOtherWarningLight: (record as any).arrivalOtherWarningLight ?? "Not Checked",
    arrivalOtherWarningNote: (record as any).arrivalOtherWarningNote ?? "",
    frontLeftWearPattern: (record as any).frontLeftWearPattern ?? "Even Wear",
    frontRightWearPattern: (record as any).frontRightWearPattern ?? "Even Wear",
    rearLeftWearPattern: (record as any).rearLeftWearPattern ?? "Even Wear",
    rearRightWearPattern: (record as any).rearRightWearPattern ?? "Even Wear",
    frontLeftTireState: (record as any).frontLeftTireState ?? "Not Checked",
    frontRightTireState: (record as any).frontRightTireState ?? "Not Checked",
    rearLeftTireState: (record as any).rearLeftTireState ?? "Not Checked",
    rearRightTireState: (record as any).rearRightTireState ?? "Not Checked",
    frontBrakeState: (record as any).frontBrakeState ?? "Not Checked",
    rearBrakeState: (record as any).rearBrakeState ?? "Not Checked",
    arrivalLights: (record as any).arrivalLights ?? "Not Checked",
    arrivalBrokenGlass: (record as any).arrivalBrokenGlass ?? "Not Checked",
    arrivalWipers: (record as any).arrivalWipers ?? "Not Checked",
    arrivalHorn: (record as any).arrivalHorn ?? "Not Checked",
    evidenceItems: (record as any).evidenceItems ?? [],
  };
}

function migrateRepairOrderRecord(record: RepairOrderRecord): RepairOrderRecord {
  return {
    ...record,
    workLines: (record.workLines ?? []).map((line) => ({
      ...line,
      estimateUploadName: (line as any).estimateUploadName ?? "",
      recommendationSource: (line as any).recommendationSource ?? "",
      approvalDecision: (line as any).approvalDecision ?? "Pending",
      approvalAt: (line as any).approvalAt ?? "",
      totalEstimate: recalculateWorkLine({
        ...line,
        estimateUploadName: (line as any).estimateUploadName ?? "",
        recommendationSource: (line as any).recommendationSource ?? "",
        approvalDecision: (line as any).approvalDecision ?? "Pending",
        approvalAt: (line as any).approvalAt ?? "",
      }).totalEstimate,
    })),
    latestApprovalRecordId: (record as any).latestApprovalRecordId ?? "",
    deferredLineTitles: (record as any).deferredLineTitles ?? [],
    backjobReferenceRoId: (record as any).backjobReferenceRoId ?? "",
  };
}


function migrateInvoiceRecord(record: InvoiceRecord): InvoiceRecord {
  const totalAmount = ((record as any).totalAmount ?? calculateInvoiceTotal((record as any).laborSubtotal ?? "", (record as any).partsSubtotal ?? "", (record as any).discountAmount ?? "")).toString();
  return {
    ...record,
    laborSubtotal: (record as any).laborSubtotal ?? "",
    partsSubtotal: (record as any).partsSubtotal ?? "",
    discountAmount: (record as any).discountAmount ?? "",
    totalAmount,
    status: (record as any).status ?? "Draft",
    paymentStatus: (record as any).paymentStatus ?? "Unpaid",
    chargeAccountApproved: (record as any).chargeAccountApproved ?? false,
    notes: (record as any).notes ?? "",
    updatedAt: (record as any).updatedAt ?? record.createdAt ?? new Date().toISOString(),
  };
}

function migratePaymentRecord(record: PaymentRecord): PaymentRecord {
  return {
    ...record,
    amount: (record as any).amount ?? "0",
    method: (record as any).method ?? "Cash",
    referenceNumber: (record as any).referenceNumber ?? "",
    notes: (record as any).notes ?? "",
  };
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

function StatusBadge({ status }: { status: IntakeStatus }) {
  const map: Record<IntakeStatus, React.CSSProperties> = {
    Draft: styles.statusNeutral,
    "Waiting Inspection": styles.statusInfo,
    "Converted to RO": styles.statusOk,
    Cancelled: styles.statusLocked,
  };

  return <span style={map[status]}>{status}</span>;
}

function InspectionStatusBadge({ status }: { status: InspectionStatus }) {
  return <span style={getInspectionStatusStyle(status)}>{status}</span>;
}

function ROStatusBadge({ status }: { status: ROStatus }) {
  return <span style={getROStatusStyle(status)}>{status}</span>;
}

function WorkLineStatusBadge({ status }: { status: WorkLineStatus }) {
  return <span style={getWorkLineStatusStyle(status)}>{status}</span>;
}

function PermissionPill({
  permission,
  checked,
  onToggle,
  disabled,
}: {
  permission: Permission;
  checked: boolean;
  onToggle?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={disabled}
      style={{
        ...styles.permissionPill,
        ...(checked ? styles.permissionPillOn : styles.permissionPillOff),
        ...(disabled ? styles.permissionPillDisabled : {}),
      }}
    >
      {checked ? "✓ " : ""}
      {permission}
    </button>
  );
}

function LoginScreen({
  form,
  setForm,
  error,
  onSubmit,
}: {
  form: LoginForm;
  setForm: React.Dispatch<React.SetStateAction<LoginForm>>;
  error: string;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div style={styles.loginShell}>
      <div style={styles.loginPanel}>
        <div style={styles.loginBrand}>
          <div style={styles.brandLogo}>DVI</div>
          <div>
            <div style={styles.loginTitle}>Workshop Management App</div>
            <div style={styles.loginSubtitle}>{BUILD_VERSION}</div>
          </div>
        </div>

        <div style={styles.buildNoteBox}>
          <div style={styles.buildNoteTitle}>Latest Update</div>
          <div style={styles.buildNoteText}>
            Detailed under-the-hood inspection is now added on top of approval, payment, invoice, QC, release, and reports.
          </div>
        </div>

        <form onSubmit={onSubmit} style={styles.loginForm}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              style={styles.input}
              value={form.username}
              onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
              autoComplete="username"
              placeholder="Enter username"
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              style={styles.input}
              type="password"
              value={form.password}
              onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
              autoComplete="current-password"
              placeholder="Enter password"
            />
          </div>

          {error ? <div style={styles.errorBox}>{error}</div> : null}

          <button type="submit" style={styles.primaryButton}>
            Sign In
          </button>
        </form>

        <div style={styles.updateNoteBox}><div style={styles.updateNoteTitle}>Latest Build Update</div><div style={styles.updateNoteText}>Phase 13A adds a detailed under-the-hood checklist while preserving the existing single-file workflow.</div></div><div style={styles.demoBox}>
          <div style={styles.demoTitle}>Starter Accounts</div>
          <div style={styles.demoGrid}>
            <div>admin / admin123</div>
            <div>advisor / advisor123</div>
            <div>chieftech / chief123</div>
            <div>senior / senior123</div>
            <div>mechanic / mechanic123</div>
            <div>office / office123</div>
            <div>reception / reception123</div>
            <div>ojt / ojt123</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage({
  currentUser,
  users,
  roleDefinitions,
  allowedNav,
  intakeRecords,
  repairOrders,
  qcRecords,
  releaseRecords,
  approvalRecords,
  backjobRecords,
  invoiceRecords,
  paymentRecords,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  users: UserAccount[];
  roleDefinitions: RoleDefinition[];
  allowedNav: NavItem[];
  intakeRecords: IntakeRecord[];
  repairOrders: RepairOrderRecord[];
  qcRecords: QCRecord[];
  releaseRecords: ReleaseRecord[];
  approvalRecords: ApprovalRecord[];
  backjobRecords: BackjobRecord[];
  invoiceRecords: InvoiceRecord[];
  paymentRecords: PaymentRecord[];
  isCompactLayout: boolean;
}) {
  const activeUsers = users.filter((u) => u.active);
  const userRoleCounts = ALL_ROLES.map((role) => ({
    role,
    count: activeUsers.filter((u) => u.role === role).length,
  }));

  const waitingInspection = intakeRecords.filter((row) => row.status === "Waiting Inspection").length;
  const fleetCount = intakeRecords.filter((row) => row.accountType === "Company / Fleet").length;
  const latestIntakes = intakeRecords.slice(0, 5);
  const todayKey = todayStamp();
  const releasedToday = releaseRecords.filter((row) => row.releaseNumber.includes(todayKey));
  const dailySales = releasedToday.reduce((sum, row) => sum + parseMoneyInput(row.finalTotalAmount), 0);
  const currentMonthKey = todayKey.slice(0, 6);
  const monthReleases = releaseRecords.filter((row) => row.releaseNumber.includes(currentMonthKey));
  const monthlySales = monthReleases.reduce((sum, row) => sum + parseMoneyInput(row.finalTotalAmount), 0);
  const daysWorked = Math.max(new Set(monthReleases.map((row) => row.createdAt.slice(0, 10))).size, 1);
  const daysInMonth = new Date().getDate() <= 28 ? 30 : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const monthlyProjection = (monthlySales / daysWorked) * daysInMonth;
  const qcFailures = qcRecords.filter((row) => row.result === "Failed").length;
  const approvalItems = approvalRecords.flatMap((row) => row.items);
  const approvedItems = approvalItems.filter((row) => row.decision === "Approved").length;
  const approvalRate = approvalItems.length ? Math.round((approvedItems / approvalItems.length) * 100) : 0;
  const bottleneckWaitingApproval = repairOrders.filter((row) => row.status === "Waiting Approval").length;
  const bottleneckWaitingParts = repairOrders.filter((row) => row.status === "Waiting Parts").length;
  const unpaidInvoices = invoiceRecords.filter((row) => row.paymentStatus === "Unpaid" && row.status !== "Voided").length;
  const partialInvoices = invoiceRecords.filter((row) => row.paymentStatus === "Partial" && row.status !== "Voided").length;
  const receivables = invoiceRecords
    .filter((row) => row.status !== "Voided")
    .reduce((sum, row) => {
      const paid = paymentRecords.filter((payment) => payment.invoiceId === row.id).reduce((paymentSum, payment) => paymentSum + parseMoneyInput(payment.amount), 0);
      return sum + Math.max(parseMoneyInput(row.totalAmount) - paid, 0);
    }, 0);
  const paymentsToday = paymentRecords.filter((row) => row.paymentNumber.includes(todayKey)).reduce((sum, row) => sum + parseMoneyInput(row.amount), 0);
  const paymentsThisMonth = paymentRecords
    .filter((row) => row.paymentNumber.includes(currentMonthKey))
    .reduce((sum, row) => sum + parseMoneyInput(row.amount), 0);
  const openROs = repairOrders.filter((row) => !["Released", "Closed"].includes(row.status)).length;
  const inProgressCount = repairOrders.filter((row) => row.status === "In Progress").length;
  const qcQueueCount = repairOrders.filter((row) => row.status === "Quality Check").length;
  const readyReleaseCount = repairOrders.filter((row) => row.status === "Ready Release").length;
  const releasedCount = repairOrders.filter((row) => row.status === "Released").length;
  const avgReleaseValue = monthReleases.length ? monthlySales / monthReleases.length : 0;
  const fleetShare = intakeRecords.length ? Math.round((fleetCount / intakeRecords.length) * 100) : 0;
  const techRevenueMap = users.filter((u) => u.active).map((user) => {
    const assigned = repairOrders.filter((ro) => ro.primaryTechnicianId === user.id).length;
    const active = repairOrders.filter((ro) => ro.primaryTechnicianId === user.id && ["Approved / Ready to Work", "In Progress", "Waiting Parts", "Quality Check"].includes(ro.status)).length;
    const total = repairOrders
      .filter((ro) => ro.primaryTechnicianId === user.id)
      .reduce((sum, ro) => sum + ro.workLines.reduce((lineSum, line) => lineSum + parseMoneyInput(line.serviceEstimate), 0), 0);
    const completed = repairOrders.filter((ro) => ro.primaryTechnicianId === user.id && ["Ready Release", "Released", "Closed"].includes(ro.status)).length;
    const qcFailed = qcRecords.filter((qc) => qc.result === "Failed" && repairOrders.find((ro) => ro.id === qc.roId)?.primaryTechnicianId === user.id).length;
    return { user, assigned, active, total, completed, qcFailed };
  }).sort((a,b)=>b.total-a.total).slice(0,8);

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title={`Welcome, ${currentUser.fullName}`}
            subtitle="Owner dashboard with workflow, financial, and technician reporting"
            right={<RoleBadge role={currentUser.role} />}
          >
            <div style={styles.heroText}>
              The app now includes live workflow reporting, payment and invoice metrics, technician performance, bottleneck visibility, and QC / comeback signals tied to your real repair-order pipeline.
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Active Users</div>
            <div style={styles.statValue}>{activeUsers.length}</div>
            <div style={styles.statNote}>Loaded from localStorage</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Total Intakes</div>
            <div style={styles.statValue}>{intakeRecords.length}</div>
            <div style={styles.statNote}>Phase 2 intake records</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Waiting Inspection</div>
            <div style={styles.statValue}>{waitingInspection}</div>
            <div style={styles.statNote}>Ready for the next step</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Company / Fleet</div>
            <div style={styles.statValue}>{fleetCount}</div>
            <div style={styles.statNote}>Shared company and fleet account count</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Daily Sales</div>
            <div style={styles.statValue}>{formatCurrency(dailySales)}</div>
            <div style={styles.statNote}>Released jobs for today</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Monthly Projection</div>
            <div style={styles.statValue}>{formatCurrency(monthlyProjection)}</div>
            <div style={styles.statNote}>Based on current month releases</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Approval Rate</div>
            <div style={styles.statValue}>{approvalRate}%</div>
            <div style={styles.statNote}>Approved recommendation items</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Receivables</div>
            <div style={styles.statValue}>{formatCurrency(receivables)}</div>
            <div style={styles.statNote}>Open invoice balance</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Payments Today</div>
            <div style={styles.statValue}>{formatCurrency(paymentsToday)}</div>
            <div style={styles.statNote}>{unpaidInvoices} unpaid • {partialInvoices} partial</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Open ROs</div>
            <div style={styles.statValue}>{openROs}</div>
            <div style={styles.statNote}>{inProgressCount} in progress • {qcQueueCount} in QC</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Ready Release</div>
            <div style={styles.statValue}>{readyReleaseCount}</div>
            <div style={styles.statNote}>{releasedCount} already released</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Payments This Month</div>
            <div style={styles.statValue}>{formatCurrency(paymentsThisMonth)}</div>
            <div style={styles.statNote}>Average release {formatCurrency(avgReleaseValue)}</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Fleet Mix</div>
            <div style={styles.statValue}>{fleetShare}%</div>
            <div style={styles.statNote}>Company / fleet share of intake volume</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }}>
          <Card title="User Distribution" subtitle="Active users by position">
            <div style={styles.roleGrid}>
              {userRoleCounts.map((item) => (
                <div key={item.role} style={styles.roleTile}>
                  <RoleBadge role={item.role} />
                  <strong style={styles.roleTileCount}>{item.count}</strong>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }}>
          <Card title="Current Access" subtitle="Pages available to your role">
            <div style={styles.quickAccessList}>
              {allowedNav.map((item) => (
                <div key={item.key} style={styles.quickAccessRow}>
                  <span style={styles.quickAccessIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }}>
          <Card title="Workflow Bottlenecks" subtitle="ROs waiting on next action">
            <div style={styles.quickAccessList}>
              <div style={styles.quickAccessRow}><span>Waiting Approval</span><strong>{bottleneckWaitingApproval}</strong></div>
              <div style={styles.quickAccessRow}><span>Waiting Parts</span><strong>{bottleneckWaitingParts}</strong></div>
              <div style={styles.quickAccessRow}><span>QC Failures</span><strong>{qcFailures}</strong></div>
              <div style={styles.quickAccessRow}><span>Backjobs Logged</span><strong>{backjobRecords.length}</strong></div>
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }}>
          <Card title="Technician Productivity" subtitle="Primary technician labor value, completed jobs, active workload, and QC fails">
            <div style={styles.quickAccessList}>
              {techRevenueMap.map(({ user, total, completed, active, qcFailed }) => (
                <div key={user.id} style={styles.quickAccessRow}>
                  <span>{user.fullName}</span>
                  <strong>{formatCurrency(total)} • {completed} done • {active} active • {qcFailed} QC fail</strong>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Recent Intake Activity" subtitle="Newest encoded vehicles first">
            {latestIntakes.length === 0 ? (
              <div style={styles.emptyState}>No intake records yet.</div>
            ) : isCompactLayout ? (
              <div style={styles.mobileCardList}>
                {latestIntakes.map((row) => (
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
                      {[row.make, row.model, row.year].filter(Boolean).join(" ") || "-"}
                    </div>
                    <div style={styles.mobileMetaRow}>
                      <span>Encoded</span>
                      <strong>{formatDateTime(row.createdAt)}</strong>
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
                      <th style={styles.th}>Plate</th>
                      <th style={styles.th}>Customer / Company</th>
                      <th style={styles.th}>Vehicle</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Encoded</th>
                    </tr>
                  </thead>
                  <tbody>
                    {latestIntakes.map((row) => (
                      <tr key={row.id}>
                        <td style={styles.td}>{row.intakeNumber}</td>
                        <td style={styles.td}>{row.plateNumber || row.conductionNumber || "-"}</td>
                        <td style={styles.td}>{row.companyName || row.customerName || "-"}</td>
                        <td style={styles.td}>{`${row.make} ${row.model} ${row.year}`.trim() || "-"}</td>
                        <td style={styles.td}><StatusBadge status={row.status} /></td>
                        <td style={styles.td}>{formatDateTime(row.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Your Effective Permissions" subtitle="Action restrictions use these permissions">
            <div style={styles.permissionWrap}>
              {ALL_PERMISSIONS.map((perm) => (
                <PermissionPill
                  key={perm}
                  permission={perm}
                  checked={hasPermission(currentUser.role, roleDefinitions, perm)}
                  disabled
                />
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function IntakePage({
  currentUser,
  intakeRecords,
  setIntakeRecords,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  intakeRecords: IntakeRecord[];
  setIntakeRecords: React.Dispatch<React.SetStateAction<IntakeRecord[]>>;
  isCompactLayout: boolean;
}) {
  const [form, setForm] = useState<IntakeForm>(() => getDefaultIntakeForm(currentUser.fullName));
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

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

  const resetForm = () => {
    setForm(getDefaultIntakeForm(currentUser.fullName));
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


function InspectionPage({
  currentUser,
  intakeRecords,
  inspectionRecords,
  setInspectionRecords,
  setIntakeRecords,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  intakeRecords: IntakeRecord[];
  inspectionRecords: InspectionRecord[];
  setInspectionRecords: React.Dispatch<React.SetStateAction<InspectionRecord[]>>;
  setIntakeRecords: React.Dispatch<React.SetStateAction<IntakeRecord[]>>;
  isCompactLayout: boolean;
}) {
  const [selectedIntakeId, setSelectedIntakeId] = useState("");
  const [form, setForm] = useState<InspectionForm>(() => getDefaultInspectionForm());
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const addAdditionalFindingPhotoNote = () => {
    setForm((prev) => ({
      ...prev,
      additionalFindingPhotoNotes: [...prev.additionalFindingPhotoNotes, ""],
    }));
  };

  const updateAdditionalFindingPhotoNote = (index: number, value: string) => {
    setForm((prev) => ({
      ...prev,
      additionalFindingPhotoNotes: prev.additionalFindingPhotoNotes.map((item, itemIndex) =>
        itemIndex === index ? value : item
      ),
    }));
  };

  const removeAdditionalFindingPhotoNote = (index: number) => {
    setForm((prev) => ({
      ...prev,
      additionalFindingPhotoNotes: prev.additionalFindingPhotoNotes.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addScanUploadNames = (files: FileList | null) => {
    if (!files?.length) return;
    const nextNames = Array.from(files)
      .map((file) => file.name)
      .filter(Boolean);
    setForm((prev) => ({
      ...prev,
      scanUploadNames: [...prev.scanUploadNames, ...nextNames],
      scanPerformed: true,
    }));
  };

  const removeScanUploadName = (index: number) => {
    setForm((prev) => ({
      ...prev,
      scanUploadNames: prev.scanUploadNames.filter((_, itemIndex) => itemIndex !== index),
    }));
  };


  const eligibleIntakes = useMemo(
    () => intakeRecords.filter((row) => row.status === "Waiting Inspection" || row.status === "Draft"),
    [intakeRecords]
  );

  const selectedIntake = useMemo(
    () => eligibleIntakes.find((row) => row.id === selectedIntakeId) ?? null,
    [eligibleIntakes, selectedIntakeId]
  );

  const selectedInspection = useMemo(
    () => (selectedIntake ? inspectionRecords.find((row) => row.intakeId === selectedIntake.id) ?? null : null),
    [inspectionRecords, selectedIntake]
  );

  useEffect(() => {
    if (selectedIntakeId && !eligibleIntakes.some((row) => row.id === selectedIntakeId)) {
      setSelectedIntakeId("");
    }
    if (eligibleIntakes.length === 0) {
      setSelectedIntakeId("");
    }
  }, [eligibleIntakes, selectedIntakeId]);

  useEffect(() => {
    if (selectedInspection) {
      setForm({
        status: selectedInspection.status,
        underHoodState: selectedInspection.underHoodState,
        underHoodSummary: selectedInspection.underHoodSummary,
        recommendedWork: selectedInspection.recommendedWork,
        recommendationLines: selectedInspection.recommendationLines,
        inspectionPhotoNotes: selectedInspection.inspectionPhotoNotes,
        arrivalFrontPhotoNote: selectedInspection.arrivalFrontPhotoNote,
        arrivalDriverSidePhotoNote: selectedInspection.arrivalDriverSidePhotoNote,
        arrivalRearPhotoNote: selectedInspection.arrivalRearPhotoNote,
        arrivalPassengerSidePhotoNote: selectedInspection.arrivalPassengerSidePhotoNote,
        additionalFindingPhotoNotes: selectedInspection.additionalFindingPhotoNotes,
        enableSafetyChecks: selectedInspection.enableSafetyChecks,
        enableTires: selectedInspection.enableTires,
        enableUnderHood: (selectedInspection as any).enableUnderHood ?? true,
        enableBrakes: selectedInspection.enableBrakes,
        enableSuspensionCheck: (selectedInspection as any).enableSuspensionCheck ?? false,
        enableAlignmentCheck: (selectedInspection as any).enableAlignmentCheck ?? false,
        enableAcCheck: (selectedInspection as any).enableAcCheck ?? false,
        acVentTemperature: (selectedInspection as any).acVentTemperature ?? "",
        acCoolingPerformanceState: (selectedInspection as any).acCoolingPerformanceState ?? "Not Checked",
        acCompressorState: (selectedInspection as any).acCompressorState ?? "Not Checked",
        acCondenserFanState: (selectedInspection as any).acCondenserFanState ?? "Not Checked",
        acCabinFilterState: (selectedInspection as any).acCabinFilterState ?? "Not Checked",
        acAirflowState: (selectedInspection as any).acAirflowState ?? "Not Checked",
        acOdorState: (selectedInspection as any).acOdorState ?? "Not Checked",
        acNotes: (selectedInspection as any).acNotes ?? "",
        enableElectricalCheck: (selectedInspection as any).enableElectricalCheck ?? false,
        electricalBatteryVoltage: (selectedInspection as any).electricalBatteryVoltage ?? "",
        electricalChargingVoltage: (selectedInspection as any).electricalChargingVoltage ?? "",
        electricalStarterState: (selectedInspection as any).electricalStarterState ?? "Not Checked",
        electricalAlternatorState: (selectedInspection as any).electricalAlternatorState ?? "Not Checked",
        electricalFuseRelayState: (selectedInspection as any).electricalFuseRelayState ?? "Not Checked",
        electricalWiringState: (selectedInspection as any).electricalWiringState ?? "Not Checked",
        electricalWarningLightState: (selectedInspection as any).electricalWarningLightState ?? "Not Checked",
        electricalNotes: (selectedInspection as any).electricalNotes ?? "",
        enableTransmissionCheck: (selectedInspection as any).enableTransmissionCheck ?? false,
        enableScanCheck: (selectedInspection as any).enableScanCheck ?? false,
        scanPerformed: (selectedInspection as any).scanPerformed ?? false,
        scanToolUsed: (selectedInspection as any).scanToolUsed ?? "",
        scanNotes: (selectedInspection as any).scanNotes ?? "",
        scanUploadNames: (selectedInspection as any).scanUploadNames ?? [],
        transmissionFluidState: (selectedInspection as any).transmissionFluidState ?? "Not Checked",
        transmissionFluidConditionState: (selectedInspection as any).transmissionFluidConditionState ?? "Not Checked",
        transmissionLeakState: (selectedInspection as any).transmissionLeakState ?? "Not Checked",
        shiftingPerformanceState: (selectedInspection as any).shiftingPerformanceState ?? "Not Checked",
        clutchOperationState: (selectedInspection as any).clutchOperationState ?? "Not Checked",
        drivetrainVibrationState: (selectedInspection as any).drivetrainVibrationState ?? "Not Checked",
        cvJointDriveAxleState: (selectedInspection as any).cvJointDriveAxleState ?? "Not Checked",
        transmissionMountState: (selectedInspection as any).transmissionMountState ?? "Not Checked",
        transmissionNotes: (selectedInspection as any).transmissionNotes ?? "",
        alignmentConcernNotes: (selectedInspection as any).alignmentConcernNotes ?? "",
        alignmentRecommended: (selectedInspection as any).alignmentRecommended ?? false,
        alignmentBeforePrintoutName: (selectedInspection as any).alignmentBeforePrintoutName ?? "",
        alignmentAfterPrintoutName: (selectedInspection as any).alignmentAfterPrintoutName ?? "",
        arrivalLights: selectedInspection.arrivalLights,
        arrivalBrokenGlass: selectedInspection.arrivalBrokenGlass,
        arrivalWipers: selectedInspection.arrivalWipers,
        arrivalHorn: selectedInspection.arrivalHorn,
        arrivalCheckEngineLight: (selectedInspection as any).arrivalCheckEngineLight ?? "Not Checked",
        arrivalAbsLight: (selectedInspection as any).arrivalAbsLight ?? "Not Checked",
        arrivalAirbagLight: (selectedInspection as any).arrivalAirbagLight ?? "Not Checked",
        arrivalBatteryLight: (selectedInspection as any).arrivalBatteryLight ?? "Not Checked",
        arrivalOilPressureLight: (selectedInspection as any).arrivalOilPressureLight ?? "Not Checked",
        arrivalTempLight: (selectedInspection as any).arrivalTempLight ?? "Not Checked",
        arrivalTransmissionLight: (selectedInspection as any).arrivalTransmissionLight ?? "Not Checked",
        arrivalOtherWarningLight: (selectedInspection as any).arrivalOtherWarningLight ?? "Not Checked",
        arrivalOtherWarningNote: (selectedInspection as any).arrivalOtherWarningNote ?? "",
        frontLeftTreadMm: selectedInspection.frontLeftTreadMm,
        frontRightTreadMm: selectedInspection.frontRightTreadMm,
        rearLeftTreadMm: selectedInspection.rearLeftTreadMm,
        rearRightTreadMm: selectedInspection.rearRightTreadMm,
        frontLeftWearPattern: (selectedInspection as any).frontLeftWearPattern ?? "Even Wear",
        frontRightWearPattern: (selectedInspection as any).frontRightWearPattern ?? "Even Wear",
        rearLeftWearPattern: (selectedInspection as any).rearLeftWearPattern ?? "Even Wear",
        rearRightWearPattern: (selectedInspection as any).rearRightWearPattern ?? "Even Wear",
        frontLeftTireState: selectedInspection.frontLeftTireState,
        frontRightTireState: selectedInspection.frontRightTireState,
        rearLeftTireState: selectedInspection.rearLeftTireState,
        rearRightTireState: selectedInspection.rearRightTireState,
        frontBrakeCondition: selectedInspection.frontBrakeCondition,
        rearBrakeCondition: selectedInspection.rearBrakeCondition,
        frontBrakeState: selectedInspection.frontBrakeState,
        rearBrakeState: selectedInspection.rearBrakeState,
        inspectionNotes: selectedInspection.inspectionNotes,
        engineOilLevel: selectedInspection.engineOilLevel,
        engineOilCondition: selectedInspection.engineOilCondition,
        engineOilLeaks: selectedInspection.engineOilLeaks,
        coolantLevel: selectedInspection.coolantLevel,
        coolantCondition: selectedInspection.coolantCondition,
        radiatorHoseCondition: selectedInspection.radiatorHoseCondition,
        coolingLeaks: selectedInspection.coolingLeaks,
        brakeFluidLevel: selectedInspection.brakeFluidLevel,
        brakeFluidCondition: selectedInspection.brakeFluidCondition,
        powerSteeringLevel: selectedInspection.powerSteeringLevel,
        powerSteeringCondition: selectedInspection.powerSteeringCondition,
        batteryCondition: selectedInspection.batteryCondition,
        batteryTerminalCondition: selectedInspection.batteryTerminalCondition,
        batteryHoldDownCondition: selectedInspection.batteryHoldDownCondition,
        driveBeltCondition: selectedInspection.driveBeltCondition,
        airFilterCondition: selectedInspection.airFilterCondition,
        intakeHoseCondition: selectedInspection.intakeHoseCondition,
        engineMountCondition: selectedInspection.engineMountCondition,
        wiringCondition: selectedInspection.wiringCondition,
        unusualSmellState: selectedInspection.unusualSmellState,
        unusualSoundState: selectedInspection.unusualSoundState,
        visibleEngineLeakState: selectedInspection.visibleEngineLeakState,
        engineOilNotes: selectedInspection.engineOilNotes,
        coolantNotes: selectedInspection.coolantNotes,
        brakeFluidNotes: selectedInspection.brakeFluidNotes,
        powerSteeringNotes: selectedInspection.powerSteeringNotes,
        batteryNotes: selectedInspection.batteryNotes,
        beltNotes: selectedInspection.beltNotes,
        intakeNotes: selectedInspection.intakeNotes,
        leakNotes: selectedInspection.leakNotes,
        frontShockState: (selectedInspection as any).frontShockState ?? "Not Checked",
        frontBallJointState: (selectedInspection as any).frontBallJointState ?? "Not Checked",
        frontTieRodEndState: (selectedInspection as any).frontTieRodEndState ?? "Not Checked",
        frontRackEndState: (selectedInspection as any).frontRackEndState ?? "Not Checked",
        frontStabilizerLinkState: (selectedInspection as any).frontStabilizerLinkState ?? "Not Checked",
        frontControlArmBushingState: (selectedInspection as any).frontControlArmBushingState ?? "Not Checked",
        frontUpperControlArmState: (selectedInspection as any).frontUpperControlArmState ?? "Not Checked",
        frontLowerControlArmState: (selectedInspection as any).frontLowerControlArmState ?? "Not Checked",
        frontStrutMountState: (selectedInspection as any).frontStrutMountState ?? "Not Checked",
        steeringRackConditionState: (selectedInspection as any).steeringRackConditionState ?? "Not Checked",
        frontCvBootState: (selectedInspection as any).frontCvBootState ?? "Not Checked",
        frontWheelBearingState: (selectedInspection as any).frontWheelBearingState ?? "Not Checked",
        rearSuspensionType: (selectedInspection as any).rearSuspensionType ?? "Coil Spring",
        rearShockState: (selectedInspection as any).rearShockState ?? "Not Checked",
        rearStabilizerLinkState: (selectedInspection as any).rearStabilizerLinkState ?? "Not Checked",
        rearBushingState: (selectedInspection as any).rearBushingState ?? "Not Checked",
        rearSpringState: (selectedInspection as any).rearSpringState ?? "Not Checked",
        rearControlArmState: (selectedInspection as any).rearControlArmState ?? "Not Checked",
        rearCoilSpringState: (selectedInspection as any).rearCoilSpringState ?? "Not Checked",
        rearLeafSpringState: (selectedInspection as any).rearLeafSpringState ?? "Not Checked",
        rearLeafSpringBushingState: (selectedInspection as any).rearLeafSpringBushingState ?? "Not Checked",
        rearUBoltMountState: (selectedInspection as any).rearUBoltMountState ?? "Not Checked",
        rearAxleMountState: (selectedInspection as any).rearAxleMountState ?? "Not Checked",
        rearWheelBearingState: (selectedInspection as any).rearWheelBearingState ?? "Not Checked",
        frontSuspensionNotes: (selectedInspection as any).frontSuspensionNotes ?? "",
        rearSuspensionNotes: (selectedInspection as any).rearSuspensionNotes ?? "",
        steeringFeelNotes: (selectedInspection as any).steeringFeelNotes ?? "",
        suspensionRoadTestNotes: (selectedInspection as any).suspensionRoadTestNotes ?? "",
        evidenceItems: (selectedInspection as any).evidenceItems ?? [],
      });
      setError("");
      return;
    }
    setForm(getDefaultInspectionForm());
    setError("");
  }, [selectedInspection, selectedIntakeId]);

  const filteredInspectionRecords = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return inspectionRecords;
    return inspectionRecords.filter((row) =>
      [
        row.inspectionNumber,
        row.intakeNumber,
        row.plateNumber,
        row.conductionNumber,
        row.accountLabel,
        row.make,
        row.model,
        row.concern,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [inspectionRecords, search]);

  const autoRecommendations = useMemo(() => {
    const detailed = buildDetailedUnderHoodRecommendations(form);
    const typed = parseRecommendationLines(form.recommendedWork);
    const suspension = buildSuspensionRecommendations(form);
    const ac = buildAcRecommendations(form);
    const electrical = buildElectricalRecommendations(form);
    const transmission = buildTransmissionRecommendations(form);
    const alignment = form.alignmentRecommended || form.alignmentConcernNotes.trim() ? ["Wheel Alignment"] : [];
    return [...new Set([...typed, ...detailed, ...suspension, ...ac, ...electrical, ...transmission, ...alignment])];
  }, [form]);

  const overallItems = [
    form.underHoodState,
    form.engineOilLevel,
    form.engineOilCondition,
    form.engineOilLeaks,
    form.coolantLevel,
    form.coolantCondition,
    form.radiatorHoseCondition,
    form.coolingLeaks,
    form.brakeFluidLevel,
    form.brakeFluidCondition,
    form.powerSteeringLevel,
    form.powerSteeringCondition,
    form.batteryCondition,
    form.batteryTerminalCondition,
    form.batteryHoldDownCondition,
    form.driveBeltCondition,
    form.airFilterCondition,
    form.intakeHoseCondition,
    form.engineMountCondition,
    form.wiringCondition,
    form.unusualSmellState,
    form.unusualSoundState,
    form.visibleEngineLeakState,
  ];

  const overallUnderhoodLabel = overallItems.includes("Needs Replacement")
    ? "Needs Replacement"
    : overallItems.includes("Needs Attention")
      ? "Needs Attention"
      : overallItems.includes("Monitor")
        ? "Monitor"
        : overallItems.includes("Good")
          ? "Good"
          : "Not Checked";

  const fluidsFields: Array<[string, keyof InspectionForm]> = [
    ["Engine Oil Level", "engineOilLevel"],
    ["Engine Oil Condition", "engineOilCondition"],
    ["Engine Oil Leaks", "engineOilLeaks"],
    ["Coolant Level", "coolantLevel"],
    ["Coolant Condition", "coolantCondition"],
    ["Radiator Hose Condition", "radiatorHoseCondition"],
    ["Cooling Leaks", "coolingLeaks"],
    ["Brake Fluid Level", "brakeFluidLevel"],
    ["Brake Fluid Condition", "brakeFluidCondition"],
    ["Power Steering Level", "powerSteeringLevel"],
    ["Power Steering Condition", "powerSteeringCondition"],
  ];

  const supportFields: Array<[string, keyof InspectionForm]> = [
    ["Battery Condition", "batteryCondition"],
    ["Battery Terminals", "batteryTerminalCondition"],
    ["Battery Hold-Down", "batteryHoldDownCondition"],
    ["Drive Belt Condition", "driveBeltCondition"],
    ["Air Filter Condition", "airFilterCondition"],
    ["Intake Hose Condition", "intakeHoseCondition"],
  ];

  const watchFields: Array<[string, keyof InspectionForm]> = [
    ["Engine Mount Condition", "engineMountCondition"],
    ["Visible Wiring / Connectors", "wiringCondition"],
    ["Unusual Smell", "unusualSmellState"],
    ["Unusual Sound", "unusualSoundState"],
    ["Visible Engine Leak", "visibleEngineLeakState"],
  ];

  const saveInspection = (nextStatus?: InspectionStatus) => {
    if (!selectedIntake) {
      setError("Select an intake record first.");
      return;
    }

    const underHoodSummary = form.underHoodSummary.trim();
    if (!underHoodSummary) {
      setError("Under the hood summary is required.");
      return;
    }

    const recommendationLines = autoRecommendations;
    const requiresPhotoEvidence =
      overallItems.includes("Needs Attention") ||
      [
        form.arrivalLights,
        form.arrivalBrokenGlass,
        form.arrivalWipers,
        form.arrivalHorn,
        form.frontLeftTireState,
        form.frontRightTireState,
        form.rearLeftTireState,
        form.rearRightTireState,
        form.frontBrakeState,
        form.rearBrakeState,
        form.frontShockState,
        form.frontBallJointState,
        form.frontTieRodEndState,
        form.frontRackEndState,
        form.frontStabilizerLinkState,
        form.frontControlArmBushingState,
        form.frontUpperControlArmState,
        form.frontLowerControlArmState,
        form.frontStrutMountState,
        form.steeringRackConditionState,
        form.frontCvBootState,
        form.frontWheelBearingState,
        form.rearShockState,
        form.rearStabilizerLinkState,
        form.rearBushingState,
        form.rearSpringState,
        form.rearControlArmState,
        form.rearCoilSpringState,
        form.rearLeafSpringState,
        form.rearLeafSpringBushingState,
        form.rearUBoltMountState,
        form.rearAxleMountState,
        form.rearWheelBearingState,
        form.acCoolingPerformanceState,
        form.acCompressorState,
        form.acCondenserFanState,
        form.acCabinFilterState,
        form.acAirflowState,
        form.acOdorState,
        form.electricalStarterState,
        form.electricalAlternatorState,
        form.electricalFuseRelayState,
        form.electricalWiringState,
        form.electricalWarningLightState,
        form.transmissionFluidState,
        form.transmissionFluidConditionState,
        form.transmissionLeakState,
        form.shiftingPerformanceState,
        form.clutchOperationState,
        form.drivetrainVibrationState,
        form.cvJointDriveAxleState,
        form.transmissionMountState,
      ].some((value) => value === "Needs Attention" || value === "Needs Replacement");

    if (requiresPhotoEvidence && !form.inspectionPhotoNotes.trim() && form.evidenceItems.length === 0) {
      setError("Photo or video evidence is required when critical findings need attention or replacement.");
      return;
    }

    const now = new Date().toISOString();
    const baseRecord = {
      intakeId: selectedIntake.id,
      intakeNumber: selectedIntake.intakeNumber,
      updatedAt: now,
      status: nextStatus ?? form.status,
      accountLabel: selectedIntake.companyName || selectedIntake.customerName || "Unknown Customer",
      plateNumber: selectedIntake.plateNumber,
      conductionNumber: selectedIntake.conductionNumber,
      make: selectedIntake.make,
      model: selectedIntake.model,
      year: selectedIntake.year,
      color: selectedIntake.color,
      odometerKm: selectedIntake.odometerKm,
      concern: selectedIntake.concern,
      underHoodState: form.underHoodState,
      underHoodSummary,
      recommendedWork: autoRecommendations.join("\n"),
      recommendationLines,
      inspectionPhotoNotes: form.inspectionPhotoNotes.trim(),
      arrivalFrontPhotoNote: form.arrivalFrontPhotoNote.trim(),
      arrivalDriverSidePhotoNote: form.arrivalDriverSidePhotoNote.trim(),
      arrivalRearPhotoNote: form.arrivalRearPhotoNote.trim(),
      arrivalPassengerSidePhotoNote: form.arrivalPassengerSidePhotoNote.trim(),
      additionalFindingPhotoNotes: form.additionalFindingPhotoNotes.map((item) => item.trim()).filter(Boolean),
      enableSafetyChecks: form.enableSafetyChecks,
      enableTires: form.enableTires,
      enableUnderHood: form.enableUnderHood,
      enableBrakes: form.enableBrakes,
      enableSuspensionCheck: form.enableSuspensionCheck,
      enableAlignmentCheck: form.enableAlignmentCheck,
      enableAcCheck: form.enableAcCheck,
      acVentTemperature: form.acVentTemperature.trim(),
      acCoolingPerformanceState: form.acCoolingPerformanceState,
      acCompressorState: form.acCompressorState,
      acCondenserFanState: form.acCondenserFanState,
      acCabinFilterState: form.acCabinFilterState,
      acAirflowState: form.acAirflowState,
      acOdorState: form.acOdorState,
      acNotes: form.acNotes.trim(),
      enableElectricalCheck: form.enableElectricalCheck,
      electricalBatteryVoltage: form.electricalBatteryVoltage.trim(),
      electricalChargingVoltage: form.electricalChargingVoltage.trim(),
      electricalStarterState: form.electricalStarterState,
      electricalAlternatorState: form.electricalAlternatorState,
      electricalFuseRelayState: form.electricalFuseRelayState,
      electricalWiringState: form.electricalWiringState,
      electricalWarningLightState: form.electricalWarningLightState,
      electricalNotes: form.electricalNotes.trim(),
      enableTransmissionCheck: form.enableTransmissionCheck,
      enableScanCheck: form.enableScanCheck,
      scanPerformed: form.scanPerformed,
      scanToolUsed: form.scanToolUsed.trim(),
      scanNotes: form.scanNotes.trim(),
      scanUploadNames: form.scanUploadNames,
      transmissionFluidState: form.transmissionFluidState,
      transmissionFluidConditionState: form.transmissionFluidConditionState,
      transmissionLeakState: form.transmissionLeakState,
      shiftingPerformanceState: form.shiftingPerformanceState,
      clutchOperationState: form.clutchOperationState,
      drivetrainVibrationState: form.drivetrainVibrationState,
      cvJointDriveAxleState: form.cvJointDriveAxleState,
      transmissionMountState: form.transmissionMountState,
      transmissionNotes: form.transmissionNotes.trim(),
      alignmentConcernNotes: form.alignmentConcernNotes.trim(),
      alignmentRecommended: form.alignmentRecommended,
      alignmentBeforePrintoutName: form.alignmentBeforePrintoutName.trim(),
      alignmentAfterPrintoutName: form.alignmentAfterPrintoutName.trim(),
      arrivalLights: form.arrivalLights,
      arrivalBrokenGlass: form.arrivalBrokenGlass,
      arrivalWipers: form.arrivalWipers,
      arrivalHorn: form.arrivalHorn,
      arrivalCheckEngineLight: form.arrivalCheckEngineLight,
      arrivalAbsLight: form.arrivalAbsLight,
      arrivalAirbagLight: form.arrivalAirbagLight,
      arrivalBatteryLight: form.arrivalBatteryLight,
      arrivalOilPressureLight: form.arrivalOilPressureLight,
      arrivalTempLight: form.arrivalTempLight,
      arrivalTransmissionLight: form.arrivalTransmissionLight,
      arrivalOtherWarningLight: form.arrivalOtherWarningLight,
      arrivalOtherWarningNote: form.arrivalOtherWarningNote.trim(),
      frontLeftTreadMm: form.frontLeftTreadMm.trim(),
      frontRightTreadMm: form.frontRightTreadMm.trim(),
      rearLeftTreadMm: form.rearLeftTreadMm.trim(),
      rearRightTreadMm: form.rearRightTreadMm.trim(),
      frontLeftWearPattern: form.frontLeftWearPattern,
      frontRightWearPattern: form.frontRightWearPattern,
      rearLeftWearPattern: form.rearLeftWearPattern,
      rearRightWearPattern: form.rearRightWearPattern,
      frontLeftTireState: form.frontLeftTireState,
      frontRightTireState: form.frontRightTireState,
      rearLeftTireState: form.rearLeftTireState,
      rearRightTireState: form.rearRightTireState,
      frontBrakeCondition: form.frontBrakeCondition.trim(),
      rearBrakeCondition: form.rearBrakeCondition.trim(),
      frontBrakeState: form.frontBrakeState,
      rearBrakeState: form.rearBrakeState,
      frontShockState: form.frontShockState,
      frontBallJointState: form.frontBallJointState,
      frontTieRodEndState: form.frontTieRodEndState,
      frontRackEndState: form.frontRackEndState,
      frontStabilizerLinkState: form.frontStabilizerLinkState,
      frontControlArmBushingState: form.frontControlArmBushingState,
      frontUpperControlArmState: form.frontUpperControlArmState,
      frontLowerControlArmState: form.frontLowerControlArmState,
      frontStrutMountState: form.frontStrutMountState,
      steeringRackConditionState: form.steeringRackConditionState,
      frontCvBootState: form.frontCvBootState,
      frontWheelBearingState: form.frontWheelBearingState,
      rearSuspensionType: form.rearSuspensionType,
      rearShockState: form.rearShockState,
      rearStabilizerLinkState: form.rearStabilizerLinkState,
      rearBushingState: form.rearBushingState,
      rearSpringState: form.rearSpringState,
      rearControlArmState: form.rearControlArmState,
      rearCoilSpringState: form.rearCoilSpringState,
      rearLeafSpringState: form.rearLeafSpringState,
      rearLeafSpringBushingState: form.rearLeafSpringBushingState,
      rearUBoltMountState: form.rearUBoltMountState,
      rearAxleMountState: form.rearAxleMountState,
      rearWheelBearingState: form.rearWheelBearingState,
      frontSuspensionNotes: form.frontSuspensionNotes.trim(),
      rearSuspensionNotes: form.rearSuspensionNotes.trim(),
      steeringFeelNotes: form.steeringFeelNotes.trim(),
      suspensionRoadTestNotes: form.suspensionRoadTestNotes.trim(),
      inspectionNotes: form.inspectionNotes.trim(),
      engineOilLevel: form.engineOilLevel,
      engineOilCondition: form.engineOilCondition,
      engineOilLeaks: form.engineOilLeaks,
      coolantLevel: form.coolantLevel,
      coolantCondition: form.coolantCondition,
      radiatorHoseCondition: form.radiatorHoseCondition,
      coolingLeaks: form.coolingLeaks,
      brakeFluidLevel: form.brakeFluidLevel,
      brakeFluidCondition: form.brakeFluidCondition,
      powerSteeringLevel: form.powerSteeringLevel,
      powerSteeringCondition: form.powerSteeringCondition,
      batteryCondition: form.batteryCondition,
      batteryTerminalCondition: form.batteryTerminalCondition,
      batteryHoldDownCondition: form.batteryHoldDownCondition,
      driveBeltCondition: form.driveBeltCondition,
      airFilterCondition: form.airFilterCondition,
      intakeHoseCondition: form.intakeHoseCondition,
      engineMountCondition: form.engineMountCondition,
      wiringCondition: form.wiringCondition,
      unusualSmellState: form.unusualSmellState,
      unusualSoundState: form.unusualSoundState,
      visibleEngineLeakState: form.visibleEngineLeakState,
      engineOilNotes: form.engineOilNotes.trim(),
      coolantNotes: form.coolantNotes.trim(),
      brakeFluidNotes: form.brakeFluidNotes.trim(),
      powerSteeringNotes: form.powerSteeringNotes.trim(),
      batteryNotes: form.batteryNotes.trim(),
      beltNotes: form.beltNotes.trim(),
      intakeNotes: form.intakeNotes.trim(),
      leakNotes: form.leakNotes.trim(),
      evidenceItems: form.evidenceItems,
    };

    setInspectionRecords((prev) => {
      const existing = prev.find((row) => row.intakeId === selectedIntake.id);
      if (existing) {
        return prev.map((row) => (row.intakeId === selectedIntake.id ? { ...row, ...baseRecord } : row));
      }

      const created: InspectionRecord = {
        id: uid("insp"),
        inspectionNumber: nextDailyNumber("INSP"),
        createdAt: now,
        startedBy: currentUser.fullName,
        ...baseRecord,
      };

      return [created, ...prev];
    });

    setIntakeRecords((prev) =>
      prev.map((row) =>
        row.id === selectedIntake.id
          ? { ...row, status: "Waiting Inspection", updatedAt: now }
          : row
      )
    );

    setForm((prev) => ({ ...prev, status: nextStatus ?? prev.status }));
    setError("");
  };

  const renderCheckCard = (
    title: string,
    subtitle: string,
    fields: Array<[string, keyof InspectionForm]>,
    noteFields?: Array<[string, keyof InspectionForm, string]>
  ) => (
    <div style={{ ...styles.sectionCardMuted, borderRadius: 16 }}>
      <div style={styles.mobileDataCardHeader}>
        <strong>{title}</strong>
        <span style={styles.statusNeutral}>{subtitle}</span>
      </div>
      <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
        {fields.map(([label, key]) => (
          <div key={String(key)} style={styles.formGroup}>
            <label style={styles.label}>{label}</label>
            <select
              style={styles.select}
              value={form[key] as string}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  [key]: e.target.value as InspectionCheckValue,
                }))
              }
            >
              <option value="Not Checked">Not Checked</option>
              <option value="Good">Good</option>
              <option value="Monitor">Monitor</option>
              <option value="Needs Attention">Needs Attention</option>
                          <option value="Needs Replacement">Needs Replacement</option>
            </select>
          </div>
        ))}
      </div>
      {noteFields?.length ? (
        <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
          {noteFields.map(([label, key, placeholder]) => (
            <div key={String(key)} style={styles.formGroup}>
              <label style={styles.label}>{label}</label>
              <input
                style={styles.input}
                value={(form[key] as string) || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        {!selectedIntake ? (
          <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }}>
            <Card
              title="Inspection Queue"
              subtitle="Safety check is first. Tires are second by default."
              right={<span style={styles.statusInfo}>{eligibleIntakes.length} in queue</span>}
            >
              {eligibleIntakes.length === 0 ? (
                <div style={styles.emptyState}>No intake records ready for inspection.</div>
              ) : (
                <div style={styles.queueStack}>
                  {eligibleIntakes.map((row) => {
                    const hasInspection = inspectionRecords.some((item) => item.intakeId === row.id);
                    return (
                      <button
                        key={row.id}
                        type="button"
                        onClick={() => setSelectedIntakeId(row.id)}
                        style={styles.queueCard}
                      >
                        <div style={styles.queueCardHeader}>
                          <strong>{row.intakeNumber}</strong>
                          {hasInspection ? <span style={styles.statusNeutral}>Started</span> : <span style={styles.statusInfo}>New</span>}
                        </div>
                        <div style={styles.queueLine}>{row.plateNumber || row.conductionNumber || "-"}</div>
                        <div style={styles.queueLineMuted}>{row.companyName || row.customerName || "-"}</div>
                        <div style={styles.queueLineMuted}>{[row.make, row.model, row.year].filter(Boolean).join(" • ")}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        ) : null}

        <div style={{ ...styles.gridItem, gridColumn: !selectedIntake ? getResponsiveSpan(8, isCompactLayout) : "span 12" }}>
          <Card
            title="Inspection Form"
            subtitle="Safety first, tires second, under the hood always included, brakes triggered"
            right={selectedIntake ? (<div style={styles.inlineActions}><button type="button" style={styles.secondaryButton} onClick={() => { setSelectedIntakeId(""); setError(""); }}>Change Vehicle</button>{selectedInspection ? <InspectionStatusBadge status={selectedInspection.status} /> : <span style={styles.statusNeutral}>Not started</span>}</div>) : (selectedInspection ? <InspectionStatusBadge status={selectedInspection.status} /> : <span style={styles.statusNeutral}>Not started</span>)}
          >
            {!selectedIntake ? (
              <div style={styles.emptyState}>Select an intake from the queue to start inspection.</div>
            ) : (
              <div style={styles.formStack}>
                <div style={styles.grid}>
                  <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }}>
                    <div style={{ ...styles.sectionCard, position: isCompactLayout ? "static" : "sticky", top: 16 }}>
                      <div style={styles.sectionTitle}>Vehicle & Inspection Summary</div>
                      <div style={styles.summaryGrid}>
                        <div><strong>Intake No.</strong><div>{selectedIntake.intakeNumber}</div></div>
                        <div><strong>Status</strong><div>{form.status}</div></div>
                        <div><strong>Plate</strong><div>{selectedIntake.plateNumber || "-"}</div></div>
                        <div><strong>Conduction</strong><div>{selectedIntake.conductionNumber || "-"}</div></div>
                        <div><strong>Customer</strong><div>{selectedIntake.companyName || selectedIntake.customerName || "-"}</div></div>
                        <div><strong>Vehicle</strong><div>{[selectedIntake.make, selectedIntake.model, selectedIntake.year].filter(Boolean).join(" ") || "-"}</div></div>
                        <div><strong>Odometer</strong><div>{selectedIntake.odometerKm || "-"}</div></div>
                        <div><strong>Overall Under Hood</strong><div><span style={getCheckValueStyle(overallUnderhoodLabel as InspectionCheckValue)}>{overallUnderhoodLabel}</span></div></div>
                      </div>

                      <div style={styles.concernBanner}>
                        <strong>Concern:</strong> {selectedIntake.concern}
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Inspection Status</label>
                        <select
                          style={styles.select}
                          value={form.status}
                          onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as InspectionStatus }))}
                        >
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Overall Under the Hood State</label>
                        <select
                          style={styles.select}
                          value={form.underHoodState}
                          onChange={(e) => setForm((prev) => ({ ...prev, underHoodState: e.target.value as InspectionCheckValue }))}
                        >
                          <option value="Good">Good</option>
                          <option value="Monitor">Monitor</option>
                          <option value="Needs Attention">Needs Attention</option>
                          <option value="Needs Replacement">Needs Replacement</option>
                        </select>
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Photo Evidence / Photo Notes</label>
                        <input
                          style={styles.input}
                          value={form.inspectionPhotoNotes}
                          onChange={(e) => setForm((prev) => ({ ...prev, inspectionPhotoNotes: e.target.value }))}
                          placeholder="File names, camera refs, or note about captured photos"
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Under the Hood Summary</label>
                        <textarea
                          style={styles.textareaLarge}
                          value={form.underHoodSummary}
                          onChange={(e) => setForm((prev) => ({ ...prev, underHoodSummary: e.target.value }))}
                          placeholder="Required technician write-up"
                        />
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Recommended Work / Findings</label>
                        <textarea
                          style={styles.textarea}
                          value={form.recommendedWork}
                          onChange={(e) => setForm((prev) => ({ ...prev, recommendedWork: e.target.value }))}
                          placeholder="Manual notes are merged with auto recommendations"
                        />
                      </div>

                      <div style={styles.sectionCardMuted}>
                        <div style={styles.sectionTitle}>Auto Recommendations</div>
                        {autoRecommendations.length ? (
                          <div style={styles.quickAccessList}>
                            {autoRecommendations.map((item) => (
                              <div key={item} style={styles.quickAccessRow}>
                                <span>{item}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div style={styles.formHint}>No automatic recommendations yet.</div>
                        )}
                      </div>

                      {error ? <div style={styles.errorBox}>{error}</div> : null}

                      <div style={isCompactLayout ? styles.stickyActionBar : styles.inlineActionsColumn}>
                        <button type="button" style={{ ...styles.primaryButton, width: "100%" }} onClick={() => saveInspection()}>
                          Save Inspection
                        </button>
                        <button type="button" style={{ ...styles.smallButtonSuccess, width: "100%" }} onClick={() => saveInspection("Completed")}>
                          Complete Inspection
                        </button>
                        <button type="button" style={{ ...styles.secondaryButton, width: "100%" }} onClick={() => setForm(getDefaultInspectionForm())}>
                          Reset Form
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(8, isCompactLayout) }}>
                    <div style={{ marginTop: 16 }}>
                      <div style={isCompactLayout ? styles.formStack : styles.toggleGrid}>
                        <label style={styles.checkboxTile}>
                          <input
                            type="checkbox"
                            checked={form.enableSafetyChecks}
                            onChange={(e) => setForm((prev) => ({ ...prev, enableSafetyChecks: e.target.checked }))}
                          />
                          <span>Enable Arrival / Safety Checks</span>
                        </label>
                        <label style={styles.checkboxTile}>
                          <input
                            type="checkbox"
                            checked={form.enableTires}
                            onChange={(e) => setForm((prev) => ({ ...prev, enableTires: e.target.checked }))}
                          />
                          <span>Enable Tire Inspection</span>
                        </label>
                        <label style={styles.checkboxTile}>
                          <input
                            type="checkbox"
                            checked={form.enableBrakes}
                            onChange={(e) => setForm((prev) => ({ ...prev, enableBrakes: e.target.checked }))}
                          />
                          <span>Enable Brake Inspection</span>
                        </label>
                        <label style={styles.checkboxTile}>
                          <input
                            type="checkbox"
                            checked={form.enableSuspensionCheck}
                            onChange={(e) => setForm((prev) => ({ ...prev, enableSuspensionCheck: e.target.checked }))}
                          />
                          <span>Enable Suspension Check</span>
                        </label>
                        <label style={styles.checkboxTile}>
                          <input
                            type="checkbox"
                            checked={form.enableAlignmentCheck}
                            onChange={(e) => setForm((prev) => ({ ...prev, enableAlignmentCheck: e.target.checked }))}
                          />
                          <span>Enable Alignment Check</span>
                        </label>
                        <label style={styles.checkboxTile}>
                          <input
                            type="checkbox"
                            checked={form.enableAcCheck}
                            onChange={(e) => setForm((prev) => ({ ...prev, enableAcCheck: e.target.checked }))}
                          />
                          <span>Enable A/C Check</span>
                        </label>
                        <label style={styles.checkboxTile}>
                          <input
                            type="checkbox"
                            checked={form.enableElectricalCheck}
                            onChange={(e) => setForm((prev) => ({ ...prev, enableElectricalCheck: e.target.checked }))}
                          />
                          <span>Enable Electrical Check</span>
                        </label>
                        <label style={styles.checkboxTile}>
                          <input
                            type="checkbox"
                            checked={form.enableScanCheck}
                            onChange={(e) => setForm((prev) => ({ ...prev, enableScanCheck: e.target.checked }))}
                          />
                          <span>Enable Scan / OBD2 Check</span>
                        </label>
                      </div>

                      {form.enableSafetyChecks ? (
                        <div style={{ ...styles.sectionCard, marginTop: 16, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                          <div style={styles.sectionTitle}>Arrival / Safety Checks</div>
                          <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                            {[
                              ["Lights", "arrivalLights"],
                              ["Broken Glass", "arrivalBrokenGlass"],
                              ["Wipers", "arrivalWipers"],
                              ["Horn", "arrivalHorn"],
                            ].map(([label, key]) => (
                              <div key={key} style={styles.formGroup}>
                                <label style={styles.label}>{label}</label>
                                <select
                                  style={styles.select}
                                  value={form[key as keyof InspectionForm] as string}
                                  onChange={(e) =>
                                    setForm((prev) => ({
                                      ...prev,
                                      [key]: e.target.value as InspectionCheckValue,
                                    }))
                                  }
                                >
                                  <option value="Not Checked">Not Checked</option>
                                  <option value="Good">Good</option>
                                  <option value="Needs Attention">Needs Attention</option>
                                  <option value="Needs Replacement">Needs Replacement</option>
                                </select>
                                <span style={getCheckValueStyle(form[key as keyof InspectionForm] as InspectionCheckValue)}>
                                  {form[key as keyof InspectionForm] as string}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                            <div style={styles.sectionTitle}>Warning Lights at Arrival</div>
                            <div style={styles.formHint}>Document warning lights before scanning so the shop has an arrival record.</div>
                            <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                              {[
                                ["Check Engine", "arrivalCheckEngineLight"],
                                ["ABS", "arrivalAbsLight"],
                                ["Airbag", "arrivalAirbagLight"],
                                ["Battery", "arrivalBatteryLight"],
                                ["Oil Pressure", "arrivalOilPressureLight"],
                                ["Temperature / Overheat", "arrivalTempLight"],
                                ["Transmission", "arrivalTransmissionLight"],
                                ["Other Warning", "arrivalOtherWarningLight"],
                              ].map(([label, key]) => (
                                <div key={key} style={styles.formGroup}>
                                  <label style={styles.label}>{label}</label>
                                  <select
                                    style={styles.select}
                                    value={form[key as keyof InspectionForm] as string}
                                    onChange={(e) =>
                                      setForm((prev) => ({
                                        ...prev,
                                        [key]: e.target.value as WarningLightState,
                                      }))
                                    }
                                  >
                                    <option value="Not Checked">Not Checked</option>
                                    <option value="Off">Off</option>
                                    <option value="On">On</option>
                                  </select>
                                  <span style={getWarningLightStyle(form[key as keyof InspectionForm] as WarningLightState)}>
                                    {form[key as keyof InspectionForm] as string}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div style={styles.formGroup}>
                              <label style={styles.label}>Other Warning Light Note</label>
                              <input
                                style={styles.input}
                                value={form.arrivalOtherWarningNote}
                                onChange={(e) => setForm((prev) => ({ ...prev, arrivalOtherWarningNote: e.target.value }))}
                                placeholder="Cluster message, icon name, or customer warning-light note"
                              />
                            </div>
                          </div>

                          <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                            <div style={styles.sectionTitle}>Exterior Photo Slots</div>
                            <div style={styles.formHint}>
                              Save notes, filenames, or placeholders for required exterior photos. Additional findings can be added manually when needed.
                            </div>

                            <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                              <div style={styles.formGroup}>
                                <label style={styles.label}>Front Photo</label>
                                <input
                                  style={styles.input}
                                  value={form.arrivalFrontPhotoNote}
                                  onChange={(e) => setForm((prev) => ({ ...prev, arrivalFrontPhotoNote: e.target.value }))}
                                  placeholder="Filename, note, or placeholder"
                                />
                              </div>

                              <div style={styles.formGroup}>
                                <label style={styles.label}>Driver Side Photo</label>
                                <input
                                  style={styles.input}
                                  value={form.arrivalDriverSidePhotoNote}
                                  onChange={(e) => setForm((prev) => ({ ...prev, arrivalDriverSidePhotoNote: e.target.value }))}
                                  placeholder="Filename, note, or placeholder"
                                />
                              </div>

                              <div style={styles.formGroup}>
                                <label style={styles.label}>Rear Photo</label>
                                <input
                                  style={styles.input}
                                  value={form.arrivalRearPhotoNote}
                                  onChange={(e) => setForm((prev) => ({ ...prev, arrivalRearPhotoNote: e.target.value }))}
                                  placeholder="Filename, note, or placeholder"
                                />
                              </div>

                              <div style={styles.formGroup}>
                                <label style={styles.label}>Passenger Side Photo</label>
                                <input
                                  style={styles.input}
                                  value={form.arrivalPassengerSidePhotoNote}
                                  onChange={(e) => setForm((prev) => ({ ...prev, arrivalPassengerSidePhotoNote: e.target.value }))}
                                  placeholder="Filename, note, or placeholder"
                                />
                              </div>
                            </div>

                            <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                              <div style={styles.mobileDataCardHeader}>
                                <div style={styles.sectionTitle}>Additional Findings Photo Slots</div>
                                <button type="button" style={styles.secondaryButton} onClick={addAdditionalFindingPhotoNote}>
                                  Add Optional Slot
                                </button>
                              </div>

                              {form.additionalFindingPhotoNotes.length === 0 ? (
                                <div style={styles.formHint}>No optional findings photo slots added yet.</div>
                              ) : (
                                <div style={styles.formStack}>
                                  {form.additionalFindingPhotoNotes.map((item, index) => (
                                    <div key={`finding_photo_${index}`} style={styles.mobileDataCard}>
                                      <div style={styles.mobileDataCardHeader}>
                                        <strong>Finding Photo Slot {index + 1}</strong>
                                        <button
                                          type="button"
                                          style={styles.smallButtonMuted}
                                          onClick={() => removeAdditionalFindingPhotoNote(index)}
                                        >
                                          Remove
                                        </button>
                                      </div>
                                      <input
                                        style={styles.input}
                                        value={item}
                                        onChange={(e) => updateAdditionalFindingPhotoNote(index, e.target.value)}
                                        placeholder="Optional filename, location, or note"
                                      />
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ) : null}

                      {form.enableTires ? (
                        <div style={{ ...styles.sectionCard, marginTop: 16, background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                          <div style={styles.sectionTitle}>Tire Inspection</div>

                          <div style={styles.formStack}>
                            <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                              <div style={styles.formGroup}>
                                <label style={styles.label}>Front Left Tread (mm)</label>
                                <input style={styles.input} value={form.frontLeftTreadMm} onChange={(e) => setForm((prev) => ({ ...prev, frontLeftTreadMm: e.target.value }))} />
                                <select style={styles.select} value={form.frontLeftTireState} onChange={(e) => setForm((prev) => ({ ...prev, frontLeftTireState: e.target.value as InspectionCheckValue }))}>
                                  <option value="Not Checked">Not Checked</option>
                                  <option value="Good">Good</option>
                                  <option value="Monitor">Monitor</option>
                                  <option value="Needs Attention">Needs Attention</option>
                          <option value="Needs Replacement">Needs Replacement</option>
                                </select>
                                <select style={styles.select} value={form.frontLeftWearPattern} onChange={(e) => setForm((prev) => ({ ...prev, frontLeftWearPattern: e.target.value }))}>
                                  <option value="Even Wear">Even Wear</option>
                                  <option value="Inner Wear">Inner Wear</option>
                                  <option value="Outer Wear">Outer Wear</option>
                                  <option value="Center Wear">Center Wear</option>
                                  <option value="Uneven Wear">Uneven Wear</option>
                                </select>
                              </div>

                              <div style={styles.formGroup}>
                                <label style={styles.label}>Front Right Tread (mm)</label>
                                <input style={styles.input} value={form.frontRightTreadMm} onChange={(e) => setForm((prev) => ({ ...prev, frontRightTreadMm: e.target.value }))} />
                                <select style={styles.select} value={form.frontRightTireState} onChange={(e) => setForm((prev) => ({ ...prev, frontRightTireState: e.target.value as InspectionCheckValue }))}>
                                  <option value="Not Checked">Not Checked</option>
                                  <option value="Good">Good</option>
                                  <option value="Monitor">Monitor</option>
                                  <option value="Needs Attention">Needs Attention</option>
                          <option value="Needs Replacement">Needs Replacement</option>
                                </select>
                                <select style={styles.select} value={form.frontRightWearPattern} onChange={(e) => setForm((prev) => ({ ...prev, frontRightWearPattern: e.target.value }))}>
                                  <option value="Even Wear">Even Wear</option>
                                  <option value="Inner Wear">Inner Wear</option>
                                  <option value="Outer Wear">Outer Wear</option>
                                  <option value="Center Wear">Center Wear</option>
                                  <option value="Uneven Wear">Uneven Wear</option>
                                </select>
                              </div>
                            </div>

                            <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                              <div style={styles.formGroup}>
                                <label style={styles.label}>Rear Left Tread (mm)</label>
                                <input style={styles.input} value={form.rearLeftTreadMm} onChange={(e) => setForm((prev) => ({ ...prev, rearLeftTreadMm: e.target.value }))} />
                                <select style={styles.select} value={form.rearLeftTireState} onChange={(e) => setForm((prev) => ({ ...prev, rearLeftTireState: e.target.value as InspectionCheckValue }))}>
                                  <option value="Not Checked">Not Checked</option>
                                  <option value="Good">Good</option>
                                  <option value="Monitor">Monitor</option>
                                  <option value="Needs Attention">Needs Attention</option>
                          <option value="Needs Replacement">Needs Replacement</option>
                                </select>
                                <select style={styles.select} value={form.rearLeftWearPattern} onChange={(e) => setForm((prev) => ({ ...prev, rearLeftWearPattern: e.target.value }))}>
                                  <option value="Even Wear">Even Wear</option>
                                  <option value="Inner Wear">Inner Wear</option>
                                  <option value="Outer Wear">Outer Wear</option>
                                  <option value="Center Wear">Center Wear</option>
                                  <option value="Uneven Wear">Uneven Wear</option>
                                </select>
                              </div>

                              <div style={styles.formGroup}>
                                <label style={styles.label}>Rear Right Tread (mm)</label>
                                <input style={styles.input} value={form.rearRightTreadMm} onChange={(e) => setForm((prev) => ({ ...prev, rearRightTreadMm: e.target.value }))} />
                                <select style={styles.select} value={form.rearRightTireState} onChange={(e) => setForm((prev) => ({ ...prev, rearRightTireState: e.target.value as InspectionCheckValue }))}>
                                  <option value="Not Checked">Not Checked</option>
                                  <option value="Good">Good</option>
                                  <option value="Monitor">Monitor</option>
                                  <option value="Needs Attention">Needs Attention</option>
                          <option value="Needs Replacement">Needs Replacement</option>
                                </select>
                                <select style={styles.select} value={form.rearRightWearPattern} onChange={(e) => setForm((prev) => ({ ...prev, rearRightWearPattern: e.target.value }))}>
                                  <option value="Even Wear">Even Wear</option>
                                  <option value="Inner Wear">Inner Wear</option>
                                  <option value="Outer Wear">Outer Wear</option>
                                  <option value="Center Wear">Center Wear</option>
                                  <option value="Uneven Wear">Uneven Wear</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        </div>
                      ) : null}

                    <div style={styles.sectionCard}>
                      <div style={styles.sectionTitle}>Detailed Under the Hood</div>
                      <div style={styles.formHint}>
                        Clean grouped cards for a more professional technician workflow. Notes stay beside the related checks.
                      </div>

                      <div style={styles.formStack}>
                        {renderCheckCard("Fluids", "Core checks", fluidsFields, [
                          ["Engine Oil Notes", "engineOilNotes", "Oil color, top-up, leaks, sludge"],
                          ["Coolant Notes", "coolantNotes", "Reservoir, hose issue, contamination"],
                          ["Brake Fluid Notes", "brakeFluidNotes", "Dark fluid, low level, leaks"],
                          ["Power Steering Notes", "powerSteeringNotes", "Whine, low fluid, hose seepage"],
                        ])}

                        {renderCheckCard("Battery / Belts / Intake", "Support systems", supportFields, [
                          ["Battery Notes", "batteryNotes", "Corrosion, weak crank, loose terminal"],
                          ["Belt Notes", "beltNotes", "Cracks, glazing, tension concern"],
                          ["Air Intake Notes", "intakeNotes", "Dirty filter, torn hose, loose clamp"],
                        ])}

                        {renderCheckCard("Leaks / Noise / Visible Condition", "Watch items", watchFields, [
                          ["Leak / Noise Notes", "leakNotes", "Seepage area, smell, ticking, vibration"],
                        ])}
                      </div>
                    </div>



                      {form.enableSuspensionCheck ? (
                        <div style={{ ...styles.sectionCard, marginTop: 16, background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
                          <div style={styles.sectionTitle}>Suspension Check</div>
                          <div style={styles.formHint}>Expanded suspension coverage for cars, SUVs, and pickups. Alignment is recommended when steering or suspension issues are found.</div>

                          <div style={styles.formStack}>
                            {renderCheckCard(
                              "Front Steering / Linkage",
                              "Steering rack, tie rods, ball joints, and linkage",
                              [
                                ["Front Ball Joint", "frontBallJointState"],
                                ["Front Tie Rod End", "frontTieRodEndState"],
                                ["Front Rack End", "frontRackEndState"],
                                ["Steering Rack Condition", "steeringRackConditionState"],
                                ["Front Stabilizer Link", "frontStabilizerLinkState"],
                              ],
                              [
                                ["Steering Feel Notes", "steeringFeelNotes", "Pulling, loose feel, off-center steering, clunking"],
                              ]
                            )}

                            {renderCheckCard(
                              "Front Suspension",
                              "Shock, strut mount, control arms, bushings, CV, and wheel bearing",
                              [
                                ["Front Shock / Strut", "frontShockState"],
                                ["Front Strut Mount", "frontStrutMountState"],
                                ["Front Upper Control Arm", "frontUpperControlArmState"],
                                ["Front Lower Control Arm", "frontLowerControlArmState"],
                                ["Front Control Arm Bushing", "frontControlArmBushingState"],
                                ["Front CV Boot", "frontCvBootState"],
                                ["Front Wheel Bearing", "frontWheelBearingState"],
                              ],
                              [
                                ["Front Suspension Notes", "frontSuspensionNotes", "Leak, play, torn boot, bearing noise, vibration"],
                              ]
                            )}

                            <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                              <div style={styles.formGroup}>
                                <label style={styles.label}>Rear Suspension Type</label>
                                <select
                                  style={styles.select}
                                  value={form.rearSuspensionType}
                                  onChange={(e) => setForm((prev) => ({ ...prev, rearSuspensionType: e.target.value as RearSuspensionType }))}
                                >
                                  <option value="Coil Spring">Coil Spring</option>
                                  <option value="Leaf Spring">Leaf Spring</option>
                                  <option value="Other">Other</option>
                                </select>
                                <div style={styles.formHint}>Show only the rear components that match the vehicle setup.</div>
                              </div>
                            </div>

                            {renderCheckCard(
                              "Rear Suspension",
                              "Rear shocks, links, bushings, springs, control arms, and bearing",
                              [
                                ["Rear Shock", "rearShockState"],
                                ["Rear Stabilizer Link", "rearStabilizerLinkState"],
                                ["Rear Bushing", "rearBushingState"],
                                ["Rear Spring", "rearSpringState"],
                                ["Rear Control Arm", "rearControlArmState"],
                                ["Rear Wheel Bearing", "rearWheelBearingState"],
                              ],
                              [
                                ["Rear Suspension Notes", "rearSuspensionNotes", "Noise, sagging, play, worn bushing, axle movement"],
                                ["Road Test / Noise Notes", "suspensionRoadTestNotes", "Rattle, clunk, pull, vibration, rough ride"],
                              ]
                            )}

                            {(form.rearSuspensionType === "Coil Spring" || form.rearSuspensionType === "Other") ? renderCheckCard(
                              "Rear Coil Spring Group",
                              "Use for sedans, crossovers, and SUVs with coil-spring rear suspension",
                              [
                                ["Rear Coil Spring", "rearCoilSpringState"],
                              ]
                            ) : null}

                            {(form.rearSuspensionType === "Leaf Spring" || form.rearSuspensionType === "Other") ? renderCheckCard(
                              "Rear Leaf Spring Group",
                              "Use for pickups, utility vehicles, and leaf-spring rear setups",
                              [
                                ["Rear Leaf Spring", "rearLeafSpringState"],
                                ["Rear Leaf Spring Bushing", "rearLeafSpringBushingState"],
                                ["Rear U-Bolt / Mount", "rearUBoltMountState"],
                                ["Rear Axle Mount", "rearAxleMountState"],
                              ]
                            ) : null}
                          </div>
                        </div>
                      ) : null}

                      {form.enableAlignmentCheck ? (
                        <div style={{ ...styles.sectionCard, marginTop: 16, background: "#ecfeff", border: "1px solid #a5f3fc" }}>
                          <div style={styles.sectionTitle}>Alignment Check</div>
                          <div style={styles.formHint}>Upload or capture the before alignment printout. After printout is optional for later.</div>

                          <div style={styles.formGroup}>
                            <label style={styles.label}>Alignment Concern / Notes</label>
                            <textarea
                              style={styles.textarea}
                              value={form.alignmentConcernNotes}
                              onChange={(e) => setForm((prev) => ({ ...prev, alignmentConcernNotes: e.target.value }))}
                              placeholder="Pulling left/right, steering wheel off-center, uneven tire wear, customer request, or technician observation"
                            />
                          </div>

                          <label style={styles.checkboxCard}>
                            <input
                              type="checkbox"
                              checked={form.alignmentRecommended}
                              onChange={(e) => setForm((prev) => ({ ...prev, alignmentRecommended: e.target.checked }))}
                            />
                            <span>Recommend Wheel Alignment</span>
                          </label>

                          <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Before Alignment Printout</label>
                              <input
                                type="file"
                                style={styles.input}
                                onChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    alignmentBeforePrintoutName: e.target.files?.[0]?.name || prev.alignmentBeforePrintoutName || "",
                                  }))
                                }
                              />
                              <div style={styles.formHint}>Saved file: {form.alignmentBeforePrintoutName || "No file selected"}</div>
                            </div>

                            <div style={styles.formGroup}>
                              <label style={styles.label}>After Alignment Printout</label>
                              <input
                                type="file"
                                style={styles.input}
                                onChange={(e) =>
                                  setForm((prev) => ({
                                    ...prev,
                                    alignmentAfterPrintoutName: e.target.files?.[0]?.name || prev.alignmentAfterPrintoutName || "",
                                  }))
                                }
                              />
                              <div style={styles.formHint}>Optional for later: {form.alignmentAfterPrintoutName || "No file selected"}</div>
                            </div>
                          </div>
                        </div>
                      ) : null}


                      {form.enableAcCheck ? (
                        <div style={{ ...styles.sectionCard, marginTop: 16, background: "#ecfdf5", border: "1px solid #a7f3d0" }}>
                          <div style={styles.sectionTitle}>A/C Inspection</div>
                          <div style={styles.formHint}>Use this triggered section for weak cooling, bad smell, noisy compressor, poor airflow, or customer-requested A/C checks.</div>

                          <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Vent Temperature</label>
                              <input
                                style={styles.input}
                                value={form.acVentTemperature}
                                onChange={(e) => setForm((prev) => ({ ...prev, acVentTemperature: e.target.value }))}
                                placeholder="Example: 8°C or 46°F"
                              />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>A/C Notes</label>
                              <input
                                style={styles.input}
                                value={form.acNotes}
                                onChange={(e) => setForm((prev) => ({ ...prev, acNotes: e.target.value }))}
                                placeholder="Weak cooling, noisy clutch, odor, intermittent cooling"
                              />
                            </div>
                          </div>

                          <div style={styles.formStack}>
                            {renderCheckCard(
                              "Cooling / Compressor",
                              "Core A/C checks",
                              [
                                ["Cooling Performance", "acCoolingPerformanceState"],
                                ["Compressor Engagement", "acCompressorState"],
                                ["Condenser Fan", "acCondenserFanState"],
                              ]
                            )}

                            {renderCheckCard(
                              "Airflow / Cabin",
                              "Cabin comfort checks",
                              [
                                ["Cabin Filter", "acCabinFilterState"],
                                ["Airflow / Vent Output", "acAirflowState"],
                                ["Odor / Smell", "acOdorState"],
                              ]
                            )}
                          </div>
                        </div>
                      ) : null}


                      {form.enableElectricalCheck ? (
                        <div style={{ ...styles.sectionCard, marginTop: 16, background: "#eff6ff", border: "1px solid #facc15", boxShadow: "0 0 0 1px rgba(239,68,68,0.05) inset" }}>
                          <div style={styles.sectionTitle}>Electrical Inspection</div>
                          <div style={styles.formHint}>Use this triggered section for no-start, weak battery, warning lights, intermittent electrical faults, or charging complaints.</div>

                          <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Battery Voltage</label>
                              <input
                                style={styles.input}
                                value={form.electricalBatteryVoltage}
                                onChange={(e) => setForm((prev) => ({ ...prev, electricalBatteryVoltage: e.target.value }))}
                                placeholder="Example: 12.6V"
                              />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Charging Voltage</label>
                              <input
                                style={styles.input}
                                value={form.electricalChargingVoltage}
                                onChange={(e) => setForm((prev) => ({ ...prev, electricalChargingVoltage: e.target.value }))}
                                placeholder="Example: 13.8V to 14.5V"
                              />
                            </div>
                          </div>

                          <div style={styles.formStack}>
                            {renderCheckCard(
                              "Starting / Charging",
                              "Battery, starter, and alternator checks",
                              [
                                ["Starter Condition", "electricalStarterState"],
                                ["Alternator / Charging", "electricalAlternatorState"],
                              ]
                            )}

                            {renderCheckCard(
                              "Wiring / Controls",
                              "Basic electrical condition checks",
                              [
                                ["Fuse / Relay Condition", "electricalFuseRelayState"],
                                ["Visible Wiring Condition", "electricalWiringState"],
                                ["Warning Light / Scan Need", "electricalWarningLightState"],
                              ],
                              [["Electrical Notes", "electricalNotes", "No-start, dim lights, intermittent issue, warning code note"]]
                            )}
                          </div>
                        </div>
                      ) : null}

                      {form.enableTransmissionCheck ? (
                        <div style={{ ...styles.sectionCard, marginTop: 16, background: "#fff7ed", border: "1px solid #fdba74" }}>
                          <div style={styles.sectionTitle}>Transmission / Drivetrain Inspection</div>
                          <div style={styles.formHint}>Use this triggered section for shifting issues, slipping, drivetrain vibration, fluid leaks, clutch complaints, or customer-requested transmission checks.</div>

                          <div style={styles.formStack}>
                            {renderCheckCard(
                              "Fluid / Leaks",
                              "Transmission fluid and leak condition",
                              [
                                ["Transmission Fluid Level", "transmissionFluidState"],
                                ["Transmission Fluid Condition", "transmissionFluidConditionState"],
                                ["Transmission Leak", "transmissionLeakState"],
                              ]
                            )}

                            {renderCheckCard(
                              "Operation / Drivetrain",
                              "Driveability and drivetrain checks",
                              [
                                ["Shifting Performance", "shiftingPerformanceState"],
                                ["Clutch Operation", "clutchOperationState"],
                                ["Drivetrain Vibration", "drivetrainVibrationState"],
                                ["CV Joint / Drive Axle", "cvJointDriveAxleState"],
                                ["Transmission Mount", "transmissionMountState"],
                              ],
                              [["Transmission Notes", "transmissionNotes", "Slipping, delayed shift, hard shift, vibration, noise, clutch feel"]]
                            )}
                          </div>
                        </div>
                      ) : null}


                      {form.enableScanCheck ? (
                        <div style={{ ...styles.sectionCard, marginTop: 16, background: "#ecfeff", border: "1px solid #a5f3fc" }}>
                          <div style={styles.sectionTitle}>Scan / OBD2 Check</div>
                          <div style={styles.formHint}>Upload OBD2 scan results as PDF or photo. Use this for warning lights, diagnostic documentation, and before/after scan proof.</div>

                          <label style={styles.checkboxCard}>
                            <input
                              type="checkbox"
                              checked={form.scanPerformed}
                              onChange={(e) => setForm((prev) => ({ ...prev, scanPerformed: e.target.checked }))}
                            />
                            <span>Scan Performed</span>
                          </label>

                          <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Scanner Used</label>
                              <input
                                style={styles.input}
                                value={form.scanToolUsed}
                                onChange={(e) => setForm((prev) => ({ ...prev, scanToolUsed: e.target.value }))}
                                placeholder="Autel, Launch, Bosch, OEM tool, mobile scanner, etc."
                              />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Upload Scan Result</label>
                              <input
                                type="file"
                                style={styles.input}
                                accept=".pdf,image/*"
                                multiple
                                onChange={(e) => addScanUploadNames(e.target.files)}
                              />
                              <div style={styles.formHint}>Accepted: PDF, photos, screenshots of scan results.</div>
                            </div>
                          </div>

                          <div style={styles.formGroup}>
                            <label style={styles.label}>Scan Notes</label>
                            <textarea
                              style={styles.textarea}
                              value={form.scanNotes}
                              onChange={(e) => setForm((prev) => ({ ...prev, scanNotes: e.target.value }))}
                              placeholder="Scanner notes, pending codes, freeze-frame note, cleared / not cleared, or customer explanation"
                            />
                          </div>

                          {form.scanUploadNames.length ? (
                            <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                              <div style={styles.sectionTitle}>Uploaded Scan Results</div>
                              <div style={styles.mobileCardList}>
                                {form.scanUploadNames.map((fileName, index) => (
                                  <div key={`${fileName}_${index}`} style={styles.mobileDataCard}>
                                    <div style={styles.mobileDataCardHeader}>
                                      <strong>{fileName}</strong>
                                      <button type="button" style={styles.smallButtonMuted} onClick={() => removeScanUploadName(index)}>
                                        Remove
                                      </button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      ) : null}


                      {form.enableBrakes ? (
                        <div style={{ ...styles.sectionCard, marginTop: 16, background: "#fff1f2", border: "1px solid #fecdd3" }}>
                          <div style={styles.sectionTitle}>Brake Inspection</div>
                          <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Front Brake Condition</label>
                              <input
                                style={styles.input}
                                value={form.frontBrakeCondition}
                                onChange={(e) => setForm((prev) => ({ ...prev, frontBrakeCondition: e.target.value }))}
                                placeholder="Good / Needs attention / Bad"
                              />
                              <select style={styles.select} value={form.frontBrakeState} onChange={(e) => setForm((prev) => ({ ...prev, frontBrakeState: e.target.value as InspectionCheckValue }))}>
                                <option value="Not Checked">Not Checked</option>
                                <option value="Good">Good</option>
                                <option value="Monitor">Monitor</option>
                                <option value="Needs Attention">Needs Attention</option>
                          <option value="Needs Replacement">Needs Replacement</option>
                              </select>
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Rear Brake Condition</label>
                              <input
                                style={styles.input}
                                value={form.rearBrakeCondition}
                                onChange={(e) => setForm((prev) => ({ ...prev, rearBrakeCondition: e.target.value }))}
                                placeholder="Good / Needs attention / Bad"
                              />
                              <select style={styles.select} value={form.rearBrakeState} onChange={(e) => setForm((prev) => ({ ...prev, rearBrakeState: e.target.value as InspectionCheckValue }))}>
                                <option value="Not Checked">Not Checked</option>
                                <option value="Good">Good</option>
                                <option value="Monitor">Monitor</option>
                                <option value="Needs Attention">Needs Attention</option>
                          <option value="Needs Replacement">Needs Replacement</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      ) : null}

                      <div style={{ ...styles.sectionCard, marginTop: 16 }}>
                        <div style={styles.sectionTitle}>General Inspection Notes</div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Inspection Notes</label>
                          <textarea
                            style={styles.textarea}
                            value={form.inspectionNotes}
                            onChange={(e) => setForm((prev) => ({ ...prev, inspectionNotes: e.target.value }))}
                            placeholder="Additional notes"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title="Inspection Registry"
            subtitle="Saved inspections linked to intake records"
            right={<span style={styles.statusNeutral}>{filteredInspectionRecords.length} saved</span>}
          >
            <div style={styles.formGroup}>
              <label style={styles.label}>Search</label>
              <input
                style={styles.input}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search inspection no, intake no, plate, customer, vehicle, concern"
              />
            </div>

            {filteredInspectionRecords.length === 0 ? (
              <div style={styles.emptyState}>No inspections saved yet.</div>
            ) : isCompactLayout ? (
              <div style={styles.mobileCardList}>
                {filteredInspectionRecords.map((row) => (
                  <div key={row.id} style={styles.mobileDataCard}>
                    <div style={styles.mobileDataCardHeader}>
                      <strong>{row.inspectionNumber}</strong>
                      <InspectionStatusBadge status={row.status} />
                    </div>
                    <div style={styles.mobileDataSecondary}>Linked Intake: {row.intakeNumber}</div>
                    <div style={styles.mobileDataPrimary}>{row.plateNumber || row.conductionNumber || "-"}</div>
                    <div style={styles.mobileDataSecondary}>{row.accountLabel}</div>
                    <div style={styles.mobileDataSecondary}>
                      {[row.make, row.model, row.year, row.color].filter(Boolean).join(" • ") || "-"}
                    </div>
                    <div style={styles.formHint}>Evidence: {(row as any).evidenceItems?.length || 0}</div>
                    <div style={styles.concernCard}>{row.underHoodSummary || "No under the hood summary."}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Inspection No.</th>
                      <th style={styles.th}>Linked Intake</th>
                      <th style={styles.th}>Plate / Customer</th>
                      <th style={styles.th}>Vehicle</th>
                      <th style={styles.th}>Default Category</th>
                      <th style={styles.th}>Evidence</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInspectionRecords.map((row) => (
                      <tr key={row.id}>
                        <td style={styles.td}>
                          <div style={styles.tablePrimary}>{row.inspectionNumber}</div>
                          <div style={styles.tableSecondary}>{formatDateTime(row.createdAt)}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.tablePrimary}>{row.intakeNumber}</div>
                          <div style={styles.tableSecondary}>{row.concern || "-"}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.tablePrimary}>{row.plateNumber || row.conductionNumber || "-"}</div>
                          <div style={styles.tableSecondary}>{row.accountLabel}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.tablePrimary}>{[row.make, row.model].filter(Boolean).join(" ") || "-"}</div>
                          <div style={styles.tableSecondary}>{[row.year, row.color, row.odometerKm && `${row.odometerKm} km`].filter(Boolean).join(" • ")}</div>
                        </td>
                        <td style={styles.td}>
                          <div style={styles.concernCell}>{row.underHoodSummary}</div>
                        </td>
                        <td style={styles.td}>{(row as any).evidenceItems?.length || 0}</td>
                        <td style={styles.td}>
                          <InspectionStatusBadge status={row.status} />
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


function RepairOrdersPage({
  currentUser,
  users,
  intakeRecords,
  inspectionRecords,
  repairOrders,
  setRepairOrders,
  setIntakeRecords,
  approvalRecords,
  setApprovalRecords,
  backjobRecords,
  setBackjobRecords,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  users: UserAccount[];
  intakeRecords: IntakeRecord[];
  inspectionRecords: InspectionRecord[];
  repairOrders: RepairOrderRecord[];
  setRepairOrders: React.Dispatch<React.SetStateAction<RepairOrderRecord[]>>;
  setIntakeRecords: React.Dispatch<React.SetStateAction<IntakeRecord[]>>;
  approvalRecords: ApprovalRecord[];
  setApprovalRecords: React.Dispatch<React.SetStateAction<ApprovalRecord[]>>;
  backjobRecords: BackjobRecord[];
  setBackjobRecords: React.Dispatch<React.SetStateAction<BackjobRecord[]>>;
  isCompactLayout: boolean;
}) {
  const [creationMode, setCreationMode] = useState<RepairOrderSourceType>("Intake");
  const [selectedIntakeId, setSelectedIntakeId] = useState("");
  const [selectedRoId, setSelectedRoId] = useState("");
  const [form, setForm] = useState<RepairOrderForm>(() => getDefaultRepairOrderForm(currentUser.fullName));
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [approvalSummary, setApprovalSummary] = useState("");
  const [approvalCommHook, setApprovalCommHook] = useState("SMS / Email placeholder");
  const [approvalPreviewMode, setApprovalPreviewMode] = useState<"Advisor" | "Customer">("Advisor");
  const [backjobComplaint, setBackjobComplaint] = useState("");
  const [backjobRootCause, setBackjobRootCause] = useState("");
  const [backjobOutcome, setBackjobOutcome] = useState<BackjobOutcome>("Customer Pay");
  const [backjobResolutionNotes, setBackjobResolutionNotes] = useState("");

  const sortedRepairOrders = useMemo(() => repairOrders, [repairOrders]);

  const availableIntakes = useMemo(() => {
    const linkedIds = new Set(repairOrders.filter((row) => row.intakeId).map((row) => row.intakeId));
    return intakeRecords.filter((row) => row.status !== "Cancelled" && !linkedIds.has(row.id));
  }, [intakeRecords, repairOrders]);

  const selectedIntake = useMemo(
    () => availableIntakes.find((row) => row.id === selectedIntakeId) ?? null,
    [availableIntakes, selectedIntakeId]
  );

  const linkedInspection = useMemo(() => {
    if (!selectedIntake) return null;
    return inspectionRecords.find((row) => row.intakeId === selectedIntake.id) ?? null;
  }, [inspectionRecords, selectedIntake]);

  const selectedRO = useMemo(
    () => sortedRepairOrders.find((row) => row.id === selectedRoId) ?? null,
    [sortedRepairOrders, selectedRoId]
  );

  const selectedApproval = useMemo(
    () =>
      selectedRO
        ? approvalRecords
            .filter((row) => row.roId === selectedRO.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null
        : null,
    [approvalRecords, selectedRO]
  );

  const selectedBackjobs = useMemo(
    () =>
      selectedRO
        ? backjobRecords
            .filter((row) => row.linkedRoId === selectedRO.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [],
    [backjobRecords, selectedRO]
  );

  const customerApprovalMessage = useMemo(
    () => buildCustomerApprovalMessage(selectedRO),
    [selectedRO]
  );

  const primaryTechnicians = useMemo(
    () =>
      users.filter(
        (user) =>
          user.active &&
          ["Chief Technician", "Senior Mechanic", "General Mechanic"].includes(user.role)
      ),
    [users]
  );

  const supportTechnicians = useMemo(
    () =>
      users.filter(
        (user) =>
          user.active &&
          ["Chief Technician", "Senior Mechanic", "General Mechanic", "OJT"].includes(user.role)
      ),
    [users]
  );

  const filteredRepairOrders = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sortedRepairOrders;
    return sortedRepairOrders.filter((row) =>
      [
        row.roNumber,
        row.intakeNumber,
        row.inspectionNumber,
        row.plateNumber,
        row.conductionNumber,
        row.accountLabel,
        row.make,
        row.model,
        row.customerConcern,
        row.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [search, sortedRepairOrders]);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      advisorName: prev.advisorName || currentUser.fullName,
    }));
  }, [currentUser.fullName]);

  useEffect(() => {
    if (creationMode !== "Intake") return;
    if (!selectedIntake) {
      setForm(getDefaultRepairOrderForm(currentUser.fullName));
      return;
    }

    setForm({
      customerName: selectedIntake.customerName,
      companyName: selectedIntake.companyName,
      accountType: selectedIntake.accountType,
      phone: selectedIntake.phone,
      email: selectedIntake.email,
      plateNumber: selectedIntake.plateNumber,
      conductionNumber: selectedIntake.conductionNumber,
      make: selectedIntake.make,
      model: selectedIntake.model,
      year: selectedIntake.year,
      color: selectedIntake.color,
      odometerKm: selectedIntake.odometerKm,
      customerConcern: selectedIntake.concern,
      advisorName: selectedIntake.assignedAdvisor || currentUser.fullName,
      status: linkedInspection ? "Waiting Approval" : "Waiting Inspection",
      primaryTechnicianId: "",
      supportTechnicianIds: [],
      workLines: linkedInspection && linkedInspection.recommendationLines.length > 0 ? linkedInspection.recommendationLines.map((lineTitle) => ({ ...getEmptyWorkLine(), title: lineTitle, recommendationSource: linkedInspection.inspectionNumber })) : [getEmptyWorkLine()],
    });
    setError("");
  }, [creationMode, selectedIntake, linkedInspection, currentUser.fullName]);

  useEffect(() => {
    if (!selectedRoId && sortedRepairOrders.length > 0) {
      setSelectedRoId(sortedRepairOrders[0].id);
    }
    if (selectedRoId && !sortedRepairOrders.some((row) => row.id === selectedRoId)) {
      setSelectedRoId(sortedRepairOrders[0]?.id ?? "");
    }
  }, [sortedRepairOrders, selectedRoId]);

  const resetForm = () => {
    setCreationMode("Intake");
    setSelectedIntakeId("");
    setForm(getDefaultRepairOrderForm(currentUser.fullName));
    setError("");
  };

  const updateDraftLine = (lineId: string, field: keyof RepairOrderWorkLine, value: string) => {
    setForm((prev) => ({
      ...prev,
      workLines: prev.workLines.map((line) =>
        line.id === lineId
          ? recalculateWorkLine({
              ...line,
              [field]: value,
            })
          : line
      ),
    }));
  };

  const addDraftWorkLine = () => {
    setForm((prev) => ({ ...prev, workLines: [...prev.workLines, getEmptyWorkLine()] }));
  };

  const removeDraftWorkLine = (lineId: string) => {
    setForm((prev) => ({
      ...prev,
      workLines: prev.workLines.length === 1
        ? prev.workLines
        : prev.workLines.filter((line) => line.id !== lineId),
    }));
  };

  const handleSupportToggle = (technicianId: string) => {
    setForm((prev) => ({
      ...prev,
      supportTechnicianIds: prev.supportTechnicianIds.includes(technicianId)
        ? prev.supportTechnicianIds.filter((id) => id !== technicianId)
        : [...prev.supportTechnicianIds, technicianId],
    }));
  };

  const handleCreateRO = (e: React.FormEvent) => {
    e.preventDefault();

    const customerName = form.customerName.trim();
    const companyName = form.companyName.trim();
    const plateNumber = form.plateNumber.trim().toUpperCase();
    const conductionNumber = form.conductionNumber.trim().toUpperCase();
    const make = form.make.trim();
    const model = form.model.trim();
    const customerConcern = form.customerConcern.trim();
    const advisorName = form.advisorName.trim() || currentUser.fullName;
    const cleanWorkLines = form.workLines
      .map((line) =>
        recalculateWorkLine({
          ...line,
          title: line.title.trim(),
          category: line.category.trim(),
          notes: line.notes.trim(),
        })
      )
      .filter((line) => line.title);

    if (creationMode === "Intake" && !selectedIntake) {
      setError("Select an intake first or switch to manual RO mode.");
      return;
    }

    if (!plateNumber && !conductionNumber) {
      setError("Plate number or conduction number is required.");
      return;
    }

    if (!make || !model) {
      setError("Vehicle make and model are required.");
      return;
    }

    if (!customerConcern) {
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

    if (cleanWorkLines.length === 0) {
      setError("Add at least one work line before creating the RO.");
      return;
    }

    const now = new Date().toISOString();
    const inspection = creationMode === "Intake" && selectedIntake
      ? inspectionRecords.find((row) => row.intakeId === selectedIntake.id) ?? null
      : null;

    const newRO: RepairOrderRecord = {
      id: uid("ro"),
      roNumber: nextDailyNumber("RO"),
      createdAt: now,
      updatedAt: now,
      workStartedAt: form.status === "In Progress" ? now : "",
      sourceType: creationMode,
      intakeId: creationMode === "Intake" && selectedIntake ? selectedIntake.id : "",
      inspectionId: inspection?.id ?? "",
      intakeNumber: creationMode === "Intake" && selectedIntake ? selectedIntake.intakeNumber : "",
      inspectionNumber: inspection?.inspectionNumber ?? "",
      customerName,
      companyName,
      accountType: form.accountType,
      accountLabel: companyName || customerName || "Unknown Customer",
      phone: form.phone.trim(),
      email: form.email.trim(),
      plateNumber,
      conductionNumber,
      make,
      model,
      year: form.year.trim(),
      color: form.color.trim(),
      odometerKm: form.odometerKm.trim(),
      customerConcern,
      advisorName,
      status: form.status,
      primaryTechnicianId: form.primaryTechnicianId,
      supportTechnicianIds: form.supportTechnicianIds,
      workLines: cleanWorkLines,
      latestApprovalRecordId: "",
      deferredLineTitles: [],
      backjobReferenceRoId: "",
      encodedBy: currentUser.fullName,
    };

    setRepairOrders((prev) => [newRO, ...prev]);
    setSelectedRoId(newRO.id);

    if (creationMode === "Intake" && selectedIntake) {
      setIntakeRecords((prev) =>
        prev.map((row) =>
          row.id === selectedIntake.id
            ? { ...row, status: "Converted to RO", updatedAt: now }
            : row
        )
      );
    }

    setError("");
    resetForm();
  };

  const updateRO = (id: string, patch: Partial<RepairOrderRecord>) => {
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, ...patch, updatedAt: new Date().toISOString() }
          : row
      )
    );
  };

  const updateROWorkLine = (roId: string, lineId: string, field: keyof RepairOrderWorkLine, value: string) => {
    setRepairOrders((prev) =>
      prev.map((row) => {
        if (row.id !== roId) return row;

        return {
          ...row,
          updatedAt: new Date().toISOString(),
          workLines: row.workLines.map((line) => {
            if (line.id !== lineId) return line;

            const isLockedByApproval = line.approvalDecision === "Approved";
            const lockedFields: Array<keyof RepairOrderWorkLine> = [
              "title",
              "category",
              "serviceEstimate",
              "partsEstimate",
              "totalEstimate",
            ];

            if (isLockedByApproval && lockedFields.includes(field)) {
              return line;
            }

            return recalculateWorkLine({
              ...line,
              [field]: value,
            });
          }),
        };
      })
    );
  };

  const addROWorkLine = (roId: string) => {
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === roId
          ? {
              ...row,
              updatedAt: new Date().toISOString(),
              workLines: [...row.workLines, getEmptyWorkLine()],
            }
          : row
      )
    );
  };

  const removeROWorkLine = (roId: string, lineId: string) => {
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === roId
          ? {
              ...row,
              updatedAt: new Date().toISOString(),
              workLines:
                row.workLines.length === 1
                  ? row.workLines
                  : row.workLines.filter((line) => line.id !== lineId),
            }
          : row
      )
    );
  };

  const getUserLabel = (userId: string) => users.find((row) => row.id === userId)?.fullName || "-";

  const commitApprovalItems = (items: ApprovalWorkItem[]) => {
    if (!selectedRO) return;

    const now = new Date().toISOString();
    const summary = approvalSummary.trim() || `${selectedRO.roNumber} approval updated`;
    const record: ApprovalRecord = {
      id: uid("apr"),
      approvalNumber: nextDailyNumber("APR"),
      roId: selectedRO.id,
      roNumber: selectedRO.roNumber,
      createdAt: now,
      decidedBy: currentUser.fullName,
      customerName: selectedRO.accountLabel,
      customerContact: selectedRO.phone || selectedRO.email || "-",
      summary,
      communicationHook: approvalCommHook.trim() || "SMS / Email placeholder",
      items,
    };
    const approvedCount = items.filter((item) => item.decision === "Approved").length;
    const deferredTitles = items.filter((item) => item.decision === "Deferred").map((item) => item.title);

    setApprovalRecords((prev) => [record, ...prev]);
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === selectedRO.id
          ? {
              ...row,
              latestApprovalRecordId: record.id,
              deferredLineTitles: deferredTitles,
              status: approvedCount > 0 ? "Approved / Ready to Work" : "Waiting Approval",
              workLines: row.workLines.map((line) => {
                const item = items.find((entry) => entry.workLineId === line.id);
                const nextDecision = item?.decision ?? line.approvalDecision ?? "Pending";
                const nextApprovedAt = item?.approvedAt ?? line.approvalAt ?? "";

                return {
                  ...line,
                  approvalDecision: nextDecision,
                  approvalAt: nextApprovedAt,
                  notes:
                    nextDecision !== "Approved" && nextDecision !== "Pending"
                      ? `${line.notes}${line.notes ? " | " : ""}Decision: ${nextDecision}`
                      : line.notes,
                };
              }),
              updatedAt: now,
            }
          : row
      )
    );
  };

  const setLineDecision = (decision: ApprovalDecision, workLineId: string) => {
    if (!selectedRO) return;

    const now = new Date().toISOString();
    const items = selectedRO.workLines.map((line) => {
      const existing = selectedApproval?.items.find((item) => item.workLineId === line.id);
      return {
        workLineId: line.id,
        title: line.title || "Untitled Work Line",
        decision: line.id === workLineId ? decision : existing?.decision ?? line.approvalDecision ?? "Pending",
        approvedAt: line.id === workLineId ? now : existing?.approvedAt ?? line.approvalAt ?? "",
        note: existing?.note ?? "",
      };
    });

    commitApprovalItems(items);
  };

  const setBulkLineDecision = (decision: ApprovalDecision) => {
    if (!selectedRO) return;

    const now = new Date().toISOString();
    const items = selectedRO.workLines.map((line) => {
      const existing = selectedApproval?.items.find((item) => item.workLineId === line.id);
      const currentDecision = existing?.decision ?? line.approvalDecision ?? "Pending";
      const nextDecision = currentDecision === "Pending" ? decision : currentDecision;

      return {
        workLineId: line.id,
        title: line.title || "Untitled Work Line",
        decision: nextDecision,
        approvedAt: currentDecision === "Pending" ? now : existing?.approvedAt ?? line.approvalAt ?? "",
        note: existing?.note ?? "",
      };
    });

    commitApprovalItems(items);
  };

  const createBackjob = () => {
    if (!selectedRO || !backjobComplaint.trim()) return;
    const record: BackjobRecord = {
      id: uid("bjb"),
      backjobNumber: nextDailyNumber("BJB"),
      linkedRoId: selectedRO.id,
      linkedRoNumber: selectedRO.roNumber,
      createdAt: new Date().toISOString(),
      plateNumber: selectedRO.plateNumber || selectedRO.conductionNumber,
      customerLabel: selectedRO.accountLabel,
      complaint: backjobComplaint.trim(),
      rootCause: backjobRootCause.trim(),
      responsibility: backjobOutcome,
      resolutionNotes: backjobResolutionNotes.trim(),
      createdBy: currentUser.fullName,
    };
    setBackjobRecords((prev) => [record, ...prev]);
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === selectedRO.id ? { ...row, backjobReferenceRoId: record.id, updatedAt: new Date().toISOString() } : row
      )
    );
    setBackjobComplaint("");
    setBackjobRootCause("");
    setBackjobResolutionNotes("");
    setBackjobOutcome("Customer Pay");
  };

  const selectedROTotal = selectedRO
    ? selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0)
    : 0;

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }}>
          <Card
            title="Create Repair Order"
            subtitle="Create from intake or manually without an intake record"
            right={<span style={styles.statusInfo}>Option A Enabled</span>}
          >
            <form onSubmit={handleCreateRO} style={styles.formStack}>
              <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Creation Mode</label>
                  <select
                    style={styles.select}
                    value={creationMode}
                    onChange={(e) => {
                      setCreationMode(e.target.value as RepairOrderSourceType);
                      setSelectedIntakeId("");
                      setForm(getDefaultRepairOrderForm(currentUser.fullName));
                    }}
                  >
                    <option value="Intake">From Existing Intake</option>
                    <option value="Manual">Manual RO Without Intake</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>RO Status</label>
                  <select
                    style={styles.select}
                    value={form.status}
                    onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as ROStatus }))}
                  >
                    <option value="Draft">Draft</option>
                    <option value="Waiting Inspection">Waiting Inspection</option>
                    <option value="Waiting Approval">Waiting Approval</option>
                    <option value="Approved / Ready to Work">Approved / Ready to Work</option>
                  </select>
                </div>
              </div>

              {creationMode === "Intake" ? (
                <div style={styles.formGroup}>
                  <label style={styles.label}>Select Intake</label>
                  <select
                    style={styles.select}
                    value={selectedIntakeId}
                    onChange={(e) => setSelectedIntakeId(e.target.value)}
                  >
                    <option value="">Select intake record</option>
                    {availableIntakes.map((row) => (
                      <option key={row.id} value={row.id}>
                        {row.intakeNumber} • {row.plateNumber || row.conductionNumber || "No Plate"} • {row.companyName || row.customerName || "Unknown"}
                      </option>
                    ))}
                  </select>
                </div>
              ) : null}

              {creationMode === "Intake" && selectedIntake ? (
                <div style={styles.summaryPanel}>
                  <div style={styles.summaryGrid}>
                    <div><strong>Intake No.:</strong> {selectedIntake.intakeNumber}</div>
                    <div><strong>Inspection:</strong> {linkedInspection?.inspectionNumber || "None linked"}</div>
                    <div><strong>Plate:</strong> {selectedIntake.plateNumber || "-"}</div>
                    <div><strong>Account:</strong> {selectedIntake.companyName || selectedIntake.customerName || "-"}</div>
                  </div>
                </div>
              ) : null}

              <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Account Type</label>
                  <select
                    style={styles.select}
                    value={form.accountType}
                    onChange={(e) => setForm((prev) => ({ ...prev, accountType: e.target.value as VehicleAccountType }))}
                  >
                    <option value="Personal">Personal</option>
                    <option value="Company / Fleet">Company / Fleet</option>
                  </select>
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Service Advisor</label>
                  <input
                    style={styles.input}
                    value={form.advisorName}
                    onChange={(e) => setForm((prev) => ({ ...prev, advisorName: e.target.value }))}
                    placeholder="Advisor or reception encoder"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>{form.accountType === "Company / Fleet" ? "Company / Fleet Name" : "Customer Name"}</label>
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
                  placeholder={form.accountType === "Company / Fleet" ? "Enter company or fleet name" : "Enter customer name"}
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
                  <input style={styles.input} value={form.plateNumber} onChange={(e) => setForm((prev) => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Conduction Number</label>
                  <input style={styles.input} value={form.conductionNumber} onChange={(e) => setForm((prev) => ({ ...prev, conductionNumber: e.target.value.toUpperCase() }))} />
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
                  <label style={styles.label}>Color</label>
                  <input style={styles.input} value={form.color} onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))} />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Odometer KM</label>
                  <input style={styles.input} value={form.odometerKm} onChange={(e) => setForm((prev) => ({ ...prev, odometerKm: e.target.value }))} />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Customer Concern</label>
                <textarea
                  style={styles.textarea}
                  value={form.customerConcern}
                  onChange={(e) => setForm((prev) => ({ ...prev, customerConcern: e.target.value }))}
                  placeholder="Main complaint or requested work"
                />
              </div>

              <div style={styles.sectionCard}>
                <div style={styles.sectionTitle}>Work Lines</div>
                <div style={styles.formStack}>
                  {form.workLines.map((line, index) => (
                    <div key={line.id} style={styles.sectionCardMuted}>
                      <div style={styles.mobileDataCardHeader}>
                        <strong>Line {index + 1}</strong>
                        <button type="button" style={styles.smallButtonMuted} onClick={() => removeDraftWorkLine(line.id)}>
                          Remove
                        </button>
                      </div>

                      <div style={styles.formStack}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Title</label>
                          <input style={styles.input} value={line.title} onChange={(e) => updateDraftLine(line.id, "title", e.target.value)} placeholder="Example: Brake Cleaning" />
                        </div>

                        <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Category</label>
                            <input style={styles.input} value={line.category} onChange={(e) => updateDraftLine(line.id, "category", e.target.value)} placeholder="Engine, Electrical, Suspension" />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Priority</label>
                            <select style={styles.select} value={line.priority} onChange={(e) => updateDraftLine(line.id, "priority", e.target.value)}>
                              <option value="Low">Low</option>
                              <option value="Medium">Medium</option>
                              <option value="High">High</option>
                            </select>
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Line Status</label>
                            <select style={styles.select} value={line.status} onChange={(e) => updateDraftLine(line.id, "status", e.target.value)}>
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Waiting Parts">Waiting Parts</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </div>
                        </div>

                        <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Service Estimate (PHP)</label>
                            <input style={styles.input} value={line.serviceEstimate} onChange={(e) => updateDraftLine(line.id, "serviceEstimate", e.target.value)} />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Parts Estimate (PHP)</label>
                            <input style={styles.input} value={line.partsEstimate} onChange={(e) => updateDraftLine(line.id, "partsEstimate", e.target.value)} />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Total Estimate</label>
                            <input style={styles.input} value={formatCurrency(parseMoneyInput(line.totalEstimate))} readOnly />
                          </div>
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Notes</label>
                          <textarea style={styles.textarea} value={line.notes} onChange={(e) => updateDraftLine(line.id, "notes", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={styles.inlineActions}>
                  <button type="button" style={styles.secondaryButton} onClick={addDraftWorkLine}>Add Work Line</button>
                </div>
              </div>

              <div style={styles.sectionCard}>
                <div style={styles.sectionTitle}>Technician Assignment</div>
                <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Primary Technician</label>
                    <select
                      style={styles.select}
                      value={form.primaryTechnicianId}
                      onChange={(e) => setForm((prev) => ({ ...prev, primaryTechnicianId: e.target.value }))}
                    >
                      <option value="">Unassigned</option>
                      {primaryTechnicians.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.fullName} • {user.role}
                        </option>
                      ))}
                    </select>
                    <div style={styles.formHint}>OJT cannot be assigned as primary technician.</div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Supporting Technicians</label>
                    <div style={styles.checkboxList}>
                      {supportTechnicians.map((user) => (
                        <label key={user.id} style={styles.checkboxTile}>
                          <input
                            type="checkbox"
                            checked={form.supportTechnicianIds.includes(user.id)}
                            onChange={() => handleSupportToggle(user.id)}
                          />
                          <span>{user.fullName} • {user.role}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {error ? <div style={styles.errorBox}>{error}</div> : null}

              <div style={isCompactLayout ? styles.stickyActionBar : styles.inlineActions}>
                <button type="submit" style={styles.primaryButton}>Create RO</button>
                <button type="button" style={styles.secondaryButton} onClick={resetForm}>Reset</button>
              </div>
            </form>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }}>
          <Card
            title="Repair Order Registry"
            subtitle="Newest to oldest, with live mobile-friendly detail editing"
            right={<span style={styles.statusNeutral}>{repairOrders.length} total</span>}
          >
            <div style={styles.formGroup}>
              <label style={styles.label}>Search</label>
              <input
                style={styles.input}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search RO no., plate, customer, status, concern"
              />
            </div>

            {filteredRepairOrders.length === 0 ? (
              <div style={styles.emptyState}>No repair orders saved yet.</div>
            ) : (
              <div style={styles.mobileCardList}>
                {filteredRepairOrders.map((row) => (
                  <button
                    key={row.id}
                    type="button"
                    onClick={() => setSelectedRoId(row.id)}
                    style={{
                      ...styles.mobileDataCardButton,
                      ...(selectedRoId === row.id ? styles.mobileDataCardButtonActive : {}),
                    }}
                  >
                    <div style={styles.mobileDataCardHeader}>
                      <strong>{row.roNumber}</strong>
                      <ROStatusBadge status={row.status} />
                    </div>
                    <div style={styles.mobileDataPrimary}>
                      {row.plateNumber || row.conductionNumber || "-"}
                    </div>
                    <div style={styles.mobileDataSecondary}>{row.accountLabel}</div>
                    <div style={styles.mobileDataSecondary}>
                      {[row.make, row.model, row.year].filter(Boolean).join(" ") || "-"}
                    </div>
                    <div style={styles.mobileMetaRow}>
                      <span>Source</span>
                      <strong>{row.sourceType}</strong>
                    </div>
                    <div style={styles.mobileMetaRow}>
                      <span>Estimate</span>
                      <strong>{formatCurrency(row.workLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0))}</strong>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedRO ? (
              <div style={styles.detailPanel}>
                <div style={styles.cardHeader}>
                  <div>
                    <div style={styles.cardTitle}>{selectedRO.roNumber}</div>
                    <div style={styles.cardSubtitle}>Linked intake is optional. Inspection is optional.</div>
                  </div>
                  <ROStatusBadge status={selectedRO.status} />
                </div>

                <div style={styles.summaryPanel}>
                  <div style={styles.summaryGrid}>
                    <div><strong>Account:</strong> {selectedRO.accountLabel}</div>
                    <div><strong>Plate:</strong> {selectedRO.plateNumber || "-"}</div>
                    <div><strong>Conduction:</strong> {selectedRO.conductionNumber || "-"}</div>
                    <div><strong>Vehicle:</strong> {[selectedRO.make, selectedRO.model, selectedRO.year].filter(Boolean).join(" ") || "-"}</div>
                    <div><strong>Intake No.:</strong> {selectedRO.intakeNumber || "Manual"}</div>
                    <div><strong>Inspection No.:</strong> {selectedRO.inspectionNumber || "None"}</div>
                  </div>
                  <div style={styles.concernBanner}>
                    <strong>Concern:</strong> {selectedRO.customerConcern}
                  </div>
                </div>

                <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>RO Status</label>
                    <select
                      style={styles.select}
                      value={selectedRO.status}
                      onChange={(e) => updateRO(selectedRO.id, { status: e.target.value as ROStatus })}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Waiting Inspection">Waiting Inspection</option>
                      <option value="Waiting Approval">Waiting Approval</option>
                      <option value="Approved / Ready to Work">Approved / Ready to Work</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Waiting Parts">Waiting Parts</option>
                      <option value="Quality Check">Quality Check</option>
                      <option value="Ready Release">Ready Release</option>
                      <option value="Released">Released</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Primary Technician</label>
                    <select
                      style={styles.select}
                      value={selectedRO.primaryTechnicianId}
                      onChange={(e) => updateRO(selectedRO.id, { primaryTechnicianId: e.target.value })}
                    >
                      <option value="">Unassigned</option>
                      {primaryTechnicians.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.fullName} • {user.role}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={styles.summaryGrid}>
                  <div><strong>Primary Tech:</strong> {selectedRO.primaryTechnicianId ? getUserLabel(selectedRO.primaryTechnicianId) : "Unassigned"}</div>
                  <div><strong>Support:</strong> {selectedRO.supportTechnicianIds.length ? selectedRO.supportTechnicianIds.map(getUserLabel).join(", ") : "None"}</div>
                  <div><strong>Total Estimate:</strong> {formatCurrency(selectedROTotal)}</div>
                  <div><strong>Updated:</strong> {formatDateTime(selectedRO.updatedAt)}</div>
                </div>

                <div style={styles.sectionCard}>
                  <div style={styles.mobileDataCardHeader}>
                    <div>
                      <div style={styles.sectionTitle}>Customer Approval Layer</div>
                      <div style={styles.formHint}>Advisor view for internal control, plus a customer-friendly approval preview inspired by digital estimate workflows.</div>
                    </div>
                    <div style={styles.inlineActions}>
                      <button
                        type="button"
                        style={approvalPreviewMode === "Advisor" ? styles.smallButton : styles.smallButtonMuted}
                        onClick={() => setApprovalPreviewMode("Advisor")}
                      >
                        Advisor View
                      </button>
                      <button
                        type="button"
                        style={approvalPreviewMode === "Customer" ? styles.smallButtonSuccess : styles.smallButtonMuted}
                        onClick={() => setApprovalPreviewMode("Customer")}
                      >
                        Customer View
                      </button>
                    </div>
                  </div>

                  <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Approval Summary</label>
                      <textarea
                        style={styles.textarea}
                        value={approvalSummary}
                        onChange={(e) => setApprovalSummary(e.target.value)}
                        placeholder="Customer-friendly approval summary / estimate notes"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Communication Hook</label>
                      <input
                        style={styles.input}
                        value={approvalCommHook}
                        onChange={(e) => setApprovalCommHook(e.target.value)}
                        placeholder="SMS / email placeholder"
                      />
                      <div style={styles.formHint}>Use this as the delivery method label for SMS, email, Viber, or WhatsApp.</div>
                    </div>
                  </div>

                  <div style={styles.summaryGrid}>
                    <div>
                      <strong>Approved</strong>
                      <div>{selectedRO.workLines.filter((line) => line.approvalDecision === "Approved").length}</div>
                    </div>
                    <div>
                      <strong>Declined</strong>
                      <div>{selectedRO.workLines.filter((line) => line.approvalDecision === "Declined").length}</div>
                    </div>
                    <div>
                      <strong>Deferred</strong>
                      <div>{selectedRO.workLines.filter((line) => line.approvalDecision === "Deferred").length}</div>
                    </div>
                    <div>
                      <strong>Pending</strong>
                      <div>{selectedRO.workLines.filter((line) => (line.approvalDecision ?? "Pending") === "Pending").length}</div>
                    </div>
                  </div>

                  <div style={{ ...styles.inlineActions, marginTop: 12, flexWrap: "wrap" }}>
                    <button type="button" style={styles.smallButtonSuccess} onClick={() => setBulkLineDecision("Approved")}>
                      Approve All Pending
                    </button>
                    <button type="button" style={styles.smallButton} onClick={() => setBulkLineDecision("Deferred")}>
                      Defer All Pending
                    </button>
                    <button type="button" style={styles.smallButtonDanger} onClick={() => setBulkLineDecision("Declined")}>
                      Decline All Pending
                    </button>
                  </div>

                  {approvalPreviewMode === "Customer" ? (
                    <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                      <div style={styles.sectionTitle}>Customer-Friendly Approval Preview</div>
                      <div style={styles.mobileCardList}>
                        {selectedRO.workLines.map((line) => {
                          const decision =
                            line.approvalDecision ??
                            selectedApproval?.items.find((item) => item.workLineId === line.id)?.decision ??
                            "Pending";

                          return (
                            <div key={`customer_approval_${line.id}`} style={{ ...styles.mobileDataCard, border: "1px solid rgba(37, 99, 235, 0.12)", background: "#ffffff" }}>
                              <div style={styles.mobileDataCardHeader}>
                                <strong>{line.title || "Untitled Work Line"}</strong>
                                <span style={getApprovalDecisionStyle(decision)}>{decision}</span>
                              </div>
                              <div style={styles.mobileDataSecondary}>
                                {line.category || "General"} • {formatCurrency(parseMoneyInput(line.totalEstimate))}
                              </div>
                              <div style={styles.concernCard}>{getCustomerFriendlyLineDescription(line)}</div>
                              {line.notes ? <div style={styles.formHint}>Tech notes: {line.notes}</div> : null}
                              <div style={styles.inlineActions}>
                                <button type="button" style={styles.smallButtonSuccess} onClick={() => setLineDecision("Approved", line.id)}>Approve</button>
                                <button type="button" style={styles.smallButtonMuted} onClick={() => setLineDecision("Deferred", line.id)}>Defer</button>
                                <button type="button" style={styles.smallButtonDanger} onClick={() => setLineDecision("Declined", line.id)}>Decline</button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Message Preview</label>
                        <textarea
                          style={styles.textareaLarge}
                          value={customerApprovalMessage}
                          readOnly
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ ...styles.mobileCardList, marginTop: 12 }}>
                      {selectedRO.workLines.map((line) => {
                        const decision =
                          line.approvalDecision ??
                          selectedApproval?.items.find((item) => item.workLineId === line.id)?.decision ??
                          "Pending";
                        const approvedAt =
                          line.approvalAt ||
                          selectedApproval?.items.find((item) => item.workLineId === line.id)?.approvedAt ||
                          "";

                        return (
                          <div key={`approval_${line.id}`} style={styles.mobileDataCard}>
                            <div style={styles.mobileDataCardHeader}>
                              <strong>{line.title || "Untitled Work Line"}</strong>
                              <span style={getApprovalDecisionStyle(decision)}>{decision}</span>
                            </div>
                            <div style={styles.mobileDataSecondary}>
                              {line.category || "General"} • {formatCurrency(parseMoneyInput(line.totalEstimate))}
                            </div>
                            {line.recommendationSource ? (
                              <div style={styles.formHint}>Source: {line.recommendationSource}</div>
                            ) : null}
                            {approvedAt ? <div style={styles.formHint}>Decision Time: {formatDateTime(approvedAt)}</div> : null}
                            {line.notes ? <div style={styles.concernCard}>{line.notes}</div> : null}
                            <div style={styles.inlineActions}>
                              <button type="button" style={styles.smallButtonSuccess} onClick={() => setLineDecision("Approved", line.id)}>Approve</button>
                              <button type="button" style={styles.smallButtonMuted} onClick={() => setLineDecision("Deferred", line.id)}>Defer</button>
                              <button type="button" style={styles.smallButtonDanger} onClick={() => setLineDecision("Declined", line.id)}>Decline</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedApproval ? (
                    <div style={styles.formHint}>
                      Last approval record: {selectedApproval.approvalNumber} • {formatDateTime(selectedApproval.createdAt)} • Deferred: {selectedRO.deferredLineTitles.length ? selectedRO.deferredLineTitles.join(", ") : "None"} • Hook: {selectedApproval.communicationHook}
                    </div>
                  ) : null}
                </div>

                <div style={styles.sectionCard}>
                  <div style={styles.sectionTitle}>Backjob / Comeback Tracking</div>
                  <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Complaint</label>
                      <input style={styles.input} value={backjobComplaint} onChange={(e) => setBackjobComplaint(e.target.value)} placeholder="Describe comeback issue" />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Root Cause</label>
                      <input style={styles.input} value={backjobRootCause} onChange={(e) => setBackjobRootCause(e.target.value)} placeholder="Root cause / source" />
                    </div>
                  </div>
                  <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Responsibility</label>
                      <select style={styles.select} value={backjobOutcome} onChange={(e) => setBackjobOutcome(e.target.value as BackjobOutcome)}>
                        <option value="Customer Pay">Customer Pay</option>
                        <option value="Internal">Internal</option>
                        <option value="Warranty">Warranty</option>
                        <option value="Goodwill">Goodwill</option>
                      </select>
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Resolution Notes</label>
                      <input style={styles.input} value={backjobResolutionNotes} onChange={(e) => setBackjobResolutionNotes(e.target.value)} placeholder="Action taken / resolution" />
                    </div>
                  </div>
                  <div style={styles.inlineActions}>
                    <button type="button" style={styles.secondaryButton} onClick={createBackjob}>Save Backjob Record</button>
                  </div>
                  {selectedBackjobs.length ? (
                    <div style={styles.mobileCardList}>
                      {selectedBackjobs.slice(0, 3).map((item) => (
                        <div key={item.id} style={styles.mobileDataCard}>
                          <div style={styles.mobileDataCardHeader}>
                            <strong>{item.backjobNumber}</strong>
                            <span style={styles.statusWarning}>{item.responsibility}</span>
                          </div>
                          <div style={styles.mobileDataSecondary}>{item.complaint}</div>
                          <div style={styles.formHint}>{item.rootCause || "No root cause entered"}</div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>

                <div style={styles.sectionCard}>
                  <div style={styles.mobileDataCardHeader}>
                    <div style={styles.sectionTitle}>Work Lines</div>
                    <button type="button" style={styles.secondaryButton} onClick={() => addROWorkLine(selectedRO.id)}>Add Work Line</button>
                  </div>

                  <div style={styles.formStack}>
                    {selectedRO.workLines.map((line, index) => (
                      <div key={line.id} style={styles.sectionCardMuted}>
                        <div style={styles.mobileDataCardHeader}>
                          <strong>Line {index + 1}</strong>
                          <div style={styles.inlineActions}>
                            <WorkLineStatusBadge status={line.status} />
                            <button type="button" style={styles.smallButtonMuted} onClick={() => removeROWorkLine(selectedRO.id, line.id)}>Remove</button>
                          </div>
                        </div>

                        <div style={styles.formStack}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Title</label>
                            <input style={styles.input} value={line.title} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "title", e.target.value)} />
                          </div>

                          <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Category</label>
                              <input style={styles.input} value={line.category} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "category", e.target.value)} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Priority</label>
                              <select style={styles.select} value={line.priority} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "priority", e.target.value)}>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                              </select>
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Status</label>
                              <select style={styles.select} value={line.status} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "status", e.target.value)}>
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Waiting Parts">Waiting Parts</option>
                                <option value="Completed">Completed</option>
                              </select>
                            </div>
                          </div>

                          <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Service Estimate</label>
                              <input style={styles.input} value={line.serviceEstimate} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "serviceEstimate", e.target.value)} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Parts Estimate</label>
                              <input style={styles.input} value={line.partsEstimate} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "partsEstimate", e.target.value)} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Total</label>
                              <input style={styles.input} value={formatCurrency(parseMoneyInput(line.totalEstimate))} readOnly />
                            </div>
                          </div>

                          <div style={styles.formGroup}>
                            <label style={styles.label}>Notes</label>
                            <textarea style={styles.textarea} value={line.notes} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "notes", e.target.value)} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </div>
  );
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


  const history = useMemo(
    () =>
      [...qcRecords]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10),
    [qcRecords]
  );

  const submitQC = (result: QCResult) => {
    if (!selectedRO || !canPerformQC) return;
    if (result === "Failed" && !notes.trim()) {
      setError("Failure notes are required when QC fails.");
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
            right={canPerformQC ? <span style={styles.statusOk}>QC Allowed</span> : <span style={styles.statusLocked}>QC Locked</span>}
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

function ReleasePage({
  currentUser,
  repairOrders,
  setRepairOrders,
  qcRecords,
  releaseRecords,
  setReleaseRecords,
  invoiceRecords,
  setInvoiceRecords,
  paymentRecords,
  setPaymentRecords,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  repairOrders: RepairOrderRecord[];
  setRepairOrders: React.Dispatch<React.SetStateAction<RepairOrderRecord[]>>;
  qcRecords: QCRecord[];
  releaseRecords: ReleaseRecord[];
  setReleaseRecords: React.Dispatch<React.SetStateAction<ReleaseRecord[]>>;
  invoiceRecords: InvoiceRecord[];
  setInvoiceRecords: React.Dispatch<React.SetStateAction<InvoiceRecord[]>>;
  paymentRecords: PaymentRecord[];
  setPaymentRecords: React.Dispatch<React.SetStateAction<PaymentRecord[]>>;
  isCompactLayout: boolean;
}) {
  const queue = useMemo(
    () =>
      [...repairOrders]
        .filter((row) => row.status === "Ready Release" || row.status === "Released")
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
    [repairOrders]
  );

  const [selectedRoId, setSelectedRoId] = useState("");
  const [finalServiceAmount, setFinalServiceAmount] = useState("");
  const [finalPartsAmount, setFinalPartsAmount] = useState("");
  const [discountAmount, setDiscountAmount] = useState("0");
  const [invoiceNotes, setInvoiceNotes] = useState("");
  const [invoiceStatus, setInvoiceStatus] = useState<InvoiceStatus>("Draft");
  const [chargeAccountApproved, setChargeAccountApproved] = useState(false);
  const [releaseSummary, setReleaseSummary] = useState("");
  const [documentsReady, setDocumentsReady] = useState(true);
  const [noNewDamage, setNoNewDamage] = useState(true);
  const [cleanVehicle, setCleanVehicle] = useState(true);
  const [toolsRemoved, setToolsRemoved] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("Cash");
  const [paymentReferenceNumber, setPaymentReferenceNumber] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedRoId && queue[0]) setSelectedRoId(queue[0].id);
    if (selectedRoId && !queue.some((row) => row.id === selectedRoId)) {
      setSelectedRoId(queue[0]?.id ?? "");
    }
  }, [queue, selectedRoId]);

  const selectedRO = useMemo(
    () => queue.find((row) => row.id === selectedRoId) ?? null,
    [queue, selectedRoId]
  );

  const selectedInvoice = useMemo(
    () => (selectedRO ? invoiceRecords.find((row) => row.roId === selectedRO.id) ?? null : null),
    [invoiceRecords, selectedRO]
  );

  const linkedPayments = useMemo(
    () => (selectedInvoice ? paymentRecords.filter((row) => row.invoiceId === selectedInvoice.id) : []),
    [paymentRecords, selectedInvoice]
  );

  const totalPaidAmount = linkedPayments.reduce((sum, row) => sum + parseMoneyInput(row.amount), 0);

  const passedQcRoIds = useMemo(
    () => new Set(qcRecords.filter((row) => row.result === "Passed").map((row) => row.roId)),
    [qcRecords]
  );

  useEffect(() => {
    if (!selectedRO) return;
    const service = selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.serviceEstimate), 0);
    const parts = selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.partsEstimate), 0);
    if (selectedInvoice) {
      setFinalServiceAmount(selectedInvoice.laborSubtotal || String(service || ""));
      setFinalPartsAmount(selectedInvoice.partsSubtotal || String(parts || ""));
      setDiscountAmount(selectedInvoice.discountAmount || "0");
      setInvoiceNotes(selectedInvoice.notes || "");
      setInvoiceStatus(selectedInvoice.status);
      setChargeAccountApproved(selectedInvoice.chargeAccountApproved);
    } else {
      setFinalServiceAmount(String(service || ""));
      setFinalPartsAmount(String(parts || ""));
      setDiscountAmount("0");
      setInvoiceNotes("");
      setInvoiceStatus("Draft");
      setChargeAccountApproved(false);
    }
    if (!releaseSummary) {
      setReleaseSummary(
        selectedRO.workLines.map((line) => `${line.title} (${line.status})`).join(", ")
      );
    }
    setPaymentAmount("");
    setPaymentMethod("Cash");
    setPaymentReferenceNumber("");
    setPaymentNotes("");
  }, [selectedRO, selectedInvoice]);

  const finalTotalAmount = calculateInvoiceTotal(finalServiceAmount, finalPartsAmount, discountAmount).toFixed(2);
  const effectivePaymentStatus = getPaymentStatusFromAmounts(finalTotalAmount, totalPaidAmount);


  const upsertInvoice = (nextStatus?: InvoiceStatus) => {
    if (!selectedRO) return null;
    const now = new Date().toISOString();
    const invoiceTotal = calculateInvoiceTotal(finalServiceAmount, finalPartsAmount, discountAmount);
    const invoiceId = selectedInvoice?.id ?? uid("inv");
    const invoiceRecord: InvoiceRecord = {
      id: invoiceId,
      invoiceNumber: selectedInvoice?.invoiceNumber ?? nextDailyNumber("INV"),
      roId: selectedRO.id,
      roNumber: selectedRO.roNumber,
      createdAt: selectedInvoice?.createdAt ?? now,
      updatedAt: now,
      createdBy: selectedInvoice?.createdBy ?? currentUser.fullName,
      laborSubtotal: finalServiceAmount,
      partsSubtotal: finalPartsAmount,
      discountAmount,
      totalAmount: invoiceTotal.toFixed(2),
      status: nextStatus ?? invoiceStatus,
      paymentStatus: getPaymentStatusFromAmounts(invoiceTotal.toFixed(2), totalPaidAmount),
      chargeAccountApproved,
      notes: invoiceNotes.trim(),
    };
    setInvoiceRecords((prev) => {
      const exists = prev.some((row) => row.id === invoiceRecord.id);
      return exists ? prev.map((row) => (row.id === invoiceRecord.id ? invoiceRecord : row)) : [invoiceRecord, ...prev];
    });
    if (nextStatus) setInvoiceStatus(nextStatus);
    return invoiceRecord;
  };

  const addPayment = () => {
    if (!selectedRO) return;
    const amount = parseMoneyInput(paymentAmount);
    if (amount <= 0) {
      setError("Enter a valid payment amount.");
      return;
    }
    const invoice = upsertInvoice(invoiceStatus === "Voided" ? "Draft" : "Finalized");
    if (!invoice) return;
    const paymentRecord: PaymentRecord = {
      id: uid("pay"),
      paymentNumber: nextDailyNumber("PAY"),
      invoiceId: invoice.id,
      roId: selectedRO.id,
      roNumber: selectedRO.roNumber,
      createdAt: new Date().toISOString(),
      receivedBy: currentUser.fullName,
      amount: amount.toFixed(2),
      method: paymentMethod,
      referenceNumber: paymentReferenceNumber.trim(),
      notes: paymentNotes.trim(),
    };
    const nextTotalPaid = totalPaidAmount + amount;
    const nextPaymentStatus = getPaymentStatusFromAmounts(invoice.totalAmount, nextTotalPaid);
    setPaymentRecords((prev) => [paymentRecord, ...prev]);
    setInvoiceRecords((prev) =>
      prev.map((row) =>
        row.id === invoice.id
          ? { ...row, status: "Finalized", paymentStatus: nextPaymentStatus, updatedAt: new Date().toISOString() }
          : row
      )
    );
    setPaymentAmount("");
    setPaymentReferenceNumber("");
    setPaymentNotes("");
    setError("");
  };

  const history = useMemo(
    () =>
      [...releaseRecords]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 12),
    [releaseRecords]
  );

  const releaseVehicle = () => {
    if (!selectedRO) return;
    const invoice = upsertInvoice("Finalized");
    if (!invoice) return;
    if (!passedQcRoIds.has(selectedRO.id)) {
      setError("A passed QC record is required before release.");
      return;
    }
    const canReleaseForPayment = effectivePaymentStatus === "Paid" || chargeAccountApproved;
    if (!documentsReady || !canReleaseForPayment || !noNewDamage || !cleanVehicle || !toolsRemoved) {
      setError("Complete the release checklist and settle payment or approve charge account before release.");
      return;
    }

    const releaseRecord: ReleaseRecord = {
      id: uid("rel"),
      releaseNumber: nextDailyNumber("REL"),
      roId: selectedRO.id,
      roNumber: selectedRO.roNumber,
      createdAt: new Date().toISOString(),
      releasedBy: currentUser.fullName,
      finalServiceAmount,
      finalPartsAmount,
      finalTotalAmount,
      releaseSummary: releaseSummary.trim(),
      documentsReady,
      paymentSettled: effectivePaymentStatus === "Paid" || chargeAccountApproved,
      noNewDamage,
      cleanVehicle,
      toolsRemoved,
    };

    setReleaseRecords((prev) => [releaseRecord, ...prev]);
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === selectedRO.id
          ? { ...row, status: "Released", updatedAt: new Date().toISOString() }
          : row
      )
    );
    setError("");
  };

  const closeOrder = (roId: string) => {
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === roId ? { ...row, status: "Closed", updatedAt: new Date().toISOString() } : row
      )
    );
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }}>
          <Card
            title="Release Queue"
            subtitle="Ready Release and Released jobs"
            right={<span style={styles.statusOk}>{queue.length} visible</span>}
          >
            {!queue.length ? (
              <div style={styles.emptyState}>No repair orders are ready for release yet.</div>
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
                          <div style={styles.mobileCardSubtitle}>{row.accountLabel}</div>
                        </div>
                        <span style={getROStatusStyle(row.status)}>{row.status}</span>
                      </div>
                      <div style={styles.mobileCardMeta}>
                        {row.plateNumber || row.conductionNumber || "No plate"}
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
          <Card title="Release Form" subtitle="Final gate before vehicle handover">
            {!selectedRO ? (
              <div style={styles.emptyState}>Select a repair order from the release queue.</div>
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
                    <div style={styles.summaryLabel}>QC Gate</div>
                    <div style={styles.summaryValue}>{passedQcRoIds.has(selectedRO.id) ? "Passed" : "Missing"}</div>
                  </div>
                </div>

                <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Final Service Amount</label>
                    <input style={styles.input} value={finalServiceAmount} onChange={(e) => setFinalServiceAmount(e.target.value)} />
                  </div>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Final Parts Amount</label>
                    <input style={styles.input} value={finalPartsAmount} onChange={(e) => setFinalPartsAmount(e.target.value)} />
                  </div>
                </div>


                <div style={styles.summaryBar}>
                  <div>
                    <strong>Total Amount:</strong> {formatCurrency(parseMoneyInput(finalTotalAmount))}
                  </div>
                  <div>
                    <strong>Payment:</strong> <span style={getPaymentStatusStyle(effectivePaymentStatus)}>{effectivePaymentStatus}</span>
                  </div>
                </div>

                <div style={styles.grid}>
                  <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }}>
                    <div style={styles.sectionCard}>
                      <div style={styles.sectionTitle}>Invoice</div>
                      <div style={styles.formStack}>
                        <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Labor Subtotal</label>
                            <input style={styles.input} value={finalServiceAmount} onChange={(e) => setFinalServiceAmount(e.target.value)} />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Parts Subtotal</label>
                            <input style={styles.input} value={finalPartsAmount} onChange={(e) => setFinalPartsAmount(e.target.value)} />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Discount</label>
                            <input style={styles.input} value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} />
                          </div>
                        </div>

                        <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Invoice Status</label>
                            <select style={styles.select} value={invoiceStatus} onChange={(e) => setInvoiceStatus(e.target.value as InvoiceStatus)}>
                              <option value="Draft">Draft</option>
                              <option value="Finalized">Finalized</option>
                              <option value="Voided">Voided</option>
                            </select>
                          </div>
                          <label style={styles.checkboxCard}>
                            <input type="checkbox" checked={chargeAccountApproved} onChange={(e) => setChargeAccountApproved(e.target.checked)} />
                            <span>Charge account / fleet approved</span>
                          </label>
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Invoice Notes</label>
                          <textarea style={styles.textarea} value={invoiceNotes} onChange={(e) => setInvoiceNotes(e.target.value)} placeholder="Invoice note, discount reason, or fleet charge details" />
                        </div>

                        <div style={styles.inlineActions}>
                          <button type="button" style={styles.secondaryButton} onClick={() => upsertInvoice("Draft")}>Save Draft Invoice</button>
                          <button type="button" style={styles.primaryButton} onClick={() => upsertInvoice("Finalized")}>Finalize Invoice</button>
                        </div>

                        <div style={styles.quickAccessList}>
                          <div style={styles.quickAccessRow}>
                            <span>Invoice</span>
                            <strong>{selectedInvoice?.invoiceNumber || "Not created yet"}</strong>
                          </div>
                          <div style={styles.quickAccessRow}>
                            <span>Status</span>
                            <span style={getInvoiceStatusStyle(selectedInvoice?.status || invoiceStatus)}>{selectedInvoice?.status || invoiceStatus}</span>
                          </div>
                          <div style={styles.quickAccessRow}>
                            <span>Open Balance</span>
                            <strong>{formatCurrency(Math.max(parseMoneyInput(finalTotalAmount) - totalPaidAmount, 0))}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }}>
                    <div style={styles.sectionCard}>
                      <div style={styles.sectionTitle}>Payments</div>
                      <div style={styles.formStack}>
                        <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Amount</label>
                            <input style={styles.input} value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} placeholder="Enter payment amount" />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Method</label>
                            <select style={styles.select} value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                              <option value="Cash">Cash</option>
                              <option value="GCash">GCash</option>
                              <option value="Bank Transfer">Bank Transfer</option>
                              <option value="Card">Card</option>
                              <option value="Charge Account / Fleet">Charge Account / Fleet</option>
                            </select>
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Reference</label>
                            <input style={styles.input} value={paymentReferenceNumber} onChange={(e) => setPaymentReferenceNumber(e.target.value)} placeholder="Optional ref no." />
                          </div>
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Payment Notes</label>
                          <input style={styles.input} value={paymentNotes} onChange={(e) => setPaymentNotes(e.target.value)} placeholder="Optional payment notes" />
                        </div>

                        <div style={styles.inlineActions}>
                          <button type="button" style={styles.primaryButton} onClick={addPayment}>Add Payment</button>
                        </div>

                        <div style={styles.quickAccessList}>
                          <div style={styles.quickAccessRow}>
                            <span>Total Paid</span>
                            <strong>{formatCurrency(totalPaidAmount)}</strong>
                          </div>
                          <div style={styles.quickAccessRow}>
                            <span>Payment Status</span>
                            <span style={getPaymentStatusStyle(effectivePaymentStatus)}>{effectivePaymentStatus}</span>
                          </div>
                          <div style={styles.quickAccessRow}>
                            <span>Release Payment Gate</span>
                            <strong>{effectivePaymentStatus === "Paid" || chargeAccountApproved ? "Cleared" : "Blocked"}</strong>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {linkedPayments.length ? (
                  <div style={styles.sectionCard}>
                    <div style={styles.sectionTitle}>Payment History</div>
                    <div style={styles.mobileCardList}>
                      {linkedPayments.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((payment) => (
                        <div key={payment.id} style={styles.mobileDataCard}>
                          <div style={styles.mobileDataCardHeader}>
                            <strong>{payment.paymentNumber}</strong>
                            <span style={styles.statusOk}>{payment.method}</span>
                          </div>
                          <div style={styles.mobileMetaRow}>
                            <span>Amount</span>
                            <strong>{formatCurrency(parseMoneyInput(payment.amount))}</strong>
                          </div>
                          <div style={styles.mobileMetaRow}>
                            <span>Received By</span>
                            <strong>{payment.receivedBy}</strong>
                          </div>
                          <div style={styles.mobileMetaRow}>
                            <span>Date</span>
                            <strong>{formatDateTime(payment.createdAt)}</strong>
                          </div>
                          {payment.referenceNumber ? <div style={styles.formHint}>Ref: {payment.referenceNumber}</div> : null}
                          {payment.notes ? <div style={styles.formHint}>{payment.notes}</div> : null}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : null}

                <div style={styles.formGroup}>
                  <label style={styles.label}>Customer Summary</label>
                  <textarea
                    style={{ ...styles.textarea, minHeight: 120 }}
                    value={releaseSummary}
                    onChange={(e) => setReleaseSummary(e.target.value)}
                    placeholder="Describe the completed work in customer-friendly language."
                  />
                </div>

                <div style={styles.formStack}>
                  <label style={styles.checkboxCard}><input type="checkbox" checked={documentsReady} onChange={(e) => setDocumentsReady(e.target.checked)} /> <span>Documents and paperwork ready</span></label>
                                    <label style={styles.checkboxCard}><input type="checkbox" checked={noNewDamage} onChange={(e) => setNoNewDamage(e.target.checked)} /> <span>No new damage</span></label>
                  <label style={styles.checkboxCard}><input type="checkbox" checked={cleanVehicle} onChange={(e) => setCleanVehicle(e.target.checked)} /> <span>Vehicle clean and ready</span></label>
                  <label style={styles.checkboxCard}><input type="checkbox" checked={toolsRemoved} onChange={(e) => setToolsRemoved(e.target.checked)} /> <span>Tools removed and area checked</span></label>
                </div>

                {error ? <div style={styles.errorBox}>{error}</div> : null}

                <div style={isCompactLayout ? styles.stickyActionBar : styles.inlineActions}>
                  {selectedRO.status !== "Released" ? (
                    <button type="button" style={{ ...styles.primaryButton, ...(isCompactLayout ? styles.actionButtonWide : {}) }} onClick={releaseVehicle}>
                      Release Vehicle
                    </button>
                  ) : null}
                  <button type="button" style={{ ...styles.secondaryButton, ...(isCompactLayout ? styles.actionButtonWide : {}) }} onClick={() => closeOrder(selectedRO.id)}>
                    Close RO
                  </button>
                </div>
              </div>
            )}
          </Card>

          <div style={{ marginTop: 16 }}>
            <Card title="Recent Releases" subtitle="Latest release records">
              {!history.length ? (
                <div style={styles.emptyState}>No release records yet.</div>
              ) : isCompactLayout ? (
                <div style={styles.mobileCardList}>
                  {history.map((row) => (
                    <div key={row.id} style={styles.mobileCard}>
                      <div style={styles.mobileCardHeader}>
                        <div>
                          <div style={styles.mobileCardTitle}>{row.releaseNumber}</div>
                          <div style={styles.mobileCardSubtitle}>{row.roNumber}</div>
                        </div>
                        <span style={styles.statusOk}>Released</span>
                      </div>
                      <div style={styles.mobileCardMeta}>By: {row.releasedBy}</div>
                      <div style={styles.mobileCardMeta}>{formatDateTime(row.createdAt)}</div>
                      <div style={styles.mobileCardMeta}>₱ {row.finalTotalAmount}</div>
                      {row.releaseSummary ? <div style={styles.mobileCardNote}>{row.releaseSummary}</div> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={styles.tableWrap}>
                  <table style={styles.table}>
                    <thead>
                      <tr>
                        <th style={styles.th}>Release No.</th>
                        <th style={styles.th}>RO</th>
                        <th style={styles.th}>By</th>
                        <th style={styles.th}>Date</th>
                        <th style={styles.th}>Final Total</th>
                        <th style={styles.th}>Summary</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.map((row) => (
                        <tr key={row.id}>
                          <td style={styles.td}>{row.releaseNumber}</td>
                          <td style={styles.td}>{row.roNumber}</td>
                          <td style={styles.td}>{row.releasedBy}</td>
                          <td style={styles.td}>{formatDateTime(row.createdAt)}</td>
                          <td style={styles.td}>₱ {row.finalTotalAmount}</td>
                          <td style={styles.td}>{row.releaseSummary || "-"}</td>
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


function UsersPage({
  currentUser,
  users,
  setUsers,
  roleDefinitions,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  users: UserAccount[];
  setUsers: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  roleDefinitions: RoleDefinition[];
  isCompactLayout: boolean;
}) {
  const canManageUsers = hasPermission(currentUser.role, roleDefinitions, "users.manage");

  const [form, setForm] = useState<UserForm>({
    fullName: "",
    username: "",
    password: "",
    role: "Reception",
    active: true,
  });

  const [error, setError] = useState("");

  const resetForm = () => {
    setForm({
      fullName: "",
      username: "",
      password: "",
      role: "Reception",
      active: true,
    });
    setError("");
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canManageUsers) return;

    const fullName = form.fullName.trim();
    const username = form.username.trim().toLowerCase();
    const password = form.password;

    if (!fullName || !username || !password) {
      setError("Full name, username, and password are required.");
      return;
    }

    if (users.some((u) => u.username.toLowerCase() === username)) {
      setError("Username already exists.");
      return;
    }

    const newUser: UserAccount = {
      id: uid("usr"),
      fullName,
      username,
      password,
      role: form.role,
      active: form.active,
      createdAt: new Date().toISOString(),
    };

    setUsers((prev) => [newUser, ...prev]);
    resetForm();
  };

  const toggleUserActive = (id: string) => {
    if (!canManageUsers) return;
    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, active: !user.active } : user))
    );
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }}>
          <Card
            title="Create User"
            subtitle="Action is permission-restricted"
            right={
              <span style={canManageUsers ? styles.statusOk : styles.statusLocked}>
                {canManageUsers ? "Manage Allowed" : "Manage Locked"}
              </span>
            }
          >
            <form onSubmit={handleCreateUser} style={styles.formStack}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Full Name</label>
                <input
                  style={styles.input}
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  disabled={!canManageUsers}
                  placeholder="Enter full name"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Username</label>
                <input
                  style={styles.input}
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  disabled={!canManageUsers}
                  placeholder="Enter username"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  disabled={!canManageUsers}
                  placeholder="Enter password"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Role</label>
                <select
                  style={styles.select}
                  value={form.role}
                  onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value as UserRole }))}
                  disabled={!canManageUsers}
                >
                  {ALL_ROLES.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>

              <label style={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                  disabled={!canManageUsers}
                />
                <span>Active account</span>
              </label>

              {error ? <div style={styles.errorBox}>{error}</div> : null}

              <div style={styles.inlineActions}>
                <button
                  type="submit"
                  style={{
                    ...styles.primaryButton,
                    ...(canManageUsers ? {} : styles.buttonDisabled),
                  }}
                  disabled={!canManageUsers}
                >
                  Add User
                </button>
                <button type="button" style={styles.secondaryButton} onClick={resetForm}>
                  Reset
                </button>
              </div>
            </form>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }}>
          <Card title="User Registry" subtitle="All system users">
            {isCompactLayout ? (
              <div style={styles.mobileCardList}>
                {users.map((user) => (
                  <div key={user.id} style={styles.mobileDataCard}>
                    <div style={styles.mobileDataCardHeader}>
                      <strong>{user.fullName}</strong>
                      <RoleBadge role={user.role} />
                    </div>
                    <div style={styles.mobileDataSecondary}>Username: {user.username}</div>
                    <div style={styles.mobileMetaRow}>
                      <span>Status</span>
                      <span style={user.active ? styles.statusOk : styles.statusLocked}>
                        {user.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                    <div style={styles.mobileMetaRow}>
                      <span>Created</span>
                      <strong>{formatDateTime(user.createdAt)}</strong>
                    </div>
                    <button
                      type="button"
                      style={{
                        ...styles.smallButton,
                        ...(canManageUsers ? {} : styles.buttonDisabled),
                        width: "100%",
                      }}
                      disabled={!canManageUsers || user.role === "Admin"}
                      onClick={() => toggleUserActive(user.id)}
                    >
                      {user.active ? "Deactivate" : "Activate"}
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Name</th>
                      <th style={styles.th}>Username</th>
                      <th style={styles.th}>Role</th>
                      <th style={styles.th}>Status</th>
                      <th style={styles.th}>Created</th>
                      <th style={styles.th}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td style={styles.td}>{user.fullName}</td>
                        <td style={styles.td}>{user.username}</td>
                        <td style={styles.td}>
                          <RoleBadge role={user.role} />
                        </td>
                        <td style={styles.td}>
                          <span style={user.active ? styles.statusOk : styles.statusLocked}>
                            {user.active ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td style={styles.td}>{formatDateTime(user.createdAt)}</td>
                        <td style={styles.td}>
                          <button
                            type="button"
                            style={{
                              ...styles.smallButton,
                              ...(canManageUsers ? {} : styles.buttonDisabled),
                            }}
                            disabled={!canManageUsers || user.role === "Admin"}
                            onClick={() => toggleUserActive(user.id)}
                          >
                            {user.active ? "Deactivate" : "Activate"}
                          </button>
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

function RolesPage({
  currentUser,
  roleDefinitions,
  setRoleDefinitions,
}: {
  currentUser: SessionUser;
  roleDefinitions: RoleDefinition[];
  setRoleDefinitions: React.Dispatch<React.SetStateAction<RoleDefinition[]>>;
}) {
  const canManageRoles = hasPermission(currentUser.role, roleDefinitions, "roles.manage");

  const togglePermission = (role: UserRole, permission: Permission) => {
    if (!canManageRoles || role === "Admin") return;

    setRoleDefinitions((prev) =>
      prev.map((def) => {
        if (def.role !== role) return def;
        const exists = def.permissions.includes(permission);
        const nextPermissions = exists
          ? def.permissions.filter((p) => p !== permission)
          : [...def.permissions, permission];

        return {
          ...def,
          permissions: ALL_PERMISSIONS.filter((p) => nextPermissions.includes(p)),
        };
      })
    );
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title="Position + Permission System"
            subtitle="Sidebar visibility and action access are driven by these permissions"
            right={
              <span style={canManageRoles ? styles.statusOk : styles.statusLocked}>
                {canManageRoles ? "Edit Allowed" : "Edit Locked"}
              </span>
            }
          >
            <div style={styles.rolePermissionStack}>
              {roleDefinitions.map((def) => (
                <div key={def.role} style={styles.rolePermissionCard}>
                  <div style={styles.rolePermissionHeader}>
                    <RoleBadge role={def.role} />
                    {def.role === "Admin" ? (
                      <span style={styles.statusOk}>Full Access</span>
                    ) : (
                      <span style={styles.statusNeutral}>{def.permissions.length} permissions</span>
                    )}
                  </div>

                  <div style={styles.permissionWrap}>
                    {ALL_PERMISSIONS.map((permission) => (
                      <PermissionPill
                        key={`${def.role}_${permission}`}
                        permission={permission}
                        checked={def.role === "Admin" ? true : def.permissions.includes(permission)}
                        onToggle={() => togglePermission(def.role, permission)}
                        disabled={!canManageRoles || def.role === "Admin"}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}


function ShopFloorPage({
  currentUser,
  users,
  repairOrders,
  setRepairOrders,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  users: UserAccount[];
  repairOrders: RepairOrderRecord[];
  setRepairOrders: React.Dispatch<React.SetStateAction<RepairOrderRecord[]>>;
  isCompactLayout: boolean;
}) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"All Jobs" | "My Jobs">(
    ["General Mechanic", "OJT"].includes(currentUser.role) ? "My Jobs" : "All Jobs"
  );
  const [selectedRoId, setSelectedRoId] = useState("");

  const canManageShopFloor = ["Admin", "Chief Technician", "Senior Mechanic"].includes(
    currentUser.role
  );

  const primaryTechnicians = useMemo(
    () =>
      users.filter(
        (user) =>
          user.active &&
          ["Chief Technician", "Senior Mechanic", "General Mechanic"].includes(user.role)
      ),
    [users]
  );

  const supportTechnicians = useMemo(
    () =>
      users.filter(
        (user) =>
          user.active &&
          ["Chief Technician", "Senior Mechanic", "General Mechanic", "OJT"].includes(user.role)
      ),
    [users]
  );

  const sortedRepairOrders = useMemo(
    () =>
      [...repairOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [repairOrders]
  );

  const visibleRepairOrders = useMemo(() => {
    const base =
      viewMode === "My Jobs"
        ? sortedRepairOrders.filter(
            (row) =>
              row.primaryTechnicianId === currentUser.id ||
              row.supportTechnicianIds.includes(currentUser.id)
          )
        : sortedRepairOrders;

    const term = search.trim().toLowerCase();
    if (!term) return base;

    return base.filter((row) =>
      [
        row.roNumber,
        row.plateNumber,
        row.conductionNumber,
        row.accountLabel,
        row.make,
        row.model,
        row.customerConcern,
        row.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [currentUser.id, search, sortedRepairOrders, viewMode]);

  const selectedRO = useMemo(
    () => visibleRepairOrders.find((row) => row.id === selectedRoId) ?? visibleRepairOrders[0] ?? null,
    [selectedRoId, visibleRepairOrders]
  );

  useEffect(() => {
    if (!selectedRoId && visibleRepairOrders.length > 0) {
      setSelectedRoId(visibleRepairOrders[0].id);
      return;
    }

    if (selectedRoId && !visibleRepairOrders.some((row) => row.id === selectedRoId)) {
      setSelectedRoId(visibleRepairOrders[0]?.id ?? "");
    }
  }, [selectedRoId, visibleRepairOrders]);

  const getUserName = (userId: string) =>
    users.find((user) => user.id === userId)?.fullName || "Unassigned";

  const updateRO = (roId: string, patch: Partial<RepairOrderRecord>) => {
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === roId
          ? {
              ...row,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          : row
      )
    );
  };

  const handleStatusChange = (roId: string, status: ROStatus) => {
    if (!canManageShopFloor) return;
    const target = repairOrders.find((row) => row.id === roId);
    if (!target) return;

    updateRO(roId, {
      status,
      workStartedAt:
        status === "In Progress" ? target.workStartedAt || new Date().toISOString() : target.workStartedAt,
    });
  };

  const handlePrimaryChange = (roId: string, technicianId: string) => {
    if (!canManageShopFloor) return;
    updateRO(roId, {
      primaryTechnicianId: technicianId,
      supportTechnicianIds:
        repairOrders.find((row) => row.id === roId)?.supportTechnicianIds.filter((id) => id !== technicianId) ?? [],
    });
  };

  const handleSupportToggle = (roId: string, technicianId: string) => {
    if (!canManageShopFloor) return;
    const target = repairOrders.find((row) => row.id === roId);
    if (!target) return;
    const exists = target.supportTechnicianIds.includes(technicianId);
    updateRO(roId, {
      supportTechnicianIds: exists
        ? target.supportTechnicianIds.filter((id) => id !== technicianId)
        : [...target.supportTechnicianIds.filter((id) => id !== target.primaryTechnicianId), technicianId],
    });
  };

  const statusCounts = useMemo(
    () => ({
      total: sortedRepairOrders.length,
      inProgress: sortedRepairOrders.filter((row) => row.status === "In Progress").length,
      waitingParts: sortedRepairOrders.filter((row) => row.status === "Waiting Parts").length,
      qc: sortedRepairOrders.filter((row) => row.status === "Quality Check").length,
      readyRelease: sortedRepairOrders.filter((row) => row.status === "Ready Release").length,
    }),
    [sortedRepairOrders]
  );

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title="Shop Floor Job Feed"
            subtitle="All repair orders shown newest to oldest, including draft and waiting approval jobs"
            right={<span style={styles.statusInfo}>{visibleRepairOrders.length} visible jobs</span>}
          >
            <div style={styles.heroText}>
              This board uses repair orders as the live job source. It does not use fixed bays. Jobs stay visible from
              draft through closed so management and staff can see the full queue in one place.
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>All Jobs</div>
            <div style={styles.statValue}>{statusCounts.total}</div>
            <div style={styles.statNote}>Full queue from RO records</div>
          </div>
        </div>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>In Progress</div>
            <div style={styles.statValue}>{statusCounts.inProgress}</div>
            <div style={styles.statNote}>Vehicles actively worked on</div>
          </div>
        </div>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Waiting Parts</div>
            <div style={styles.statValue}>{statusCounts.waitingParts}</div>
            <div style={styles.statNote}>Paused for parts availability</div>
          </div>
        </div>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>QC / Ready Release</div>
            <div style={styles.statValue}>{statusCounts.qc + statusCounts.readyRelease}</div>
            <div style={styles.statNote}>Near-completion vehicles</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }}>
          <Card title="Queue Controls" subtitle="Filter the board and open any job">
            <div style={styles.formStack}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Search Jobs</label>
                <input
                  style={styles.input}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="RO number, plate, customer, concern"
                />
              </div>

              <div style={styles.inlineActions}>
                <button
                  type="button"
                  style={{
                    ...styles.secondaryButton,
                    ...(viewMode === "All Jobs" ? { borderColor: "#2563eb", color: "#2563eb" } : {}),
                  }}
                  onClick={() => setViewMode("All Jobs")}
                >
                  All Jobs
                </button>
                <button
                  type="button"
                  style={{
                    ...styles.secondaryButton,
                    ...(viewMode === "My Jobs" ? { borderColor: "#2563eb", color: "#2563eb" } : {}),
                  }}
                  onClick={() => setViewMode("My Jobs")}
                >
                  My Jobs
                </button>
              </div>

              <div style={styles.queueStack}>
                {visibleRepairOrders.length === 0 ? (
                  <div style={styles.emptyState}>No jobs match the current filter.</div>
                ) : isCompactLayout ? (
                  <div style={styles.mobileCardList}>
                    {visibleRepairOrders.map((row) => (
                      <button
                        key={row.id}
                        type="button"
                        style={{
                          ...styles.mobileDataCardButton,
                          ...(selectedRO?.id === row.id ? styles.mobileDataCardButtonActive : {}),
                        }}
                        onClick={() => setSelectedRoId(row.id)}
                      >
                        <div style={styles.mobileDataCardHeader}>
                          <strong>{row.roNumber}</strong>
                          <span style={getROStatusStyle(row.status)}>{row.status}</span>
                        </div>
                        <div style={styles.mobileDataSecondary}>
                          {row.plateNumber || row.conductionNumber || "No plate yet"} • {row.make} {row.model}
                        </div>
                        <div style={styles.mobileDataSecondary}>{row.accountLabel}</div>
                        <div style={styles.mobileMetaRow}>
                          <span>Primary Tech</span>
                          <strong>{row.primaryTechnicianId ? getUserName(row.primaryTechnicianId) : "Unassigned"}</strong>
                        </div>
                        <div style={styles.mobileMetaRow}>
                          <span>Elapsed</span>
                          <strong>{formatElapsedTime(row.workStartedAt)}</strong>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  visibleRepairOrders.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      style={{
                        ...styles.queueCard,
                        ...(selectedRO?.id === row.id ? styles.queueCardActive : {}),
                      }}
                      onClick={() => setSelectedRoId(row.id)}
                    >
                      <div style={styles.queueCardHeader}>
                        <strong>{row.roNumber}</strong>
                        <span style={getROStatusStyle(row.status)}>{row.status}</span>
                      </div>
                      <div style={styles.queueLine}>{row.plateNumber || row.conductionNumber || "No plate yet"}</div>
                      <div style={styles.queueLineMuted}>
                        {row.accountLabel} • {row.make} {row.model}
                      </div>
                      <div style={styles.queueLineMuted}>
                        Primary: {row.primaryTechnicianId ? getUserName(row.primaryTechnicianId) : "Unassigned"}
                      </div>
                      <div style={styles.queueLineMuted}>Elapsed: {formatElapsedTime(row.workStartedAt)}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(8, isCompactLayout) }}>
          <Card
            title="Job Detail"
            subtitle="Live status, technician assignment, and work summary"
            right={
              selectedRO ? (
                <span style={canManageShopFloor ? styles.statusOk : styles.statusNeutral}>
                  {canManageShopFloor ? "Manage Allowed" : "View Only"}
                </span>
              ) : undefined
            }
          >
            {!selectedRO ? (
              <div style={styles.emptyState}>No repair orders are available yet.</div>
            ) : (
              <div style={styles.formStack}>
                <div style={styles.summaryPanel}>
                  <div style={styles.summaryGrid}>
                    <div>
                      <strong>RO Number</strong>
                      <div>{selectedRO.roNumber}</div>
                    </div>
                    <div>
                      <strong>Vehicle</strong>
                      <div>
                        {selectedRO.make} {selectedRO.model} {selectedRO.year}
                      </div>
                    </div>
                    <div>
                      <strong>Plate / Conduction</strong>
                      <div>{selectedRO.plateNumber || selectedRO.conductionNumber || "-"}</div>
                    </div>
                    <div>
                      <strong>Customer</strong>
                      <div>{selectedRO.accountLabel}</div>
                    </div>
                    <div>
                      <strong>Created</strong>
                      <div>{formatDateTime(selectedRO.createdAt)}</div>
                    </div>
                    <div>
                      <strong>Elapsed</strong>
                      <div>{formatElapsedTime(selectedRO.workStartedAt)}</div>
                    </div>
                  </div>

                  <div style={styles.concernBanner}>
                    <strong>Concern:</strong> {selectedRO.customerConcern || "No concern entered."}
                  </div>
                </div>

                <div style={styles.grid}>
                  <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }}>
                    <div style={styles.sectionCard}>
                      <div style={styles.sectionTitle}>Status</div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Current RO Status</label>
                        <select
                          style={styles.select}
                          value={selectedRO.status}
                          disabled={!canManageShopFloor}
                          onChange={(e) => handleStatusChange(selectedRO.id, e.target.value as ROStatus)}
                        >
                          {[
                            "Draft",
                            "Waiting Inspection",
                            "Waiting Approval",
                            "Approved / Ready to Work",
                            "In Progress",
                            "Waiting Parts",
                            "Quality Check",
                            "Ready Release",
                            "Released",
                            "Closed",
                          ].map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div style={isCompactLayout ? styles.stickyActionBar : styles.inlineActions}>
                        <button
                          type="button"
                          style={{
                            ...styles.primaryButton,
                            ...(canManageShopFloor ? {} : styles.buttonDisabled),
                          }}
                          disabled={!canManageShopFloor}
                          onClick={() => handleStatusChange(selectedRO.id, "In Progress")}
                        >
                          Start Work
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.secondaryButton,
                            ...(canManageShopFloor ? {} : styles.buttonDisabled),
                          }}
                          disabled={!canManageShopFloor}
                          onClick={() => handleStatusChange(selectedRO.id, "Waiting Parts")}
                        >
                          Waiting Parts
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.secondaryButton,
                            ...(canManageShopFloor ? {} : styles.buttonDisabled),
                          }}
                          disabled={!canManageShopFloor}
                          onClick={() => handleStatusChange(selectedRO.id, "Quality Check")}
                        >
                          Send QC
                        </button>
                        <button
                          type="button"
                          style={{
                            ...styles.secondaryButton,
                            ...(canManageShopFloor ? {} : styles.buttonDisabled),
                          }}
                          disabled={!canManageShopFloor}
                          onClick={() => handleStatusChange(selectedRO.id, "Ready Release")}
                        >
                          Ready Release
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }}>
                    <div style={styles.sectionCard}>
                      <div style={styles.sectionTitle}>Technicians</div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Primary Technician</label>
                        <select
                          style={styles.select}
                          value={selectedRO.primaryTechnicianId}
                          disabled={!canManageShopFloor}
                          onChange={(e) => handlePrimaryChange(selectedRO.id, e.target.value)}
                        >
                          <option value="">Select primary technician</option>
                          {primaryTechnicians.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.fullName} — {user.role}
                            </option>
                          ))}
                        </select>
                        <div style={styles.formHint}>OJT is excluded from primary technician assignment.</div>
                      </div>

                      <div style={styles.formGroup}>
                        <label style={styles.label}>Support Technicians</label>
                        <div style={styles.checkboxList}>
                          {supportTechnicians.map((user) => (
                            <label key={user.id} style={styles.checkboxRow}>
                              <input
                                type="checkbox"
                                checked={selectedRO.supportTechnicianIds.includes(user.id)}
                                disabled={!canManageShopFloor || user.id === selectedRO.primaryTechnicianId}
                                onChange={() => handleSupportToggle(selectedRO.id, user.id)}
                              />
                              <span>
                                {user.fullName} — {user.role}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={styles.sectionCard}>
                  <div style={styles.sectionTitle}>Work Summary</div>
                  <div style={styles.mobileCardList}>
                    {selectedRO.workLines.map((line) => (
                      <div key={line.id} style={styles.mobileDataCard}>
                        <div style={styles.mobileDataCardHeader}>
                          <strong>{line.title || "Untitled Work Line"}</strong>
                          <span style={getWorkLineStatusStyle(line.status)}>{line.status}</span>
                        </div>
                        <div style={styles.mobileDataSecondary}>
                          {line.category} • Priority {line.priority}
                        </div>
                        <div style={styles.mobileMetaRow}>
                          <span>Service Estimate</span>
                          <strong>{formatCurrency(parseMoneyInput(line.serviceEstimate))}</strong>
                        </div>
                        <div style={styles.mobileMetaRow}>
                          <span>Parts Estimate</span>
                          <strong>{formatCurrency(parseMoneyInput(line.partsEstimate))}</strong>
                        </div>
                        <div style={styles.mobileMetaRow}>
                          <span>Total Estimate</span>
                          <strong>{formatCurrency(parseMoneyInput(line.totalEstimate))}</strong>
                        </div>
                        {line.notes ? <div style={styles.formHint}>{line.notes}</div> : null}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}


function PartsPage({
  currentUser,
  repairOrders,
  setRepairOrders,
  partsRequests,
  setPartsRequests,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  repairOrders: RepairOrderRecord[];
  setRepairOrders: React.Dispatch<React.SetStateAction<RepairOrderRecord[]>>;
  partsRequests: PartsRequestRecord[];
  setPartsRequests: React.Dispatch<React.SetStateAction<PartsRequestRecord[]>>;
  isCompactLayout: boolean;
}) {
  const [search, setSearch] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [createForm, setCreateForm] = useState({
    roId: "",
    partName: "",
    partNumber: "",
    quantity: "1",
    urgency: "Medium" as PartsRequestUrgency,
    notes: "",
    customerSellingPrice: "",
  });
  const [bidForm, setBidForm] = useState({
    supplierName: "",
    brand: "",
    quantity: "1",
    unitCost: "",
    deliveryTime: "",
    warrantyNote: "",
    condition: "Brand New" as SupplierBidCondition,
    notes: "",
  });
  const [createError, setCreateError] = useState("");
  const [bidError, setBidError] = useState("");

  const sortedRepairOrders = useMemo(
    () =>
      [...repairOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [repairOrders]
  );

  const sortedRequests = useMemo(
    () =>
      [...partsRequests].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ),
    [partsRequests]
  );

  const visibleRequests = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return sortedRequests;
    return sortedRequests.filter((row) =>
      [
        row.requestNumber,
        row.roNumber,
        row.partName,
        row.partNumber,
        row.plateNumber,
        row.vehicleLabel,
        row.accountLabel,
        row.status,
        row.urgency,
      ]
        .join(" ")
        .toLowerCase()
        .includes(term)
    );
  }, [search, sortedRequests]);

  const selectedRequest = useMemo(
    () => visibleRequests.find((row) => row.id === selectedRequestId) ?? visibleRequests[0] ?? null,
    [selectedRequestId, visibleRequests]
  );

  useEffect(() => {
    if (!selectedRequestId && visibleRequests.length > 0) {
      setSelectedRequestId(visibleRequests[0].id);
      return;
    }
    if (selectedRequestId && !visibleRequests.some((row) => row.id === selectedRequestId)) {
      setSelectedRequestId(visibleRequests[0]?.id ?? "");
    }
  }, [selectedRequestId, visibleRequests]);

  const selectedRO = useMemo(
    () => sortedRepairOrders.find((row) => row.id === createForm.roId) ?? null,
    [createForm.roId, sortedRepairOrders]
  );

  const setLinkedRoStatus = (roId: string, status: ROStatus) => {
    if (!roId) return;
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === roId && !["Released", "Closed"].includes(row.status)
          ? { ...row, status, updatedAt: new Date().toISOString() }
          : row
      )
    );
  };

  const createRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.roId) {
      setCreateError("Please select a linked RO.");
      return;
    }
    const partName = createForm.partName.trim();
    const quantity = createForm.quantity.trim();
    if (!partName || !quantity) {
      setCreateError("Part name and quantity are required.");
      return;
    }
    const ro = sortedRepairOrders.find((row) => row.id === createForm.roId);
    if (!ro) {
      setCreateError("Linked RO not found.");
      return;
    }

    const record: PartsRequestRecord = {
      id: uid("prq"),
      requestNumber: nextDailyNumber("PR"),
      roId: ro.id,
      roNumber: ro.roNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requestedBy: currentUser.fullName,
      status: "Draft",
      partName,
      partNumber: createForm.partNumber.trim(),
      quantity,
      urgency: createForm.urgency,
      notes: createForm.notes.trim(),
      customerSellingPrice: createForm.customerSellingPrice.trim(),
      selectedBidId: "",
      plateNumber: ro.plateNumber || ro.conductionNumber,
      vehicleLabel: [ro.make, ro.model, ro.year].filter(Boolean).join(" "),
      accountLabel: ro.accountLabel,
      bids: [],
    };

    setPartsRequests((prev) => [record, ...prev]);
    setSelectedRequestId(record.id);
    setCreateForm({
      roId: "",
      partName: "",
      partNumber: "",
      quantity: "1",
      urgency: "Medium",
      notes: "",
      customerSellingPrice: "",
    });
    setCreateError("");
    setLinkedRoStatus(ro.id, "Waiting Parts");
  };

  const updateRequest = (requestId: string, patch: Partial<PartsRequestRecord>) => {
    setPartsRequests((prev) =>
      prev.map((row) =>
        row.id === requestId
          ? {
              ...row,
              ...patch,
              updatedAt: new Date().toISOString(),
            }
          : row
      )
    );
  };

  const addBid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    const supplierName = bidForm.supplierName.trim();
    const unitCost = bidForm.unitCost.trim();
    if (!supplierName || !unitCost) {
      setBidError("Supplier name and unit cost are required.");
      return;
    }
    const quantity = bidForm.quantity.trim() || selectedRequest.quantity || "1";
    const totalCost = String(parseMoneyInput(unitCost) * Math.max(Number(quantity) || 1, 1));
    const bid: SupplierBid = {
      id: uid("bid"),
      supplierName,
      brand: bidForm.brand.trim(),
      quantity,
      unitCost,
      totalCost,
      deliveryTime: bidForm.deliveryTime.trim(),
      warrantyNote: bidForm.warrantyNote.trim(),
      condition: bidForm.condition,
      notes: bidForm.notes.trim(),
      createdAt: new Date().toISOString(),
    };
    updateRequest(selectedRequest.id, {
      bids: [bid, ...selectedRequest.bids],
      status: selectedRequest.status === "Draft" || selectedRequest.status === "Requested" ? "Waiting for Bids" : selectedRequest.status,
    });
    setBidForm({
      supplierName: "",
      brand: "",
      quantity: selectedRequest.quantity || "1",
      unitCost: "",
      deliveryTime: "",
      warrantyNote: "",
      condition: "Brand New",
      notes: "",
    });
    setBidError("");
  };

  const selectBid = (request: PartsRequestRecord, bidId: string) => {
    updateRequest(request.id, { selectedBidId: bidId, status: "Supplier Selected" });
  };

  const selectedBid = selectedRequest?.bids.find((bid) => bid.id === selectedRequest.selectedBidId) ?? null;
  const internalCost = selectedBid ? parseMoneyInput(selectedBid.totalCost) : 0;
  const customerPrice = selectedRequest ? parseMoneyInput(selectedRequest.customerSellingPrice) : 0;
  const estimatedMargin = customerPrice - internalCost;

  const setRequestStatus = (request: PartsRequestRecord, status: PartsRequestStatus) => {
    updateRequest(request.id, { status });
    if (status === "Arrived" || status === "Parts Arrived") {
      setLinkedRoStatus(request.roId, "In Progress");
    }
    if (["Draft", "Requested", "Sent to Suppliers", "Waiting for Bids", "Bidding", "Supplier Selected", "Ordered", "Shipped"].includes(status)) {
      setLinkedRoStatus(request.roId, "Waiting Parts");
    }
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }}>
          <Card title="Create Parts Request" subtitle="Linked to an existing RO with supplier bidding support">
            <form onSubmit={createRequest} style={styles.formStack}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Linked RO</label>
                <select
                  style={styles.select}
                  value={createForm.roId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, roId: e.target.value }))}
                >
                  <option value="">Select repair order</option>
                  {sortedRepairOrders.map((row) => (
                    <option key={row.id} value={row.id}>
                      {row.roNumber} — {row.plateNumber || row.conductionNumber || "No Plate"} — {row.accountLabel}
                    </option>
                  ))}
                </select>
                {selectedRO ? (
                  <div style={styles.formHint}>
                    Vehicle: {[selectedRO.make, selectedRO.model, selectedRO.year].filter(Boolean).join(" ")} • Status: {selectedRO.status}
                  </div>
                ) : null}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Part Name</label>
                <input
                  style={styles.input}
                  value={createForm.partName}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, partName: e.target.value }))}
                  placeholder="Example: Front brake pads"
                />
              </div>

              <div style={isCompactLayout ? styles.formStack : styles.twoColumnForm}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Part Number</label>
                  <input
                    style={styles.input}
                    value={createForm.partNumber}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, partNumber: e.target.value }))}
                    placeholder="Optional part number"
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Quantity</label>
                  <input
                    style={styles.input}
                    value={createForm.quantity}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, quantity: e.target.value }))}
                    placeholder="1"
                  />
                </div>
              </div>

              <div style={isCompactLayout ? styles.formStack : styles.twoColumnForm}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Urgency</label>
                  <select
                    style={styles.select}
                    value={createForm.urgency}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, urgency: e.target.value as PartsRequestUrgency }))}
                  >
                    {(["Low", "Medium", "High"] as PartsRequestUrgency[]).map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Customer Selling Price</label>
                  <input
                    style={styles.input}
                    value={createForm.customerSellingPrice}
                    onChange={(e) => setCreateForm((prev) => ({ ...prev, customerSellingPrice: e.target.value }))}
                    placeholder="Optional customer price"
                  />
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Request Notes</label>
                <textarea
                  style={styles.textarea}
                  rows={3}
                  value={createForm.notes}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="Specs, preferred brand, supplier notes, or urgency context"
                />
              </div>

              {createError ? <div style={styles.errorBox}>{createError}</div> : null}

              <div style={isCompactLayout ? styles.stickyActionBar : styles.inlineActions}>
                <button type="submit" style={styles.primaryButton}>
                  Create Parts Request
                </button>
              </div>
            </form>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }}>
          <Card
            title="Parts Requests"
            subtitle="Newest to oldest with supplier bidding visibility"
            right={<span style={styles.statusNeutral}>{visibleRequests.length} requests</span>}
          >
            <div style={styles.filterBar}>
              <input
                style={styles.input}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search request no., RO, part, plate, customer, or status"
              />
            </div>

            <div style={styles.mobileCardList}>
              {visibleRequests.length === 0 ? (
                <div style={styles.emptyState}>No parts requests yet.</div>
              ) : (
                visibleRequests.map((row) => {
                  const selected = row.id === selectedRequest?.id;
                  const chosenBid = row.bids.find((bid) => bid.id === row.selectedBidId) ?? null;
                  return (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => setSelectedRequestId(row.id)}
                      style={{
                        ...styles.mobileDataCard,
                        ...(selected ? styles.mobileDataCardSelected : {}),
                        textAlign: "left",
                        width: "100%",
                      }}
                    >
                      <div style={styles.mobileDataCardHeader}>
                        <strong>{row.requestNumber}</strong>
                        <span style={getPartsRequestStatusStyle(row.status)}>{row.status}</span>
                      </div>
                      <div style={styles.mobileDataSecondary}>{row.partName}</div>
                      <div style={styles.mobileMetaRow}>
                        <span>RO</span>
                        <strong>{row.roNumber || "Unlinked"}</strong>
                      </div>
                      <div style={styles.mobileMetaRow}>
                        <span>Vehicle</span>
                        <strong>{row.plateNumber || row.vehicleLabel || "-"}</strong>
                      </div>
                      <div style={styles.mobileMetaRow}>
                        <span>Bids</span>
                        <strong>{row.bids.length}</strong>
                      </div>
                      <div style={styles.mobileMetaRow}>
                        <span>Selected Supplier</span>
                        <strong>{chosenBid?.supplierName || "Not selected"}</strong>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title={selectedRequest ? `Request Details — ${selectedRequest.requestNumber}` : "Request Details"}
            subtitle="Internal supplier cost stays in this module; customer selling price can be tracked separately"
          >
            {!selectedRequest ? (
              <div style={styles.emptyState}>Select a parts request to manage bidding and status.</div>
            ) : (
              <div style={styles.formStack}>
                <div style={styles.detailBanner}>
                  <div style={styles.detailGrid}>
                    <div>
                      <strong>Part</strong>
                      <div>{selectedRequest.partName}</div>
                    </div>
                    <div>
                      <strong>RO</strong>
                      <div>{selectedRequest.roNumber}</div>
                    </div>
                    <div>
                      <strong>Vehicle</strong>
                      <div>{selectedRequest.plateNumber || selectedRequest.vehicleLabel || "-"}</div>
                    </div>
                    <div>
                      <strong>Requested By</strong>
                      <div>{selectedRequest.requestedBy}</div>
                    </div>
                  </div>
                  <div style={styles.concernBanner}>
                    <strong>Request Notes:</strong> {selectedRequest.notes || "No notes entered."}
                  </div>
                </div>

                <div style={styles.grid}>
                  <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }}>
                    <div style={styles.sectionCard}>
                      <div style={styles.sectionTitle}>Request Status</div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Current Status</label>
                        <select
                          style={styles.select}
                          value={selectedRequest.status}
                          onChange={(e) => setRequestStatus(selectedRequest, e.target.value as PartsRequestStatus)}
                        >
                          {(
                            [
                              "Draft",
                              "Requested",
                              "Sent to Suppliers",
                              "Waiting for Bids",
                              "Supplier Selected",
                              "Ordered",
                              "Shipped",
                              "Parts Arrived",
                              "Closed",
                              "Cancelled",
                            ] as PartsRequestStatus[]
                          ).map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div style={styles.mobileMetaRow}>
                        <span>Customer Selling Price</span>
                        <strong>{formatCurrency(customerPrice)}</strong>
                      </div>
                      <div style={styles.mobileMetaRow}>
                        <span>Selected Internal Cost</span>
                        <strong>{selectedBid ? formatCurrency(internalCost) : "-"}</strong>
                      </div>
                      <div style={styles.mobileMetaRow}>
                        <span>Estimated Margin</span>
                        <strong>{selectedBid ? formatCurrency(estimatedMargin) : "-"}</strong>
                      </div>
                      <div style={isCompactLayout ? styles.stickyActionBar : styles.inlineActions}>
                        <button type="button" style={styles.secondaryButton} onClick={() => setRequestStatus(selectedRequest, "Sent to Suppliers")}>
                          Send to Suppliers
                        </button>
                        <button
                          type="button"
                          style={{ ...styles.secondaryButton, ...(selectedRequest.selectedBidId ? {} : styles.buttonDisabled) }}
                          disabled={!selectedRequest.selectedBidId}
                          onClick={() => setRequestStatus(selectedRequest, "Ordered")}
                        >
                          Mark Ordered
                        </button>
                        <button type="button" style={styles.primaryButton} onClick={() => setRequestStatus(selectedRequest, "Parts Arrived")}>
                          Mark Parts Arrived
                        </button>
                        <button type="button" style={styles.secondaryButton} onClick={() => setRequestStatus(selectedRequest, "Closed")}>
                          Close Request
                        </button>
                      </div>
                    </div>
                  </div>

                  <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }}>
                    <div style={styles.sectionCard}>
                      <div style={styles.sectionTitle}>Add Supplier Bid</div>
                      <form onSubmit={addBid} style={styles.formStack}>
                        <div style={isCompactLayout ? styles.formStack : styles.twoColumnForm}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Supplier</label>
                            <input
                              style={styles.input}
                              value={bidForm.supplierName}
                              onChange={(e) => setBidForm((prev) => ({ ...prev, supplierName: e.target.value }))}
                              placeholder="Supplier name"
                            />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Brand</label>
                            <input
                              style={styles.input}
                              value={bidForm.brand}
                              onChange={(e) => setBidForm((prev) => ({ ...prev, brand: e.target.value }))}
                              placeholder="Brand / manufacturer"
                            />
                          </div>
                        </div>

                        <div style={isCompactLayout ? styles.formStack : styles.threeColumnForm}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Quantity</label>
                            <input
                              style={styles.input}
                              value={bidForm.quantity}
                              onChange={(e) => setBidForm((prev) => ({ ...prev, quantity: e.target.value }))}
                            />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Unit Cost</label>
                            <input
                              style={styles.input}
                              value={bidForm.unitCost}
                              onChange={(e) => setBidForm((prev) => ({ ...prev, unitCost: e.target.value }))}
                              placeholder="Internal supplier cost"
                            />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Condition</label>
                            <select
                              style={styles.select}
                              value={bidForm.condition}
                              onChange={(e) => setBidForm((prev) => ({ ...prev, condition: e.target.value as SupplierBidCondition }))}
                            >
                              {(["Brand New", "OEM", "Replacement", "Surplus"] as SupplierBidCondition[]).map((item) => (
                                <option key={item} value={item}>
                                  {item}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div style={isCompactLayout ? styles.formStack : styles.twoColumnForm}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Delivery Time</label>
                            <input
                              style={styles.input}
                              value={bidForm.deliveryTime}
                              onChange={(e) => setBidForm((prev) => ({ ...prev, deliveryTime: e.target.value }))}
                              placeholder="Example: Same day / 2 days"
                            />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Warranty Note</label>
                            <input
                              style={styles.input}
                              value={bidForm.warrantyNote}
                              onChange={(e) => setBidForm((prev) => ({ ...prev, warrantyNote: e.target.value }))}
                              placeholder="Warranty details"
                            />
                          </div>
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Bid Notes</label>
                          <textarea
                            style={styles.textarea}
                            rows={3}
                            value={bidForm.notes}
                            onChange={(e) => setBidForm((prev) => ({ ...prev, notes: e.target.value }))}
                            placeholder="Notes on quality, stock, lead time, or special terms"
                          />
                        </div>

                        {bidError ? <div style={styles.errorBox}>{bidError}</div> : null}

                        <div style={isCompactLayout ? styles.stickyActionBar : styles.inlineActions}>
                          <button type="submit" style={styles.primaryButton}>
                            Add Supplier Bid
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>

                <div style={styles.sectionCard}>
                  <div style={styles.sectionTitle}>Supplier Bids</div>
                  <div style={styles.mobileCardList}>
                    {selectedRequest.bids.length === 0 ? (
                      <div style={styles.emptyState}>No supplier bids yet.</div>
                    ) : (
                      selectedRequest.bids
                        .slice()
                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                        .map((bid) => {
                          const chosen = bid.id === selectedRequest.selectedBidId;
                          return (
                            <div key={bid.id} style={{ ...styles.mobileDataCard, ...(chosen ? styles.mobileDataCardSelected : {}) }}>
                              <div style={styles.mobileDataCardHeader}>
                                <strong>{bid.supplierName}</strong>
                                {chosen ? <span style={styles.statusOk}>Selected</span> : <span style={styles.statusNeutral}>Bid</span>}
                              </div>
                              <div style={styles.mobileDataSecondary}>
                                {bid.brand || "No brand"} • {bid.condition}
                              </div>
                              <div style={styles.mobileMetaRow}>
                                <span>Quantity</span>
                                <strong>{bid.quantity}</strong>
                              </div>
                              <div style={styles.mobileMetaRow}>
                                <span>Unit Cost</span>
                                <strong>{formatCurrency(parseMoneyInput(bid.unitCost))}</strong>
                              </div>
                              <div style={styles.mobileMetaRow}>
                                <span>Total Cost</span>
                                <strong>{formatCurrency(parseMoneyInput(bid.totalCost))}</strong>
                              </div>
                              <div style={styles.mobileMetaRow}>
                                <span>Delivery</span>
                                <strong>{bid.deliveryTime || "-"}</strong>
                              </div>
                              <div style={styles.mobileMetaRow}>
                                <span>Warranty</span>
                                <strong>{bid.warrantyNote || "-"}</strong>
                              </div>
                              {bid.notes ? <div style={styles.formHint}>{bid.notes}</div> : null}
                              <div style={styles.inlineActions}>
                                <button
                                  type="button"
                                  style={{ ...styles.smallButton, ...(chosen ? styles.buttonDisabled : {}) }}
                                  disabled={chosen}
                                  onClick={() => selectBid(selectedRequest, bid.id)}
                                >
                                  Select Supplier
                                </button>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}


function ModulePage({
  title,
  description,
  currentUser,
  requiredPermission,
  roleDefinitions,
}: {
  title: string;
  description: string;
  currentUser: SessionUser;
  requiredPermission: Permission;
  roleDefinitions: RoleDefinition[];
}) {
  const allowed = hasPermission(currentUser.role, roleDefinitions, requiredPermission);

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title={title}
            subtitle="Permission-aware module shell"
            right={allowed ? <span style={styles.statusOk}>Access Granted</span> : <span style={styles.statusLocked}>Access Blocked</span>}
          >
            <div style={styles.moduleText}>{description}</div>
            <div style={styles.moduleMetaRow}>
              <span>Required permission:</span>
              <strong>{requiredPermission}</strong>
            </div>
            <div style={styles.moduleMetaRow}>
              <span>Current user:</span>
              <strong>{currentUser.fullName}</strong>
            </div>
            <div style={styles.moduleMetaRow}>
              <span>Role:</span>
              <RoleBadge role={currentUser.role} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function SettingsPage({
  currentUser,
  roleDefinitions,
  onResetDefaults,
  onResetIntakes,
}: {
  currentUser: SessionUser;
  roleDefinitions: RoleDefinition[];
  onResetDefaults: () => void;
  onResetIntakes: () => void;
}) {
  const canManageRoles = hasPermission(currentUser.role, roleDefinitions, "roles.manage");

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: "span 8" }}>
          <Card title="System Settings" subtitle="Phase 8 controls">
            <div style={styles.moduleText}>
              This build persists users, login session, current page, role permissions,
              intake records, inspection records, repair orders, QC records, release records, parts requests, and daily counters in localStorage.
            </div>
            <div style={styles.inlineActions}>
              <button
                type="button"
                style={{ ...styles.primaryButton, ...(canManageRoles ? {} : styles.buttonDisabled) }}
                disabled={!canManageRoles}
                onClick={onResetDefaults}
              >
                Reset Role Permissions to Default
              </button>
              <button type="button" style={styles.secondaryButton} onClick={onResetIntakes}>
                Clear Operational Records
              </button>
            </div>
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 4" }}>
          <Card title="Current User" subtitle="Session summary">
            <div style={styles.quickAccessList}>
              <div>
                <strong>Name:</strong> {currentUser.fullName}
              </div>
              <div>
                <strong>Username:</strong> {currentUser.username}
              </div>
              <div>
                <strong>Role:</strong> <RoleBadge role={currentUser.role} />
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [roleDefinitions, setRoleDefinitions] = useState<RoleDefinition[]>(() => {
    const stored = readLocalStorage<RoleDefinition[]>(STORAGE_KEYS.rolePermissions, []);
    if (stored.length > 0) {
      return ALL_ROLES.map((role) => {
        const found = stored.find((s) => s.role === role);
        return {
          role,
          permissions:
            role === "Admin"
              ? [...ALL_PERMISSIONS]
              : ALL_PERMISSIONS.filter((p) => (found?.permissions ?? []).includes(p)),
        };
      });
    }
    return getDefaultRoleDefinitions();
  });

  const [users, setUsers] = useState<UserAccount[]>(() => {
    const stored = readLocalStorage<UserAccount[]>(STORAGE_KEYS.users, []);
    return stored.length > 0 ? stored : getDefaultUsers();
  });

  const [intakeRecords, setIntakeRecords] = useState<IntakeRecord[]>(() =>
    readLocalStorage<IntakeRecord[]>(STORAGE_KEYS.intakeRecords, [])
  );

  const [inspectionRecords, setInspectionRecords] = useState<InspectionRecord[]>(() =>
    readLocalStorage<InspectionRecord[]>(STORAGE_KEYS.inspectionRecords, []).map(migrateInspectionRecord)
  );

  const [repairOrders, setRepairOrders] = useState<RepairOrderRecord[]>(() =>
    readLocalStorage<RepairOrderRecord[]>(STORAGE_KEYS.repairOrders, []).map(migrateRepairOrderRecord)
  );

  const [qcRecords, setQcRecords] = useState<QCRecord[]>(() =>
    readLocalStorage<QCRecord[]>(STORAGE_KEYS.qcRecords, [])
  );

  const [releaseRecords, setReleaseRecords] = useState<ReleaseRecord[]>(() =>
    readLocalStorage<ReleaseRecord[]>(STORAGE_KEYS.releaseRecords, [])
  );


  const [partsRequests, setPartsRequests] = useState<PartsRequestRecord[]>(() =>
    readLocalStorage<PartsRequestRecord[]>(STORAGE_KEYS.partsRequests, []).map((row) => ({
      ...row,
      status: normalizeLegacyPartsStatus(row.status),
    }))
  );

  const [approvalRecords, setApprovalRecords] = useState<ApprovalRecord[]>(() =>
    readLocalStorage<ApprovalRecord[]>(STORAGE_KEYS.approvalRecords, [])
  );

  const [backjobRecords, setBackjobRecords] = useState<BackjobRecord[]>(() =>
    readLocalStorage<BackjobRecord[]>(STORAGE_KEYS.backjobRecords, [])
  );

  const [invoiceRecords, setInvoiceRecords] = useState<InvoiceRecord[]>(() =>
    readLocalStorage<InvoiceRecord[]>(STORAGE_KEYS.invoiceRecords, []).map(migrateInvoiceRecord)
  );

  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(() =>
    readLocalStorage<PaymentRecord[]>(STORAGE_KEYS.paymentRecords, []).map(migratePaymentRecord)
  );

  const [currentUser, setCurrentUser] = useState<SessionUser | null>(() =>
    readLocalStorage<SessionUser | null>(STORAGE_KEYS.session, null)
  );

  const [currentView, setCurrentView] = useState<ViewKey>(() =>
    readLocalStorage<ViewKey>(STORAGE_KEYS.currentView, "dashboard")
  );

  const [loginForm, setLoginForm] = useState<LoginForm>({
    username: "",
    password: "",
  });

  const [loginError, setLoginError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean>(() =>
    typeof window !== "undefined" ? window.innerWidth < 960 : false
  );

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.rolePermissions, roleDefinitions);
  }, [roleDefinitions]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.users, users);
  }, [users]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.intakeRecords, intakeRecords);
  }, [intakeRecords]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.inspectionRecords, inspectionRecords);
  }, [inspectionRecords]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.repairOrders, repairOrders);
  }, [repairOrders]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.qcRecords, qcRecords);
  }, [qcRecords]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.releaseRecords, releaseRecords);
  }, [releaseRecords]);


  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.partsRequests, partsRequests);
  }, [partsRequests]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.approvalRecords, approvalRecords);
  }, [approvalRecords]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.backjobRecords, backjobRecords);
  }, [backjobRecords]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.invoiceRecords, invoiceRecords);
  }, [invoiceRecords]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.paymentRecords, paymentRecords);
  }, [paymentRecords]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.session, currentUser);
  }, [currentUser]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.currentView, currentView);
  }, [currentView]);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth < 960;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(false);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    if (!currentUser) return;
    const found = users.find((u) => u.id === currentUser.id);
    if (!found || !found.active) {
      setCurrentUser(null);
      setCurrentView("dashboard");
      return;
    }

    if (found.role !== currentUser.role || found.fullName !== currentUser.fullName) {
      setCurrentUser({
        id: found.id,
        username: found.username,
        fullName: found.fullName,
        role: found.role,
        active: found.active,
        createdAt: found.createdAt,
      });
    }
  }, [users, currentUser]);

  useEffect(() => {
    if (!currentUser) return;
    if (!canAccessView(currentUser.role, roleDefinitions, currentView)) {
      setCurrentView(getDefaultViewForRole(currentUser.role, roleDefinitions));
    }
  }, [currentUser, currentView, roleDefinitions]);

  const allowedNav = useMemo(() => {
    if (!currentUser) return [];
    return getAllowedNav(currentUser.role, roleDefinitions);
  }, [currentUser, roleDefinitions]);

  const currentNavItem = useMemo(() => {
    return NAV_ITEMS.find((item) => item.key === currentView) ?? NAV_ITEMS[0];
  }, [currentView]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const username = loginForm.username.trim().toLowerCase();
    const password = loginForm.password;

    if (!username || !password) {
      setLoginError("Please enter username and password.");
      return;
    }

    const found = users.find(
      (user) => user.active && user.username.toLowerCase() === username && user.password === password
    );

    if (!found) {
      setLoginError("Invalid username or password.");
      return;
    }

    setCurrentUser({
      id: found.id,
      username: found.username,
      fullName: found.fullName,
      role: found.role,
      active: found.active,
      createdAt: found.createdAt,
    });
    setCurrentView(getDefaultViewForRole(found.role, roleDefinitions));
    setLoginForm({ username: "", password: "" });
    setLoginError("");
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView("dashboard");
    setSidebarOpen(false);
    setLoginError("");
  };

  const handleNavigate = (view: ViewKey) => {
    if (!currentUser) return;
    if (!canAccessView(currentUser.role, roleDefinitions, view)) return;
    setCurrentView(view);
    if (isMobile) setSidebarOpen(false);
  };

  const resetRolePermissionsToDefault = () => {
    if (!currentUser) return;
    if (!hasPermission(currentUser.role, roleDefinitions, "roles.manage")) return;
    setRoleDefinitions(getDefaultRoleDefinitions());
  };

  const resetIntakeRecords = () => {
    setIntakeRecords([]);
    setInspectionRecords([]);
    setRepairOrders([]);
    setQcRecords([]);
    setReleaseRecords([]);
    setPartsRequests([]);
    setApprovalRecords([]);
    setBackjobRecords([]);
    setInvoiceRecords([]);
    setPaymentRecords([]);
    localStorage.removeItem(STORAGE_KEYS.intakeRecords);
    localStorage.removeItem(STORAGE_KEYS.inspectionRecords);
    localStorage.removeItem(STORAGE_KEYS.repairOrders);
    localStorage.removeItem(STORAGE_KEYS.qcRecords);
    localStorage.removeItem(STORAGE_KEYS.releaseRecords);
    localStorage.removeItem(STORAGE_KEYS.partsRequests);
    localStorage.removeItem(STORAGE_KEYS.approvalRecords);
    localStorage.removeItem(STORAGE_KEYS.backjobRecords);
    localStorage.removeItem(STORAGE_KEYS.invoiceRecords);
    localStorage.removeItem(STORAGE_KEYS.paymentRecords);
    localStorage.removeItem(STORAGE_KEYS.counters);
  };

  const renderCurrentPage = () => {
    if (!currentUser) return null;

    if (!canAccessView(currentUser.role, roleDefinitions, currentView)) {
      return (
        <ModulePage
          title="Access Restricted"
          description="You do not have permission to open this page."
          currentUser={currentUser}
          requiredPermission="dashboard.view"
          roleDefinitions={roleDefinitions}
        />
      );
    }

    switch (currentView) {
      case "dashboard":
        return (
          <DashboardPage
            currentUser={currentUser}
            users={users}
            roleDefinitions={roleDefinitions}
            allowedNav={allowedNav}
            intakeRecords={intakeRecords}
            repairOrders={repairOrders}
            qcRecords={qcRecords}
            releaseRecords={releaseRecords}
            approvalRecords={approvalRecords}
            backjobRecords={backjobRecords}
            invoiceRecords={invoiceRecords}
            paymentRecords={paymentRecords}
            isCompactLayout={isMobile}
          />
        );
      case "intake":
        return (
          <IntakePage
            currentUser={currentUser}
            intakeRecords={intakeRecords}
            setIntakeRecords={setIntakeRecords}
            isCompactLayout={isMobile}
          />
        );
      case "users":
        return (
          <UsersPage
            currentUser={currentUser}
            users={users}
            setUsers={setUsers}
            roleDefinitions={roleDefinitions}
            isCompactLayout={isMobile}
          />
        );
      case "roles":
        return (
          <RolesPage
            currentUser={currentUser}
            roleDefinitions={roleDefinitions}
            setRoleDefinitions={setRoleDefinitions}
          />
        );
      case "settings":
        return (
          <SettingsPage
            currentUser={currentUser}
            roleDefinitions={roleDefinitions}
            onResetDefaults={resetRolePermissionsToDefault}
            onResetIntakes={resetIntakeRecords}
          />
        );
      case "inspection":
        return (
          <InspectionPage
            currentUser={currentUser}
            intakeRecords={intakeRecords}
            inspectionRecords={inspectionRecords}
            setInspectionRecords={setInspectionRecords}
            setIntakeRecords={setIntakeRecords}
            isCompactLayout={isMobile}
          />
        );
      case "repairOrders":
        return (
          <RepairOrdersPage
            currentUser={currentUser}
            users={users}
            intakeRecords={intakeRecords}
            inspectionRecords={inspectionRecords}
            repairOrders={repairOrders}
            setRepairOrders={setRepairOrders}
            setIntakeRecords={setIntakeRecords}
            approvalRecords={approvalRecords}
            setApprovalRecords={setApprovalRecords}
            backjobRecords={backjobRecords}
            setBackjobRecords={setBackjobRecords}
            isCompactLayout={isMobile}
          />
        );
      case "shopFloor":
        return (
          <ShopFloorPage
            currentUser={currentUser}
            users={users}
            repairOrders={repairOrders}
            setRepairOrders={setRepairOrders}
            isCompactLayout={isMobile}
          />
        );
      case "qualityControl":
        return (
          <QualityControlPage
            currentUser={currentUser}
            repairOrders={repairOrders}
            setRepairOrders={setRepairOrders}
            qcRecords={qcRecords}
            setQcRecords={setQcRecords}
            isCompactLayout={isMobile}
          />
        );
      case "release":
        return (
          <ReleasePage
            currentUser={currentUser}
            repairOrders={repairOrders}
            setRepairOrders={setRepairOrders}
            qcRecords={qcRecords}
            releaseRecords={releaseRecords}
            setReleaseRecords={setReleaseRecords}
            invoiceRecords={invoiceRecords}
            setInvoiceRecords={setInvoiceRecords}
            paymentRecords={paymentRecords}
            setPaymentRecords={setPaymentRecords}
            isCompactLayout={isMobile}
          />
        );
      case "parts":
        return (
          <PartsPage
            currentUser={currentUser}
            repairOrders={repairOrders}
            setRepairOrders={setRepairOrders}
            partsRequests={partsRequests}
            setPartsRequests={setPartsRequests}
            isCompactLayout={isMobile}
          />
        );
      default:
        return (
          <DashboardPage
            currentUser={currentUser}
            users={users}
            roleDefinitions={roleDefinitions}
            allowedNav={allowedNav}
            intakeRecords={intakeRecords}
            repairOrders={repairOrders}
            qcRecords={qcRecords}
            releaseRecords={releaseRecords}
            approvalRecords={approvalRecords}
            backjobRecords={backjobRecords}
            invoiceRecords={invoiceRecords}
            paymentRecords={paymentRecords}
            isCompactLayout={isMobile}
          />
        );
    }
  };

  if (!currentUser) {
    return (
      <>
        <style>{globalCss}</style>
        <LoginScreen form={loginForm} setForm={setLoginForm} error={loginError} onSubmit={handleLogin} />
      </>
    );
  }

  return (
    <>
      <style>{globalCss}</style>
      <div style={styles.appShell}>
        {isMobile && sidebarOpen ? <div style={styles.overlay} onClick={() => setSidebarOpen(false)} /> : null}

        <aside
          style={{
            ...styles.sidebar,
            ...(isMobile
              ? sidebarOpen
                ? styles.sidebarMobileOpen
                : styles.sidebarMobileClosed
              : styles.sidebarDesktop),
          }}
        >
          <div style={styles.sidebarHeader}>
            <div style={styles.sidebarLogo}>DVI</div>
            <div>
              <div style={styles.sidebarTitle}>Workshop App</div>
              <div style={styles.sidebarSubtitle}>{BUILD_VERSION}</div>
            </div>
          </div>

          <div style={styles.userPanel}>
            <div style={styles.avatar}>
              {currentUser.fullName
                .split(" ")
                .map((part) => part[0] ?? "")
                .slice(0, 2)
                .join("")
                .toUpperCase()}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={styles.userPanelName}>{currentUser.fullName}</div>
              <div style={styles.userPanelRole}>{currentUser.role}</div>
            </div>
          </div>

          <nav style={styles.navList}>
            {allowedNav.map((item) => {
              const active = item.key === currentView;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => handleNavigate(item.key)}
                  style={{ ...styles.navButton, ...(active ? styles.navButtonActive : {}) }}
                >
                  <span style={styles.navIcon}>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div style={styles.sidebarFooter}>
            <button type="button" onClick={handleLogout} style={styles.logoutButton}>
              Sign Out
            </button>
          </div>
        </aside>

        <div style={{ ...styles.mainArea, marginLeft: isMobile ? 0 : 280 }}>
          <header style={styles.topBar}>
            <div style={styles.topBarLeft}>
              {isMobile ? (
                <button type="button" onClick={() => setSidebarOpen((prev) => !prev)} style={styles.menuButton}>
                  ☰
                </button>
              ) : null}
              <div>
                <div style={styles.pageTitle}>{currentNavItem.label}</div>
                <div style={styles.pageSubtitle}>{BUILD_VERSION}</div>
              </div>
            </div>

            <div style={styles.topBarRight}>
              <RoleBadge role={currentUser.role} />
              <div style={styles.topBarName}>{currentUser.fullName}</div>
            </div>
          </header>

          <main style={styles.mainContent}>{renderCurrentPage()}</main>
        </div>
      </div>
    </>
  );
}

const globalCss = `
  * { box-sizing: border-box; }
  html, body, #root {
    margin: 0;
    padding: 0;
    min-height: 100%;
    font-family: Inter, Arial, Helvetica, sans-serif;
    background: #f8fafc;
    color: #111827;
  }
  button, input, select, textarea {
    font: inherit;
  }
  table {
    border-collapse: collapse;
    width: 100%;
  }
  textarea {
    resize: vertical;
  }
  @media (max-width: 1200px) {
    .dvi-grid-responsive {
      grid-template-columns: 1fr;
    }
  }
`;

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
    padding: 14,
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
    fontSize: 18,
    fontWeight: 800,
    color: "#111827",
  },

  cardSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: "#64748b",
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
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 2px 12px rgba(15, 23, 42, 0.05)",
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
    border: "1px solid #e5e7eb",
    borderRadius: 14,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "#f8fafc",
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
    gap: 10,
    border: "1px solid #e5e7eb",
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
  },

  table: {
    minWidth: 900,
    width: "100%",
  },

  th: {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: "1px solid #e5e7eb",
    background: "#f8fafc",
    color: "#475569",
    fontSize: 13,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  td: {
    padding: "12px 10px",
    borderBottom: "1px solid #e5e7eb",
    color: "#111827",
    fontSize: 14,
    verticalAlign: "top",
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
    maxWidth: 500,
    background: "rgba(255,255,255,0.96)",
    borderRadius: 24,
    padding: 24,
    border: "1px solid rgba(255,255,255,0.6)",
    boxShadow: "0 20px 60px rgba(2, 8, 23, 0.25)",
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
    border: "1px solid rgba(37, 99, 235, 0.22)",
    borderRadius: 12,
    padding: "12px 14px",
    background: "#ffffff",
    outline: "none",
    color: "#0f172a",
  },

  select: {
    width: "100%",
    border: "1px solid rgba(37, 99, 235, 0.22)",
    borderRadius: 12,
    padding: "12px 14px",
    background: "#ffffff",
    outline: "none",
    color: "#0f172a",
  },

  textarea: {
    width: "100%",
    minHeight: 92,
    border: "1px solid rgba(37, 99, 235, 0.22)",
    borderRadius: 12,
    padding: "12px 14px",
    background: "#ffffff",
    outline: "none",
    color: "#0f172a",
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
    background: "#2563eb",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },

  secondaryButton: {
    border: "1px solid rgba(29,78,216,0.25)",
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

  smallButtonSuccess: {
    border: "none",
    borderRadius: 10,
    padding: "8px 10px",
    background: "#059669",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
    fontSize: 12,
  },

  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },

  inlineActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  inlineActionsColumn: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  demoBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTop: "1px solid #e5e7eb",
  },

  demoTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "#111827",
    marginBottom: 10,
  },

  demoGrid: {
    display: "grid",
    gap: 6,
    fontSize: 14,
    color: "#475569",
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
  },

  queueStack: {
    display: "grid",
    gap: 10,
    maxHeight: 720,
    overflowY: "auto",
    paddingRight: 4,
  },

  queueCard: {
    border: "1px solid #dbe3ee",
    borderRadius: 14,
    padding: 12,
    background: "#f8fafc",
    textAlign: "left",
    cursor: "pointer",
  },

  queueCardActive: {
    borderColor: "#2563eb",
    background: "#eff6ff",
    boxShadow: "0 0 0 1px #2563eb inset",
  },

  queueCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 8,
  },

  queueLine: {
    fontSize: 14,
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: 4,
  },

  queueLineMuted: {
    fontSize: 13,
    color: "#64748b",
    marginBottom: 4,
  },

  summaryPanel: {
    border: "1px solid #dbe3ee",
    borderRadius: 16,
    padding: 14,
    background: "#f8fafc",
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 10,
    fontSize: 14,
    color: "#334155",
  },

  concernBanner: {
    marginTop: 12,
    padding: "10px 12px",
    borderRadius: 12,
    background: "#e0f2fe",
    color: "#0c4a6e",
    fontSize: 14,
    lineHeight: 1.6,
  },

  toggleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
  },

  checkboxTile: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    border: "1px solid #dbe3ee",
    borderRadius: 14,
    padding: 12,
    background: "#f8fafc",
    color: "#334155",
    fontSize: 14,
    fontWeight: 600,
  },

  sectionCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    background: "#fff",
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 12,
  },

  textareaLarge: {
    width: "100%",
    minHeight: 120,
    border: "1px solid #cbd5e1",
    borderRadius: 12,
    padding: "12px 14px",
    background: "#fff",
    outline: "none",
    color: "#111827",
  },

  updateNoteBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 16,
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
  },

  updateNoteTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "#1d4ed8",
    marginBottom: 6,
  },

  updateNoteText: {
    fontSize: 13,
    color: "#334155",
    lineHeight: 1.6,
  },
  statusNeutral: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    background: "#e0f2fe",
    color: "#075985",
    fontSize: 12,
    fontWeight: 800,
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
  },

  statNote: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 8,
  },

  registrySummary: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  formHint: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 1.5,
  },

  checkboxList: {
    display: "grid",
    gap: 8,
    maxHeight: 220,
    overflowY: "auto",
    paddingRight: 4,
  },

  sectionCardMuted: {
    border: "1px solid #dbe3ee",
    borderRadius: 14,
    padding: 12,
    background: "#f8fafc",
  },

  mobileDataCardButton: {
    width: "100%",
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    background: "#fff",
    textAlign: "left",
    cursor: "pointer",
  },

  mobileDataCardButtonActive: {
    borderColor: "#2563eb",
    boxShadow: "0 0 0 1px #2563eb inset",
    background: "#eff6ff",
  },

  detailPanel: {
    marginTop: 16,
    display: "grid",
    gap: 14,
    borderTop: "1px solid #e5e7eb",
    paddingTop: 16,
  },

  tablePrimary: {
    fontWeight: 700,
    color: "#111827",
  },

  tableSecondary: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },

  concernCell: {
    minWidth: 180,
    whiteSpace: "normal",
    lineHeight: 1.5,
    color: "#334155",
  },


  shopFloorQuickFilters: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },

  twoColumnForm: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: 12,
  },

  threeColumnForm: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },

  filterBar: {
    marginBottom: 14,
  },

  mobileCard: {
    border: "1px solid #e5e7eb",
    borderRadius: 16,
    padding: 14,
    background: "#fff",
  },

  mobileCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
    flexWrap: "wrap",
  },

  mobileCardTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "#0f172a",
  },

  mobileCardSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 2,
  },

  mobileCardMeta: {
    fontSize: 13,
    color: "#334155",
    marginTop: 4,
  },

  mobileCardNote: {
    marginTop: 8,
    fontSize: 13,
    lineHeight: 1.5,
    color: "#475569",
    background: "#f8fafc",
    borderRadius: 12,
    padding: 10,
  },

  mobileDataCardSelected: {
    borderColor: "#2563eb",
    boxShadow: "0 0 0 1px #2563eb inset",
    background: "#eff6ff",
  },

  summaryTile: {
    border: "1px solid #dbe3ee",
    borderRadius: 14,
    padding: 12,
    background: "#f8fafc",
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
  },

  checkboxCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    border: "1px solid #dbe3ee",
    borderRadius: 14,
    padding: 12,
    background: "#f8fafc",
    color: "#334155",
  },

  summaryBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    flexWrap: "wrap",
    borderRadius: 14,
    background: "#f8fafc",
    border: "1px solid #dbe3ee",
    padding: 12,
  },

  detailBanner: {
    border: "1px solid #dbe3ee",
    borderRadius: 16,
    padding: 14,
    background: "#f8fafc",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 10,
    fontSize: 14,
    color: "#334155",
  },

  smallButtonDanger: {
    border: "none",
    borderRadius: 10,
    padding: "9px 12px",
    background: "#dc2626",
    color: "#fff",
    fontWeight: 700,
    cursor: "pointer",
  },

  emptyState: {
    padding: "18px 14px",
    borderRadius: 14,
    background: "#f8fafc",
    border: "1px dashed #cbd5e1",
    color: "#64748b",
    textAlign: "center",
  },
};
