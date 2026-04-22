import React, { useEffect, useMemo, useState } from "react";
import RolesPage from "./modules/roles/RolesPage";
import HistoryPage from "./modules/history/HistoryPage";
import SettingsPage from "./modules/settings/SettingsPage";
import BookingsPage from "./modules/bookings/BookingsPage";
import ReleasePage from "./modules/release/ReleasePage";
import BackjobPage from "./modules/backjobs/BackjobsPage";
import PartsPage from "./modules/parts/PartsPage";
import IntakePage from "./modules/intake/IntakePage";
import QualityControlPage from "./modules/qualityControl/QualityControlPage";
import type { UserRole, Permission, ViewKey, RoleDefinition, UserAccount, SessionUser, NavItem, VehicleAccountType, IntakeStatus, IntakeRecord, ApprovalDecision, BackjobOutcome, RepairOrderSourceType, ROStatus, WorkLineStatus, WorkLinePriority, RepairOrderWorkLine, RepairOrderRecord, QCResult, QCRecord, ReleaseRecord, ApprovalWorkItem, FindingRecommendationDecision, ApprovalRecord, BackjobRecord, InvoiceStatus, PaymentStatus, PaymentMethod, InvoiceRecord, PaymentRecord, WorkLog, PartsRequestRecord } from "./modules/shared/types";
import { getTechnicianProductivity, getAdvisorSalesProduced, getRepeatCustomerFrequency, getQcPassFailSummary, getWaitingPartsAging, getBackjobRate } from "./modules/shared/helpers";


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

type CustomerLoginForm = {
  identifier: string;
  password: string;
};

type LoginAudience = "staff" | "customer" | "supplier" | "booking";

type SupplierPortalView = "openRequests" | "myBids";

type SupplierSession = {
  supplierName: string;
};

type SupplierLoginForm = {
  supplierName: string;
};

type CustomerPortalView = "dashboard" | "jobs" | "approvals" | "inspection" | "myVehicles" | "bookings";

type CustomerAccount = {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  password: string;
  linkedPlateNumbers: string[];
  linkedRoIds: string[];
  createdAt: string;
  updatedAt: string;
};

type ApprovalLinkToken = {
  id: string;
  roId: string;
  customerId: string;
  token: string;
  createdAt: string;
  expiresAt: string;
  lastUsedAt: string;
  revokedAt: string;
  channel: "SMS" | "Manual";
};

type SmsApprovalDispatchLog = {
  id: string;
  roId: string;
  roNumber: string;
  customerId: string;
  customerName: string;
  phoneNumber: string;
  tokenId: string;
  sentTo: string;
  messageType: CustomerNotificationTemplateKey;
  message: string;
  status: "Pending" | "Sent" | "Failed";
  provider: "Simulated" | "Android SMS Gateway" | "Twilio";
  providerResponse?: string;
  errorMessage?: string;
  createdAt: string;
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

type FindingStatus = "OK" | "Monitor" | "Replace";

type CategoryAdditionalFinding = {
  id: string;
  title: string;
  note: string;
  status: FindingStatus;
  photoNotes: string[];
};

type FindingCategoryKey =
  | "coolingAdditionalFindings"
  | "steeringAdditionalFindings"
  | "enginePerformanceAdditionalFindings"
  | "roadTestAdditionalFindings";


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



type PartsRequestStatus =
  | "Draft"
  | "Requested"
  | "Sent to Suppliers"
  | "Waiting for Bids"
  | "Bidding"
  | "Supplier Selected"
  | "Ordered"
  | "In Transit"
  | "Shipped"
  | "Arrived"
  | "Parts Arrived"
  | "Return Requested"
  | "Return Approved"
  | "Return Rejected"
  | "Closed"
  | "Cancelled";

type PartsRequestUrgency = "Low" | "Medium" | "High";
type SupplierBidCondition = "Brand New" | "OEM" | "Replacement" | "Surplus";
type PartsMediaOwner = "Workshop" | "Supplier" | "Return";
type PartsReturnResponseStatus = "Requested" | "Approved" | "Rejected" | "Replacement in Process" | "Refund in Process";

type PartsMediaRecord = {
  id: string;
  owner: PartsMediaOwner;
  kind: string;
  fileName: string;
  previewDataUrl: string;
  addedAt: string;
  note: string;
  uploadedBy: string;
};

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
  productPhotos: PartsMediaRecord[];
  invoiceFileName: string;
  shippingLabelFileName: string;
  trackingNumber: string;
  courierName: string;
  shippingNotes: string;
};

type PartsReturnRecord = {
  id: string;
  reason: string;
  notes: string;
  pictures: PartsMediaRecord[];
  createdAt: string;
  createdBy: string;
  responseStatus: PartsReturnResponseStatus;
  responseNotes: string;
  responsePictures: PartsMediaRecord[];
  respondedAt?: string;
  respondedBy?: string;
};


type FindingToRORecommendation = {
  id: string;
  category: string;
  title: string;
  note: string;
  status: FindingStatus;
  photoNotes: string[];
  workLineTitle: string;
  decision?: ApprovalDecision;
  decidedAt?: string;
};

type CustomerNotificationTemplateKey =
  | "approval-request"
  | "waiting-parts"
  | "ready-release"
  | "pull-out-notice"
  | "oil-reminder"
  | "follow-up";

type CustomerNotificationTemplate = {
  key: CustomerNotificationTemplateKey;
  title: string;
  subtitle: string;
  body: string;
};

type SmsProviderName = "Simulated" | "Android SMS Gateway" | "Twilio";
type SmsProviderMode = "simulated" | "android" | "twilio";

type SmsProviderConfig = {
  provider: SmsProviderName;
  mode: SmsProviderMode;
  endpointLabel: string;
  gatewayUrl: string;
  authToken: string;
  senderDeviceLabel: string;
  twilioAccountSid: string;
  twilioFromNumber: string;
  isConfigured: boolean;
};

type SmsSendPayload = {
  roId: string;
  roNumber: string;
  customerId: string;
  customerName: string;
  phoneNumber: string;
  tokenId: string;
  messageType: CustomerNotificationTemplateKey;
  messageBody: string;
};

type SmsSendResult = {
  provider: SmsProviderName;
  status: "Sent" | "Failed";
  errorMessage?: string;
  providerResponse?: string;
  detail: string;
};

type OilChangeReminderType = "Conventional" | "Fully Synthetic";

type OilChangeReminder = {
  vehicleKey: string;
  roId: string;
  roNumber: string;
  customerName: string;
  vehicleLabel: string;
  plateNumber: string;
  conductionNumber: string;
  oilType: OilChangeReminderType;
  serviceDate: string;
  serviceOdometerKm: string;
  currentOdometerKm: string;
  dueDate: string;
  dueOdometerKm: number;
  isDue: boolean;
  dueReason: string;
  sourceLineTitle: string;
  sourceLineNotes: string;
};

type ReleaseFollowUpReminder = {
  vehicleKey: string;
  roId: string;
  roNumber: string;
  releaseNumber: string;
  customerName: string;
  vehicleLabel: string;
  plateNumber: string;
  conductionNumber: string;
  releaseDate: string;
  dueDate: string;
  isDue: boolean;
  dueReason: string;
};


type BookingStatus = "New" | "Confirmed" | "Arrived" | "No Show" | "Rescheduled" | "Cancelled" | "Converted to Intake";
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
type BookingSource = "Staff" | "Customer Portal";

type BookingServiceDetail = string;

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

function getBookingServiceDetailOptions(serviceType: BookingServiceType) {
  return BOOKING_SERVICE_DETAIL_OPTIONS[serviceType] ?? ["Other / Describe in notes"];
}

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
  source: BookingSource;
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

const BUILD_VERSION = "Phase 17K.1  -  Inspection UI Cleanup + Faster Encoding";

const STORAGE_KEYS = {
  users: "dvi_phase1_users_v2",
  session: "dvi_phase1_session_v2",
  bookings: "dvi_phase17d_bookings_v1",
  intakeDraft: "dvi_phase17i_intake_draft_v1",
  inspectionDraft: "dvi_phase17i_inspection_draft_v1",
  bookingDraft: "dvi_phase17i_booking_draft_v1",
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
  workLogs: "dvi_phase16_work_logs_v1",
  customerAccounts: "dvi_phase15a_customer_accounts_v1",
  customerSession: "dvi_phase15a_customer_session_v1",
  approvalLinkTokens: "dvi_phase15b_approval_link_tokens_v1",
  smsApprovalLogs: "dvi_phase15b_sms_approval_logs_v1",
  smsProviderMode: "dvi_sms_provider_mode_v1",
  smsAndroidGatewayUrl: "dvi_sms_android_gateway_url_v1",
  smsAndroidGatewayApiKey: "dvi_sms_android_gateway_api_key_v1",
  smsAndroidSenderDeviceLabel: "dvi_sms_android_sender_label_v1",
  smsTwilioAccountSid: "dvi_sms_twilio_account_sid_v1",
  smsTwilioFromNumber: "dvi_sms_twilio_from_number_v1",
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
  "bookings.view",
  "intake.view",
  "inspection.view",
  "repairOrders.view",
  "shopFloor.view",
  "qualityControl.view",
  "release.view",
  "parts.view",
  "backjobs.view",
  "history.view",
  "users.view",
  "users.manage",
  "roles.view",
  "roles.manage",
  "settings.view",
];

const NAV_ITEMS: NavItem[] = [
  { key: "dashboard", label: "Dashboard", icon: "DB", permission: "dashboard.view" },
  { key: "bookings", label: "Bookings", icon: "BK", permission: "bookings.view" },
  { key: "intake", label: "Intake", icon: "IN", permission: "intake.view" },
  { key: "inspection", label: "Inspection", icon: "IP", permission: "inspection.view" },
  {
    key: "repairOrders",
    label: "Repair Orders",
    icon: "RO",
    permission: "repairOrders.view",
  },
  { key: "shopFloor", label: "Shop Floor", icon: "SF", permission: "shopFloor.view" },
  {
    key: "qualityControl",
    label: "Quality Control",
    icon: "QC",
    permission: "qualityControl.view",
  },
  { key: "release", label: "Release", icon: "RL", permission: "release.view" },
  { key: "parts", label: "Parts", icon: "PT", permission: "parts.view" },
  { key: "backjobs", label: "Backjobs", icon: "BJ", permission: "backjobs.view" },
  { key: "history", label: "History", icon: "HI", permission: "history.view" },
  { key: "users", label: "Users", icon: "US", permission: "users.view" },
  { key: "roles", label: "Roles & Permissions", icon: "RP", permission: "roles.view" },
  { key: "settings", label: "Settings", icon: "ST", permission: "settings.view" },
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

function createSecurePortalToken() {
  return `tok_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function getPortalTokenExpiry(hours = 72) {
  return new Date(Date.now() + hours * 60 * 60 * 1000).toISOString();
}

function getApprovalLinkExpiryMs(token: ApprovalLinkToken) {
  const expiry = new Date(token.expiresAt).getTime();
  return Number.isNaN(expiry) ? 0 : expiry;
}

function isApprovalLinkActive(token: ApprovalLinkToken) {
  return !token.revokedAt && getApprovalLinkExpiryMs(token) > Date.now();
}

function getLatestActiveApprovalLinkForRo(tokens: ApprovalLinkToken[], roId: string) {
  return tokens
    .filter((token) => token.roId === roId && isApprovalLinkActive(token))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0] ?? null;
}

function readStoredSetting(key: string) {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(key)?.trim() || "";
  } catch {
    return "";
  }
}

function getSmsProviderConfig(): SmsProviderConfig {
  if (typeof window === "undefined") {
    return {
      provider: "Simulated",
      mode: "simulated",
      endpointLabel: "Frontend simulation",
      gatewayUrl: "",
      authToken: "",
      senderDeviceLabel: "",
      twilioAccountSid: "",
      twilioFromNumber: "",
      isConfigured: false,
    };
  }

  const storedProvider = readStoredSetting(STORAGE_KEYS.smsProviderMode);
  const normalized: SmsProviderMode = storedProvider === "android" || storedProvider === "twilio" ? storedProvider : "simulated";
  const gatewayUrl = readStoredSetting(STORAGE_KEYS.smsAndroidGatewayUrl);
  const authToken = readStoredSetting(STORAGE_KEYS.smsAndroidGatewayApiKey);
  const senderDeviceLabel = readStoredSetting(STORAGE_KEYS.smsAndroidSenderDeviceLabel);
  const twilioAccountSid = readStoredSetting(STORAGE_KEYS.smsTwilioAccountSid);
  const twilioFromNumber = readStoredSetting(STORAGE_KEYS.smsTwilioFromNumber);

  if (normalized === "android") {
    return {
      provider: "Android SMS Gateway",
      mode: normalized,
      endpointLabel: gatewayUrl || "Android gateway placeholder",
      gatewayUrl,
      authToken,
      senderDeviceLabel,
      twilioAccountSid,
      twilioFromNumber,
      isConfigured: !!gatewayUrl,
    };
  }

  if (normalized === "twilio") {
    return {
      provider: "Twilio",
      mode: normalized,
      endpointLabel: twilioFromNumber || twilioAccountSid || "Twilio placeholder",
      gatewayUrl,
      authToken,
      senderDeviceLabel,
      twilioAccountSid,
      twilioFromNumber,
      isConfigured: !!twilioAccountSid && !!twilioFromNumber,
    };
  }

  return {
    provider: "Simulated",
    mode: normalized,
    endpointLabel: "No provider configured",
    gatewayUrl,
    authToken,
    senderDeviceLabel,
    twilioAccountSid,
    twilioFromNumber,
    isConfigured: false,
  };
}

function formatProviderResponse(rawResponse: string) {
  const trimmed = rawResponse.trim();
  if (!trimmed) return "";

  try {
    const parsed = JSON.parse(trimmed);
    const pretty = typeof parsed === "string" ? parsed : JSON.stringify(parsed);
    return pretty.length > 280 ? `${pretty.slice(0, 277)}...` : pretty;
  } catch {
    return trimmed.length > 280 ? `${trimmed.slice(0, 277)}...` : trimmed;
  }
}

async function sendViaAndroidSmsGateway(config: SmsProviderConfig, payload: SmsSendPayload): Promise<SmsSendResult> {
  if (!config.gatewayUrl) {
    return {
      provider: config.provider,
      status: "Failed",
      errorMessage: "Android SMS gateway URL is not configured.",
      detail: "Android SMS gateway is not configured. Saved message was not sent.",
    };
  }

  const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
  const timeoutId =
    typeof window !== "undefined"
      ? window.setTimeout(() => {
          controller?.abort();
        }, 10000)
      : undefined;

  try {
    const response = await fetch(config.gatewayUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(config.authToken ? { Authorization: `Bearer ${config.authToken}` } : {}),
        ...(config.authToken ? { "X-API-Key": config.authToken } : {}),
        ...(config.senderDeviceLabel ? { "X-Sender-Device": config.senderDeviceLabel } : {}),
      },
      body: JSON.stringify({
        app: "DVI",
        channel: "android-sms",
        customerId: payload.customerId,
        customerName: payload.customerName,
        message: payload.messageBody,
        messageType: payload.messageType,
        roId: payload.roId,
        roNumber: payload.roNumber,
        senderDeviceLabel: config.senderDeviceLabel,
        templateKey: payload.messageType,
        tokenId: payload.tokenId,
        to: payload.phoneNumber,
        timestamp: new Date().toISOString(),
      }),
      signal: controller?.signal,
    });

    const responseText = await response.text();
    const providerResponse = formatProviderResponse(responseText);
    let responseIndicatesFailure = false;
    try {
      const parsed = JSON.parse(responseText);
      if (parsed && typeof parsed === "object") {
        const responseObject = parsed as Record<string, unknown>;
        const statusValue = String(responseObject.status ?? responseObject.state ?? "").toLowerCase();
        responseIndicatesFailure =
          responseObject.success === false ||
          responseObject.ok === false ||
          statusValue === "error" ||
          statusValue === "failed";
      }
    } catch {
      responseIndicatesFailure = false;
    }

    if (!response.ok || responseIndicatesFailure) {
      return {
        provider: config.provider,
        status: "Failed",
        errorMessage: response.ok ? "Gateway response indicated a failure." : `Gateway returned HTTP ${response.status}.`,
        providerResponse: providerResponse || `HTTP ${response.status}`,
        detail: response.ok
          ? "Android SMS gateway returned a failure response."
          : `Android SMS gateway returned HTTP ${response.status}.`,
      };
    }

    return {
      provider: config.provider,
      status: "Sent",
      providerResponse: providerResponse || `HTTP ${response.status}`,
      detail: `Android SMS gateway accepted the message for ${config.senderDeviceLabel || config.endpointLabel}.`,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown gateway error.";
    return {
      provider: config.provider,
      status: "Failed",
      errorMessage: message,
      detail: "Android SMS gateway send failed.",
      providerResponse: message,
    };
  } finally {
    if (typeof window !== "undefined" && timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
    }
  }
}

async function dispatchSmsTemplateMessage(payload: SmsSendPayload): Promise<SmsSendResult> {
  const config = getSmsProviderConfig();
  const hasMessage = payload.messageBody.trim().length > 0;
  const hasPhone = sanitizePhone(payload.phoneNumber).length > 0;

  if (!hasMessage) {
    return {
      provider: config.provider,
      status: "Failed",
      errorMessage: "Message body is empty.",
      detail: "Failed: empty message body.",
    };
  }

  if (!hasPhone) {
    return {
      provider: config.provider,
      status: "Failed",
      errorMessage: "Customer phone number is missing.",
      detail: "Failed: missing customer phone number.",
    };
  }

  if (config.provider === "Simulated") {
    await new Promise((resolve) => window.setTimeout(resolve, 250));
    return {
      provider: config.provider,
      status: "Sent",
      providerResponse: "Simulated local dispatch completed.",
      detail: "Simulated SMS send completed locally.",
    };
  }

  if (config.provider === "Android SMS Gateway") {
    if (!config.isConfigured) {
      return {
        provider: config.provider,
        status: "Failed",
        errorMessage: "Android SMS gateway settings are missing.",
        providerResponse: "Android SMS gateway is not configured.",
        detail: "Android SMS gateway is not configured. Saved message was not sent.",
      };
    }

    return sendViaAndroidSmsGateway(config, payload);
  }

  if (!config.isConfigured) {
    return {
      provider: config.provider,
      status: "Failed",
      errorMessage: `${config.provider} settings are missing.`,
      providerResponse: `${config.provider} is not configured.`,
      detail: `${config.provider} is not configured. Saved message was not sent.`,
    };
  }

  return {
    provider: config.provider,
    status: "Sent",
    providerResponse: `${config.provider} placeholder queue accepted.`,
    detail: `${config.provider} ready. Message queued to ${config.endpointLabel}.`,
  };
}

function getEffectiveTokenExpiry(token: ApprovalLinkToken, ro: RepairOrderRecord | undefined): number {
  if (!ro || !["Released", "Closed"].includes(ro.status)) {
    return Infinity;
  }
  const releaseTime = new Date(ro.updatedAt).getTime();
  return Number.isNaN(releaseTime) ? Infinity : releaseTime + 30 * 24 * 60 * 60 * 1000;
}

function buildCustomerApprovalLinkUrl(token: string) {
  if (typeof window === "undefined") return `/customer-view?token=${token}`;
  return `${window.location.origin}/customer-view?token=${token}`;
}

function buildCustomerSmsLinkLabel(token: string) {
  return buildCustomerApprovalLinkUrl(token);
}

function buildCustomerPortalUrl(token: string) {
  return buildCustomerApprovalLinkUrl(token);
}

function buildCustomerBookingUrl() {
  if (typeof window === "undefined") return "?portal=booking";
  return `${window.location.origin}${window.location.pathname}?portal=booking`;
}

function addMonthsToDate(dateValue: string, months: number) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return new Date();
  date.setMonth(date.getMonth() + months);
  return date;
}

function addDaysToDate(dateValue: string, days: number) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return new Date();
  date.setDate(date.getDate() + days);
  return date;
}

function parseOdometerValue(value: string) {
  const parsed = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function getOilChangePolicy(oilType: OilChangeReminderType) {
  return oilType === "Fully Synthetic"
    ? { months: 12, kilometers: 10000 }
    : { months: 6, kilometers: 5000 };
}

function isOilChangeServiceLine(line: RepairOrderWorkLine) {
  const text = [line.title, line.customerDescription, line.category, line.notes, line.recommendationSource]
    .map((value) => String(value ?? "").toLowerCase())
    .join(" ");
  return (
    text.includes("oil change") ||
    text.includes("oil service") ||
    text.includes("engine oil") ||
    text.includes("oil and filter") ||
    text.includes("oil only")
  );
}

function inferOilChangeTypeFromText(...texts: Array<string | null | undefined>): OilChangeReminderType {
  const combined = texts.map((value) => String(value ?? "").toLowerCase()).join(" ");
  if (combined.includes("fully synthetic") || combined.includes("full synthetic") || combined.includes("synthetic")) {
    return "Fully Synthetic";
  }
  return "Conventional";
}

function buildOilChangeReminderMessage(reminder: OilChangeReminder) {
  return [
    `Hi ${reminder.customerName},`,
    "",
    `Your vehicle ${reminder.vehicleLabel} (${reminder.plateNumber || reminder.conductionNumber || "-"}) has an oil change reminder.`,
    "",
    `Last service: ${formatDateTime(reminder.serviceDate)} | Odometer: ${reminder.serviceOdometerKm || "-"}`,
    `Current odometer: ${reminder.currentOdometerKm || "-"}`,
    `Reminder rule: ${reminder.oilType === "Fully Synthetic" ? "12 months or 10,000 km" : "6 months or 5,000 km"}`,
    `Due status: ${reminder.dueReason}`,
    "",
    `Book your next visit here: ${buildCustomerBookingUrl()}`,
    "DVI Workshop | Please contact your service advisor for assistance.",
  ].join("\n");
}

function buildReleaseFollowUpMessage(reminder: ReleaseFollowUpReminder) {
  return [
    `Hi ${reminder.customerName},`,
    "",
    `We hope your vehicle ${reminder.vehicleLabel} (${reminder.plateNumber || reminder.conductionNumber || "-"}) is doing well after your recent release.`,
    "",
    `This is a follow-up for RO ${reminder.roNumber}${reminder.releaseNumber ? ` / Release ${reminder.releaseNumber}` : ""}.`,
    `Released on: ${formatDateTime(reminder.releaseDate)}`,
    "",
    "How has your experience been since the service? Please let us know if everything is working as expected or if there is anything we can help with.",
    "",
    "DVI Workshop | Please contact your service advisor if you need assistance.",
  ].join("\n");
}

function todayStamp(date = new Date()) {
  const yyyy = date.getFullYear().toString();
  const mm = `${date.getMonth() + 1}`.padStart(2, "0");
  const dd = `${date.getDate()}`.padStart(2, "0");
  return `${yyyy}${mm}${dd}`;
}


const MOBILE_EVIDENCE_MAX_WIDTH = 1280;
const MOBILE_EVIDENCE_VIDEO_MAX_MB = 15;

function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : "");
    reader.onerror = () => reject(new Error("Unable to read file."));
    reader.readAsDataURL(file);
  });
}

function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Unable to load image."));
    img.src = source;
  });
}

async function optimizeImageForMobile(file: File) {
  const dataUrl = await fileToDataUrl(file);
  const image = await loadImage(dataUrl);
  const scale = Math.min(1, MOBILE_EVIDENCE_MAX_WIDTH / Math.max(image.width, 1));
  const width = Math.max(1, Math.round(image.width * scale));
  const height = Math.max(1, Math.round(image.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return dataUrl;
  ctx.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.78);
}
async function buildPartsMediaRecords(
  files: FileList | null,
  owner: PartsMediaOwner,
  kind: string,
  uploadedBy: string,
  note = ""
) {
  if (!files || files.length === 0) return [] as PartsMediaRecord[];
  const items: PartsMediaRecord[] = [];
  for (const file of Array.from(files)) {
    const previewDataUrl = await optimizeImageForMobile(file);
    items.push({
      id: uid("pmedia"),
      owner,
      kind,
      fileName: file.name,
      previewDataUrl,
      addedAt: new Date().toISOString(),
      note,
      uploadedBy,
    });
  }
  return items;
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


type DraftSaveState = "Unsaved changes" | "Saving..." | "Saved";

type HistoryTimelineRow = {
  id: string;
  vehicleKey: string;
  plateNumber: string;
  conductionNumber: string;
  vehicleLabel: string;
  date: string;
  type: string;
  number: string;
  odometerKm: string;
  status: string;
  summary: string;
};

type VehicleHistoryGroup = {
  vehicleKey: string;
  plateNumber: string;
  conductionNumber: string;
  vehicleLabel: string;
  latestOdometerKm: string;
  lastVisitAt: string;
  totalVisits: number;
  activeJobCount: number;
  rows: HistoryTimelineRow[];
};

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

function buildVehicleHistoryGroups({
  intakeRecords,
  inspectionRecords,
  repairOrders,
  qcRecords,
  releaseRecords,
  approvalRecords,
  backjobRecords,
  invoiceRecords,
  paymentRecords,
}: {
  intakeRecords: IntakeRecord[];
  inspectionRecords: InspectionRecord[];
  repairOrders: RepairOrderRecord[];
  qcRecords: QCRecord[];
  releaseRecords: ReleaseRecord[];
  approvalRecords: ApprovalRecord[];
  backjobRecords: BackjobRecord[];
  invoiceRecords: InvoiceRecord[];
  paymentRecords: PaymentRecord[];
}) {
  const groups = new Map<string, VehicleHistoryGroup>();

  const ensureGroup = (input: {
    plateNumber?: string;
    conductionNumber?: string;
    vehicleLabel?: string;
  }) => {
    const vehicleKey = normalizeVehicleKey(input.plateNumber ?? "", input.conductionNumber ?? "");
    if (!vehicleKey) return null;
    const existing = groups.get(vehicleKey);
    if (existing) {
      if (!existing.plateNumber && input.plateNumber) existing.plateNumber = input.plateNumber;
      if (!existing.conductionNumber && input.conductionNumber) existing.conductionNumber = input.conductionNumber;
      if ((!existing.vehicleLabel || existing.vehicleLabel === "Unknown Vehicle") && input.vehicleLabel) {
        existing.vehicleLabel = input.vehicleLabel;
      }
      return existing;
    }
    const created: VehicleHistoryGroup = {
      vehicleKey,
      plateNumber: input.plateNumber ?? "",
      conductionNumber: input.conductionNumber ?? "",
      vehicleLabel: input.vehicleLabel ?? "Unknown Vehicle",
      latestOdometerKm: "",
      lastVisitAt: "",
      totalVisits: 0,
      activeJobCount: 0,
      rows: [],
    };
    groups.set(vehicleKey, created);
    return created;
  };

  const pushRow = (group: VehicleHistoryGroup | null, row: Omit<HistoryTimelineRow, "id" | "vehicleKey" | "plateNumber" | "conductionNumber" | "vehicleLabel">) => {
    if (!group) return;
    group.rows.push({
      id: `${row.type}-${row.number}-${row.date}`,
      vehicleKey: group.vehicleKey,
      plateNumber: group.plateNumber,
      conductionNumber: group.conductionNumber,
      vehicleLabel: group.vehicleLabel,
      ...row,
    });
    group.totalVisits = group.rows.length;
    if (!group.lastVisitAt || row.date > group.lastVisitAt) group.lastVisitAt = row.date;
    if (row.odometerKm && (!group.latestOdometerKm || row.date >= group.lastVisitAt)) {
      group.latestOdometerKm = row.odometerKm;
    }
  };

  intakeRecords.forEach((row) => {
    const group = ensureGroup({
      plateNumber: row.plateNumber,
      conductionNumber: row.conductionNumber,
      vehicleLabel: [row.make, row.model, row.year].filter(Boolean).join(" ") || "Intake Vehicle",
    });
    pushRow(group, {
      date: row.updatedAt || row.createdAt,
      type: "Intake",
      number: row.intakeNumber,
      odometerKm: row.odometerKm,
      status: row.status,
      summary: row.concern || row.notes || getVehicleAccountLabel({ companyName: row.companyName, customerName: row.customerName }),
    });
  });

  inspectionRecords.forEach((row) => {
    const group = ensureGroup({
      plateNumber: row.plateNumber,
      conductionNumber: row.conductionNumber,
      vehicleLabel: [row.make, row.model, row.year].filter(Boolean).join(" ") || "Inspection Vehicle",
    });
    pushRow(group, {
      date: row.updatedAt || row.createdAt,
      type: "Inspection",
      number: row.inspectionNumber,
      odometerKm: row.odometerKm,
      status: row.status,
      summary: row.concern || row.inspectionNotes || row.recommendedWork || "Inspection record",
    });
  });

  repairOrders.forEach((row) => {
    const group = ensureGroup({
      plateNumber: row.plateNumber,
      conductionNumber: row.conductionNumber,
      vehicleLabel: [row.make, row.model, row.year].filter(Boolean).join(" ") || "RO Vehicle",
    });
    if (group && !["Released", "Closed"].includes(row.status)) group.activeJobCount += 1;
    pushRow(group, {
      date: row.updatedAt || row.createdAt,
      type: "Repair Order",
      number: row.roNumber,
      odometerKm: row.odometerKm,
      status: row.status,
      summary: row.customerConcern || row.accountLabel || "Repair order",
    });
  });

  qcRecords.forEach((row) => {
    const ro = repairOrders.find((item) => item.id === row.roId);
    const group = ensureGroup({
      plateNumber: ro?.plateNumber ?? "",
      conductionNumber: ro?.conductionNumber ?? "",
      vehicleLabel: [ro?.make, ro?.model, ro?.year].filter(Boolean).join(" ") || "QC Vehicle",
    });
    pushRow(group, {
      date: row.createdAt,
      type: "QC",
      number: row.qcNumber,
      odometerKm: ro?.odometerKm ?? "",
      status: row.result,
      summary: row.notes || row.roNumber,
    });
  });

  releaseRecords.forEach((row) => {
    const ro = repairOrders.find((item) => item.id === row.roId);
    const group = ensureGroup({
      plateNumber: ro?.plateNumber ?? "",
      conductionNumber: ro?.conductionNumber ?? "",
      vehicleLabel: [ro?.make, ro?.model, ro?.year].filter(Boolean).join(" ") || "Release Vehicle",
    });
    pushRow(group, {
      date: row.createdAt,
      type: "Release",
      number: row.releaseNumber,
      odometerKm: ro?.odometerKm ?? "",
      status: row.paymentSettled ? "Paid" : "Pending Payment",
      summary: row.releaseSummary || row.roNumber,
    });
  });

  approvalRecords.forEach((row) => {
    const ro = repairOrders.find((item) => item.id === row.roId);
    const group = ensureGroup({
      plateNumber: ro?.plateNumber ?? "",
      conductionNumber: ro?.conductionNumber ?? "",
      vehicleLabel: [ro?.make, ro?.model, ro?.year].filter(Boolean).join(" ") || "Approval Vehicle",
    });
    pushRow(group, {
      date: row.createdAt,
      type: "Approval",
      number: row.approvalNumber,
      odometerKm: ro?.odometerKm ?? "",
      status: row.items.some((item) => item.decision === "Approved") ? "Approved Items" : "Review",
      summary: row.summary || row.communicationHook || row.roNumber,
    });
  });

  backjobRecords.forEach((row) => {
    const linkedRo = repairOrders.find((item) => item.id === row.linkedRoId);
    const group = ensureGroup({
      plateNumber: row.plateNumber || linkedRo?.plateNumber || "",
      conductionNumber: linkedRo?.conductionNumber ?? "",
      vehicleLabel: linkedRo ? [linkedRo.make, linkedRo.model, linkedRo.year].filter(Boolean).join(" ") : "Backjob Vehicle",
    });
    pushRow(group, {
      date: row.updatedAt || row.createdAt,
      type: "Backjob",
      number: row.backjobNumber,
      odometerKm: linkedRo?.odometerKm ?? "",
      status: row.status,
      summary: row.complaint || row.findings || row.rootCause || row.linkedRoNumber,
    });
  });

  invoiceRecords.forEach((row) => {
    const ro = repairOrders.find((item) => item.id === row.roId);
    const group = ensureGroup({
      plateNumber: ro?.plateNumber ?? "",
      conductionNumber: ro?.conductionNumber ?? "",
      vehicleLabel: [ro?.make, ro?.model, ro?.year].filter(Boolean).join(" ") || "Invoice Vehicle",
    });
    pushRow(group, {
      date: row.updatedAt || row.createdAt,
      type: "Invoice",
      number: row.invoiceNumber,
      odometerKm: ro?.odometerKm ?? "",
      status: row.paymentStatus,
      summary: formatCurrency(parseMoneyInput(row.totalAmount)),
    });
  });

  paymentRecords.forEach((row) => {
    const ro = repairOrders.find((item) => item.id === row.roId);
    const group = ensureGroup({
      plateNumber: ro?.plateNumber ?? "",
      conductionNumber: ro?.conductionNumber ?? "",
      vehicleLabel: [ro?.make, ro?.model, ro?.year].filter(Boolean).join(" ") || "Payment Vehicle",
    });
    pushRow(group, {
      date: row.createdAt,
      type: "Payment",
      number: row.paymentNumber,
      odometerKm: ro?.odometerKm ?? "",
      status: row.method,
      summary: formatCurrency(parseMoneyInput(row.amount)),
    });
  });

  return Array.from(groups.values()).map((group) => ({
    ...group,
    rows: group.rows.sort((a, b) => b.date.localeCompare(a.date)),
  })).sort((a, b) => (b.lastVisitAt || "").localeCompare(a.lastVisitAt || ""));
}


function sanitizePhone(value: string) {
  return value.replace(/\D/g, "");
}

function getDefaultCustomerPassword(phone: string) {
  const digits = sanitizePhone(phone);
  return digits.length >= 4 ? digits.slice(-4) : "1234";
}

function getCustomerIdentityKey(input: { phone?: string; email?: string; customerName?: string; companyName?: string }) {
  const phone = sanitizePhone(input.phone ?? "");
  if (phone) return `phone:${phone}`;
  const email = (input.email ?? "").trim().toLowerCase();
  if (email) return `email:${email}`;
  const fallback = (input.companyName || input.customerName || "").trim().toLowerCase();
  return fallback ? `label:${fallback}` : "";
}

function mergeUniqueStrings(values: string[]) {
  return [...new Set(values.map((value) => value.trim()).filter(Boolean))];
}

function buildCustomerAccountsFromRecords(
  existingAccounts: CustomerAccount[],
  intakeRecords: IntakeRecord[],
  repairOrders: RepairOrderRecord[]
) {
  const identityMap = new Map<string, CustomerAccount>();

  existingAccounts.forEach((account) => {
    const identityKey = getCustomerIdentityKey(account);
    if (!identityKey) return;
    identityMap.set(identityKey, {
      ...account,
      phone: sanitizePhone(account.phone),
      email: (account.email || "").trim().toLowerCase(),
      linkedPlateNumbers: mergeUniqueStrings(account.linkedPlateNumbers || []),
      linkedRoIds: mergeUniqueStrings(account.linkedRoIds || []),
    });
  });

  const upsert = (entry: {
    phone?: string;
    email?: string;
    customerName?: string;
    companyName?: string;
    plateNumber?: string;
    roId?: string;
  }) => {
    const identityKey = getCustomerIdentityKey(entry);
    if (!identityKey) return;
    const now = new Date().toISOString();
    const existing = identityMap.get(identityKey);
    const phone = sanitizePhone(entry.phone ?? existing?.phone ?? "");
    const email = (entry.email ?? existing?.email ?? "").trim().toLowerCase();
    const fullName = (entry.customerName || entry.companyName || existing?.fullName || "").trim() || "Customer";

    identityMap.set(identityKey, {
      id: existing?.id ?? uid("cust"),
      fullName,
      phone,
      email,
      password: existing?.password || getDefaultCustomerPassword(phone),
      linkedPlateNumbers: mergeUniqueStrings([...(existing?.linkedPlateNumbers ?? []), entry.plateNumber ?? ""]),
      linkedRoIds: mergeUniqueStrings([...(existing?.linkedRoIds ?? []), entry.roId ?? ""]),
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    });
  };

  intakeRecords.forEach((record) =>
    upsert({
      phone: record.phone,
      email: record.email,
      customerName: record.customerName,
      companyName: record.companyName,
      plateNumber: record.plateNumber || record.conductionNumber,
    })
  );

  repairOrders.forEach((record) =>
    upsert({
      phone: record.phone,
      email: record.email,
      customerName: record.customerName,
      companyName: record.companyName,
      plateNumber: record.plateNumber || record.conductionNumber,
      roId: record.id,
    })
  );

  return Array.from(identityMap.values()).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
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

function downloadTextFile(filename: string, content: string) {
  if (typeof document === "undefined") return;
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function printTextDocument(title: string, content: string) {
  if (typeof window === "undefined") return;
  const popup = window.open("", "_blank", "width=900,height=700");
  if (!popup) return;
  const escapedTitle = title.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const escapedBody = content.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  popup.document.write(`
    <html>
      <head>
        <title>${escapedTitle}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 24px; color: #0f172a; }
          h1 { font-size: 24px; margin-bottom: 16px; }
          pre { white-space: pre-wrap; font-family: Arial, sans-serif; line-height: 1.5; font-size: 13px; }
        </style>
      </head>
      <body>
        <h1>${escapedTitle}</h1>
        <pre>${escapedBody}</pre>
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
}

function printCustomerSummary(ro: RepairOrderRecord) {
  if (typeof window === "undefined") return;
  const popup = window.open("", "_blank", "width=860,height=700");
  if (!popup) return;

  const approvedLines = ro.workLines.filter((l) => l.approvalDecision === "Approved");
  const deferredLines = ro.workLines.filter((l) => l.approvalDecision === "Deferred");
  const declinedLines = ro.workLines.filter((l) => l.approvalDecision === "Declined");
  const approvedTotal = approvedLines.reduce((s, l) => s + parseMoneyInput(l.totalEstimate), 0);
  const deferredTotal = deferredLines.reduce((s, l) => s + parseMoneyInput(l.totalEstimate), 0);
  const declinedTotal = declinedLines.reduce((s, l) => s + parseMoneyInput(l.totalEstimate), 0);

  const esc = (v: string) => v.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  const lineRows = (lines: typeof approvedLines) =>
    lines.length === 0
      ? `<tr><td colspan="3" style="color:#64748b;padding:8px 0;">None</td></tr>`
      : lines.map((l) => `
          <tr>
            <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;">${esc(l.title || "Untitled")}</td>
            <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;color:#475569;">${esc(l.category || "-")}</td>
            <td style="padding:6px 0;border-bottom:1px solid #e2e8f0;text-align:right;">${formatCurrency(parseMoneyInput(l.totalEstimate))}</td>
          </tr>
          ${l.customerDescription ? `<tr><td colspan="3" style="padding:0 0 6px;font-size:12px;color:#64748b;border-bottom:1px solid #e2e8f0;">${esc(l.customerDescription)}</td></tr>` : ""}
        `).join("");

  const table = (title: string, color: string, lines: typeof approvedLines, total: number) => `
    <h3 style="margin:20px 0 6px;color:${color};font-size:14px;">${esc(title)}</h3>
    <table style="width:100%;border-collapse:collapse;font-size:13px;">
      <thead>
        <tr style="background:#f8fafc;">
          <th style="text-align:left;padding:6px 0;border-bottom:2px solid #e2e8f0;font-size:12px;color:#64748b;">Work Item</th>
          <th style="text-align:left;padding:6px 0;border-bottom:2px solid #e2e8f0;font-size:12px;color:#64748b;">Category</th>
          <th style="text-align:right;padding:6px 0;border-bottom:2px solid #e2e8f0;font-size:12px;color:#64748b;">Estimate</th>
        </tr>
      </thead>
      <tbody>${lineRows(lines)}</tbody>
      ${lines.length > 0 ? `<tfoot><tr><td colspan="2" style="padding:6px 0;font-weight:600;">Subtotal</td><td style="text-align:right;padding:6px 0;font-weight:600;">${formatCurrency(total)}</td></tr></tfoot>` : ""}
    </table>`;

  const html = `
    <html>
      <head>
        <title>Customer Summary  -  ${esc(ro.roNumber)}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 32px; color: #0f172a; max-width: 760px; margin: 0 auto; }
          h1 { font-size: 22px; margin: 0 0 4px; }
          h2 { font-size: 15px; font-weight: 600; margin: 20px 0 6px; border-bottom: 2px solid #0f172a; padding-bottom: 4px; }
          .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 16px; font-size: 13px; margin-bottom: 8px; }
          .meta span { color: #64748b; }
          .totals { margin-top: 20px; border-top: 2px solid #0f172a; padding-top: 12px; font-size: 14px; }
          .totals table { width: 100%; border-collapse: collapse; }
          .totals td { padding: 4px 0; }
          .totals .grand { font-size: 16px; font-weight: 700; border-top: 1px solid #e2e8f0; padding-top: 8px; margin-top: 4px; }
          .footer { margin-top: 32px; font-size: 11px; color: #94a3b8; text-align: center; }
          @media print { body { padding: 16px; } }
        </style>
      </head>
      <body>
        <h1>Customer Work Summary</h1>
        <div style="font-size:13px;color:#64748b;margin-bottom:16px;">Repair Order ${esc(ro.roNumber)} &bull; ${esc(ro.status)}</div>

        <h2>Customer &amp; Vehicle</h2>
        <div class="meta">
          <div><span>Name / Account</span><br/><strong>${esc(ro.accountLabel)}</strong></div>
          <div><span>Phone</span><br/><strong>${esc(ro.phone || "-")}</strong></div>
          <div><span>Plate / Conduction</span><br/><strong>${esc(ro.plateNumber || ro.conductionNumber || "-")}</strong></div>
          <div><span>Vehicle</span><br/><strong>${esc([ro.make, ro.model, ro.year, ro.color].filter(Boolean).join(" ") || "-")}</strong></div>
          <div><span>Odometer</span><br/><strong>${esc(ro.odometerKm ? ro.odometerKm + " km" : "-")}</strong></div>
          <div><span>Service Advisor</span><br/><strong>${esc(ro.advisorName || "-")}</strong></div>
        </div>
        <div style="background:#f1f5f9;border-radius:4px;padding:10px 12px;font-size:13px;margin-top:6px;">
          <strong>Customer Concern:</strong> ${esc(ro.customerConcern || "-")}
        </div>

        ${table("Approved Work", "#15803d", approvedLines, approvedTotal)}
        ${deferredLines.length > 0 ? table("Deferred  -  Decide Later", "#b45309", deferredLines, deferredTotal) : ""}
        ${declinedLines.length > 0 ? table("Declined  -  Not Proceeding", "#b91c1c", declinedLines, declinedTotal) : ""}

        <div class="totals">
          <table>
            <tr><td>Approved Work Total</td><td style="text-align:right;font-weight:600;">${formatCurrency(approvedTotal)}</td></tr>
            ${deferredLines.length > 0 ? `<tr><td style="color:#b45309;">Deferred (excluded)</td><td style="text-align:right;color:#b45309;">${formatCurrency(deferredTotal)}</td></tr>` : ""}
            ${declinedLines.length > 0 ? `<tr><td style="color:#b91c1c;">Declined (excluded)</td><td style="text-align:right;color:#b91c1c;">${formatCurrency(declinedTotal)}</td></tr>` : ""}
          </table>
          <div class="grand" style="display:flex;justify-content:space-between;">
            <span>Estimated Amount Due</span>
            <span>${formatCurrency(approvedTotal)}</span>
          </div>
          <div style="font-size:11px;color:#94a3b8;margin-top:4px;">This is an estimate only. Final amount may vary after inspection and parts sourcing.</div>
        </div>

        <div class="footer">Generated ${new Date().toLocaleString()} &bull; ${esc(ro.roNumber)}</div>
      </body>
    </html>`;

  popup.document.write(html);
  popup.document.close();
  popup.focus();
  popup.print();
}

function buildRepairOrderExportText(ro: RepairOrderRecord, users: UserAccount[]) {
  const primary = users.find((user) => user.id === ro.primaryTechnicianId)?.fullName || "Unassigned";
  const support = ro.supportTechnicianIds.map((id) => users.find((user) => user.id === id)?.fullName || id).join(", ") || "None";
  const workLines = ro.workLines.map((line, index) =>
    `${index + 1}. ${line.title || "Untitled"} | ${line.category} | ${line.status} | ${line.approvalDecision ?? "Pending"} | ${formatCurrency(parseMoneyInput(line.totalEstimate))}`
  ).join("\n");
  return [
    `Repair Order: ${ro.roNumber}`,
    `Status: ${ro.status}`,
    `Customer: ${ro.accountLabel}`,
    `Plate: ${ro.plateNumber || ro.conductionNumber || "-"}`,
    `Vehicle: ${[ro.make, ro.model, ro.year, ro.color].filter(Boolean).join(" ") || "-"}`,
    `Concern: ${ro.customerConcern || "-"}`,
    `Advisor: ${ro.advisorName || "-"}`,
    `Primary Technician: ${primary}`,
    `Support Technicians: ${support}`,
    `Created: ${formatDateTime(ro.createdAt)}`,
    `Updated: ${formatDateTime(ro.updatedAt)}`,
    "",
    "Work Lines:",
    workLines || "No work lines yet.",
  ].join("\n");
}

function buildQcExportText(ro: RepairOrderRecord, qc: QCRecord | null) {
  return [
    `QC Record for ${ro.roNumber}`,
    `RO Status: ${ro.status}`,
    `Customer: ${ro.accountLabel}`,
    `Plate: ${ro.plateNumber || ro.conductionNumber || "-"}`,
    `Vehicle: ${[ro.make, ro.model, ro.year].filter(Boolean).join(" ") || "-"}`,
    "",
    qc
      ? `Latest QC: ${qc.qcNumber} | ${qc.result} | ${formatDateTime(qc.createdAt)} | By: ${qc.qcBy}`
      : "Latest QC: No QC record yet",
    qc ? `Notes: ${qc.notes || "-"}` : "",
    "",
    "Approved Work Lines:",
    ro.workLines
      .filter((line) => line.approvalDecision === "Approved")
      .map((line, index) => `${index + 1}. ${line.title} | ${line.status} | ${formatCurrency(parseMoneyInput(line.totalEstimate))}`)
      .join("\n") || "No approved work lines.",
  ].join("\n");
}

function buildReleaseExportText(
  ro: RepairOrderRecord,
  invoice: InvoiceRecord | null,
  payments: PaymentRecord[],
  release: ReleaseRecord | null,
  qc: QCRecord | null,
  finalTotalAmount: string
) {
  const paid = payments.reduce((sum, row) => sum + parseMoneyInput(row.amount), 0);
  return [
    `Release Summary for ${ro.roNumber}`,
    `RO Status: ${ro.status}`,
    `Customer: ${ro.accountLabel}`,
    `Plate: ${ro.plateNumber || ro.conductionNumber || "-"}`,
    `Vehicle: ${[ro.make, ro.model, ro.year].filter(Boolean).join(" ") || "-"}`,
    `Latest QC: ${qc ? `${qc.qcNumber} | ${qc.result}` : "No QC record"}`,
    `Invoice: ${invoice ? invoice.invoiceNumber : "No invoice"}`,
    `Invoice Status: ${invoice ? invoice.status : "-"}`,
    `Payment Status: ${invoice ? invoice.paymentStatus : "-"}`,
    `Final Total: ${formatCurrency(parseMoneyInput(finalTotalAmount))}`,
    `Total Paid: ${formatCurrency(paid)}`,
    `Balance: ${formatCurrency(Math.max(parseMoneyInput(finalTotalAmount) - paid, 0))}`,
    "",
    "Payments:",
    payments.map((payment, index) =>
      `${index + 1}. ${payment.paymentNumber} | ${formatCurrency(parseMoneyInput(payment.amount))} | ${payment.method} | ${formatDateTime(payment.createdAt)}`
    ).join("\n") || "No payments yet.",
    "",
    release
      ? `Latest Release: ${release.releaseNumber} | ${formatDateTime(release.createdAt)} | By: ${release.releasedBy}`
      : "Latest Release: No release record yet",
  ].join("\n");
}

function buildBackjobExportText(backjob: BackjobRecord, users: UserAccount[]) {
  const comebackTech = users.find((user) => user.id === backjob.comebackPrimaryTechnicianId)?.fullName || "Unassigned";
  const originalTech = users.find((user) => user.id === backjob.originalPrimaryTechnicianId)?.fullName || "Unassigned";
  return [
    `Backjob: ${backjob.backjobNumber}`,
    `Status: ${backjob.status}`,
    `Linked RO: ${backjob.linkedRoNumber}`,
    `Customer: ${backjob.customerLabel}`,
    `Plate: ${backjob.plateNumber || "-"}`,
    `Responsibility: ${backjob.responsibility}`,
    `Original Invoice: ${backjob.originalInvoiceNumber || "-"}`,
    `Comeback Invoice: ${backjob.comebackInvoiceNumber || "-"}`,
    `Original Technician: ${originalTech}`,
    `Comeback Technician: ${comebackTech}`,
    `Complaint: ${backjob.complaint || "-"}`,
    `Findings: ${backjob.findings || "-"}`,
    `Root Cause: ${backjob.rootCause || "-"}`,
    `Action Taken: ${backjob.actionTaken || "-"}`,
    `Resolution Notes: ${backjob.resolutionNotes || "-"}`,
    `Created: ${formatDateTime(backjob.createdAt)}`,
    `Updated: ${formatDateTime(backjob.updatedAt)}`,
  ].join("\n");
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
        "bookings.view",
        "intake.view",
        "inspection.view",
        "repairOrders.view",
        "shopFloor.view",
        "release.view",
        "parts.view",
        "backjobs.view",
        "history.view",
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
        "backjobs.view",
        "history.view",
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
        "bookings.view",
        "intake.view",
        "repairOrders.view",
        "release.view",
        "parts.view",
        "backjobs.view",
        "history.view",
      ],
    },
    {
      role: "Reception",
      permissions: ["dashboard.view", "bookings.view", "intake.view", "release.view", "history.view"],
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

function formatMinutesAsHours(minutes: number) {
  if (!minutes || minutes <= 0) return "0.0h";
  return `${(minutes / 60).toFixed(1)}h`;
}

function getWorkLogMinutes(log: WorkLog) {
  if (log.endedAt) return Math.max(0, log.totalMinutes || 0);
  const started = new Date(log.startedAt).getTime();
  if (Number.isNaN(started)) return Math.max(0, log.totalMinutes || 0);
  return Math.max(0, Math.floor((Date.now() - started) / 60000));
}

function toApprovalDecision(value: string | undefined | null): ApprovalDecision {
  if (value === "Approved" || value === "Declined" || value === "Deferred") return value;
  return "Pending";
}

function getEmptyAdditionalFinding(): CategoryAdditionalFinding {
  return {
    id: uid("af"),
    title: "",
    note: "",
    status: "Monitor",
    photoNotes: [],
  };
}

function normalizeAdditionalFindings(value: unknown): CategoryAdditionalFinding[] {
  if (!Array.isArray(value)) return [];
  return value.map((item, index) => {
    const row = item as Partial<CategoryAdditionalFinding> | null;
    return {
      id: row?.id || uid(`af_${index}`),
      title: row?.title ?? "",
      note: row?.note ?? "",
      status: row?.status === "OK" || row?.status === "Monitor" || row?.status === "Replace" ? row.status : "Monitor",
      photoNotes: Array.isArray(row?.photoNotes) ? row!.photoNotes.map((note) => String(note ?? "")) : [],
    };
  });
}

function buildFindingRecommendations(findings: CategoryAdditionalFinding[], categoryLabel: string) {
  const recommendations: string[] = [];
  findings.forEach((finding) => {
    const title = finding.title.trim();
    if (!title) return;
    if (finding.status === "OK") return;
    const prefix = finding.status === "Replace" ? "Replace" : "Inspect / Monitor";
    recommendations.push(`${prefix}: ${categoryLabel} - ${title}`);
  });
  return recommendations;
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
    customerDescription: "",
    laborHours: "",
    laborRate: "",
    partsCost: "",
    partsMarkupPercent: "",
    estimateUploadName: "",
    recommendationSource: "",
    approvalDecision: "Pending",
    approvalAt: "",
  };
}

function recalculateWorkLine(line: RepairOrderWorkLine): RepairOrderWorkLine {
  const pricing = getWorkLinePricing(line);
  const nextServiceEstimate = pricing.laborAmount > 0 ? pricing.laborAmount.toFixed(2) : line.serviceEstimate;
  const nextPartsEstimate = pricing.partsAmount > 0 ? pricing.partsAmount.toFixed(2) : line.partsEstimate;
  return {
    ...line,
    serviceEstimate: nextServiceEstimate,
    partsEstimate: nextPartsEstimate,
    customerDescription: line.customerDescription?.trim() ? line.customerDescription : buildDefaultCustomerDescription(line),
    totalEstimate: pricing.totalAmount.toFixed(2),
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

function getBookingStatusStyle(status: BookingStatus): React.CSSProperties {
  if (status === "Converted to Intake") return styles.statusOk;
  if (status === "Cancelled" || status === "No Show") return styles.statusLocked;
  if (status === "Arrived" || status === "Confirmed" || status === "Rescheduled") return styles.statusWarning;
  return styles.statusInfo;
}

function getPartsRequestStatusStyle(status: PartsRequestStatus): React.CSSProperties {
  if (["Closed", "Parts Arrived", "Arrived", "Return Approved"].includes(status)) return styles.statusOk;
  if (["Cancelled", "Return Rejected"].includes(status)) return styles.statusLocked;
  if (["Ordered", "In Transit", "Shipped", "Waiting for Bids", "Sent to Suppliers", "Bidding", "Supplier Selected", "Return Requested"].includes(status)) return styles.statusWarning;
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


function getVehicleAccountLabel(record: { companyName: string; customerName: string }) {
  return record.companyName || record.customerName || "Unknown Customer";
}

function normalizeLegacyPartsStatus(status: PartsRequestStatus): PartsRequestStatus {
  if (status === "Bidding") return "Waiting for Bids";
  if (status === "Arrived") return "Parts Arrived";
  if (status === "Shipped") return "In Transit";
  return status;
}

function parseRecommendationLines(input: string) {
  return input
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}



function buildFindingToRORecommendations(record: InspectionRecord): FindingToRORecommendation[] {
  const categories: Array<{
    key: FindingCategoryKey;
    label: string;
    items: CategoryAdditionalFinding[];
  }> = [
    { key: "coolingAdditionalFindings", label: "Cooling System", items: record.coolingAdditionalFindings ?? [] },
    { key: "steeringAdditionalFindings", label: "Steering", items: record.steeringAdditionalFindings ?? [] },
    { key: "enginePerformanceAdditionalFindings", label: "Engine Performance", items: record.enginePerformanceAdditionalFindings ?? [] },
    { key: "roadTestAdditionalFindings", label: "Road Test", items: record.roadTestAdditionalFindings ?? [] },
  ];

  return categories.flatMap(({ label, items }) =>
    items
      .filter((finding) => finding.status !== "OK" && (!!finding.title.trim() || !!finding.note.trim()))
      .map((finding) => ({
        id: finding.id,
        category: label,
        title: finding.title.trim() || `${label} Finding`,
        note: finding.note.trim(),
        status: finding.status,
        photoNotes: finding.photoNotes.map((note) => note.trim()).filter(Boolean),
        workLineTitle: finding.title.trim() || `${label} Finding`,
      }))
  );
}

type CustomerInspectionStatus = "Good" | "Needs Attention" | "Critical";

type CustomerInspectionFinding = {
  title: string;
  status: CustomerInspectionStatus;
  note: string;
};

type CustomerInspectionSection = {
  label: string;
  note: string;
  findings: CustomerInspectionFinding[];
};

function getCustomerInspectionStatus(value: string | null | undefined): CustomerInspectionStatus | null {
  const normalized = String(value ?? "").trim();
  if (normalized === "Good" || normalized === "OK") return "Good";
  if (normalized === "Monitor" || normalized === "Needs Attention") return "Needs Attention";
  if (normalized === "Replace" || normalized === "Needs Replacement") return "Critical";
  return null;
}

function getCustomerInspectionStatusStyle(status: CustomerInspectionStatus): React.CSSProperties {
  if (status === "Good") return styles.statusOk;
  if (status === "Needs Attention") return styles.statusWarning;
  return styles.statusLocked;
}

function joinInspectionNotes(...notes: Array<string | number | null | undefined>) {
  return notes
    .map((note) => String(note ?? "").trim())
    .filter(Boolean)
    .join("  |  ");
}

function buildCustomerInspectionSections(record: InspectionRecord): CustomerInspectionSection[] {
  const sections: CustomerInspectionSection[] = [];
  const coolingAdditionalFindings = Array.isArray(record.coolingAdditionalFindings) ? record.coolingAdditionalFindings : [];
  const steeringAdditionalFindings = Array.isArray(record.steeringAdditionalFindings) ? record.steeringAdditionalFindings : [];
  const enginePerformanceAdditionalFindings = Array.isArray(record.enginePerformanceAdditionalFindings) ? record.enginePerformanceAdditionalFindings : [];
  const roadTestAdditionalFindings = Array.isArray(record.roadTestAdditionalFindings) ? record.roadTestAdditionalFindings : [];
  const scanUploadNames = Array.isArray(record.scanUploadNames) ? record.scanUploadNames : [];
  const electricalBatteryVoltage = String(record.electricalBatteryVoltage ?? "");
  const electricalChargingVoltage = String(record.electricalChargingVoltage ?? "");
  const scanNotes = String(record.scanNotes ?? "");
  const scanToolUsed = String(record.scanToolUsed ?? "");
  const alignmentConcernNotes = String(record.alignmentConcernNotes ?? "");
  const alignmentBeforePrintoutName = String(record.alignmentBeforePrintoutName ?? "");
  const alignmentAfterPrintoutName = String(record.alignmentAfterPrintoutName ?? "");
  const inspectionNotes = String(record.inspectionNotes ?? "");

  const pushSection = (label: string, findings: CustomerInspectionFinding[], note?: string | null) => {
    const safeNote = String(note ?? "").trim();
    if (!findings.length && !safeNote) return;
    sections.push({ label, note: safeNote, findings });
  };

  const pushFinding = (findings: CustomerInspectionFinding[], title: string, value: string | null | undefined, note?: string | null) => {
    const status = getCustomerInspectionStatus(value);
    if (!status) return;
    findings.push({ title, status, note: String(note ?? "").trim() });
  };

  const arrivalFindings: CustomerInspectionFinding[] = [];
  pushFinding(arrivalFindings, "Exterior lights", record.arrivalLights);
  pushFinding(arrivalFindings, "Broken glass", record.arrivalBrokenGlass);
  pushFinding(arrivalFindings, "Wipers", record.arrivalWipers);
  pushFinding(arrivalFindings, "Horn", record.arrivalHorn);
  pushFinding(arrivalFindings, "Check engine light", record.arrivalCheckEngineLight);
  pushFinding(arrivalFindings, "ABS light", record.arrivalAbsLight);
  pushFinding(arrivalFindings, "Airbag light", record.arrivalAirbagLight);
  pushFinding(arrivalFindings, "Battery light", record.arrivalBatteryLight);
  pushFinding(arrivalFindings, "Oil pressure light", record.arrivalOilPressureLight);
  pushFinding(arrivalFindings, "Temperature light", record.arrivalTempLight);
  pushFinding(arrivalFindings, "Transmission light", record.arrivalTransmissionLight);
  pushFinding(arrivalFindings, "Other warning light", record.arrivalOtherWarningLight, record.arrivalOtherWarningNote);
  pushSection("Arrival / Safety", arrivalFindings, joinInspectionNotes(record.inspectionPhotoNotes, record.arrivalOtherWarningNote));

  const tireFindings: CustomerInspectionFinding[] = [];
  pushFinding(tireFindings, "Front left tire", record.frontLeftTireState, joinInspectionNotes(
    record.frontLeftTreadMm ? `Tread ${record.frontLeftTreadMm} mm` : "",
    record.frontLeftWearPattern ? `Wear ${record.frontLeftWearPattern}` : ""
  ));
  pushFinding(tireFindings, "Front right tire", record.frontRightTireState, joinInspectionNotes(
    record.frontRightTreadMm ? `Tread ${record.frontRightTreadMm} mm` : "",
    record.frontRightWearPattern ? `Wear ${record.frontRightWearPattern}` : ""
  ));
  pushFinding(tireFindings, "Rear left tire", record.rearLeftTireState, joinInspectionNotes(
    record.rearLeftTreadMm ? `Tread ${record.rearLeftTreadMm} mm` : "",
    record.rearLeftWearPattern ? `Wear ${record.rearLeftWearPattern}` : ""
  ));
  pushFinding(tireFindings, "Rear right tire", record.rearRightTireState, joinInspectionNotes(
    record.rearRightTreadMm ? `Tread ${record.rearRightTreadMm} mm` : "",
    record.rearRightWearPattern ? `Wear ${record.rearRightWearPattern}` : ""
  ));
  pushSection("Tires", tireFindings);

  const underHoodFindings: CustomerInspectionFinding[] = [];
  pushFinding(underHoodFindings, "Under hood overall", record.underHoodState, record.underHoodSummary);
  pushFinding(underHoodFindings, "Engine oil level", record.engineOilLevel, record.engineOilNotes);
  pushFinding(underHoodFindings, "Engine oil condition", record.engineOilCondition, record.engineOilNotes);
  pushFinding(underHoodFindings, "Engine oil leaks", record.engineOilLeaks, joinInspectionNotes(record.engineOilNotes, record.leakNotes));
  pushFinding(underHoodFindings, "Coolant level", record.coolantLevel, record.coolantNotes);
  pushFinding(underHoodFindings, "Coolant condition", record.coolantCondition, record.coolantNotes);
  pushFinding(underHoodFindings, "Radiator hose condition", record.radiatorHoseCondition, record.coolantNotes);
  pushFinding(underHoodFindings, "Cooling leaks", record.coolingLeaks, record.coolantNotes);
  pushFinding(underHoodFindings, "Brake fluid level", record.brakeFluidLevel, record.brakeFluidNotes);
  pushFinding(underHoodFindings, "Brake fluid condition", record.brakeFluidCondition, record.brakeFluidNotes);
  pushFinding(underHoodFindings, "Power steering level", record.powerSteeringLevel, record.powerSteeringNotes);
  pushFinding(underHoodFindings, "Power steering condition", record.powerSteeringCondition, record.powerSteeringNotes);
  pushFinding(underHoodFindings, "Battery condition", record.batteryCondition, record.batteryNotes);
  pushFinding(underHoodFindings, "Battery terminal condition", record.batteryTerminalCondition, record.batteryNotes);
  pushFinding(underHoodFindings, "Battery hold-down condition", record.batteryHoldDownCondition, record.batteryNotes);
  pushFinding(underHoodFindings, "Drive belt condition", record.driveBeltCondition, record.beltNotes);
  pushFinding(underHoodFindings, "Air filter condition", record.airFilterCondition, record.intakeNotes);
  pushFinding(underHoodFindings, "Intake hose condition", record.intakeHoseCondition, record.intakeNotes);
  pushFinding(underHoodFindings, "Engine mount condition", record.engineMountCondition);
  pushFinding(underHoodFindings, "Wiring condition", record.wiringCondition);
  pushFinding(underHoodFindings, "Unusual smell", record.unusualSmellState);
  pushFinding(underHoodFindings, "Unusual sound", record.unusualSoundState);
  pushFinding(underHoodFindings, "Visible engine leak", record.visibleEngineLeakState, record.leakNotes);
  pushSection("Under Hood", underHoodFindings, record.underHoodSummary);

  const brakeFindings: CustomerInspectionFinding[] = [];
  pushFinding(brakeFindings, "Front brake condition", record.frontBrakeState, joinInspectionNotes(record.frontBrakeCondition, record.brakeFluidNotes));
  pushFinding(brakeFindings, "Rear brake condition", record.rearBrakeState, joinInspectionNotes(record.rearBrakeCondition, record.brakeFluidNotes));
  pushSection("Brakes", brakeFindings, joinInspectionNotes(record.brakeFluidNotes));

  const coolingFindings: CustomerInspectionFinding[] = [];
  pushFinding(coolingFindings, "Cooling fan operation", record.coolingFanOperationState, record.coolingSystemNotes);
  pushFinding(coolingFindings, "Radiator condition", record.radiatorConditionState, record.coolingSystemNotes);
  pushFinding(coolingFindings, "Water pump condition", record.waterPumpConditionState, record.coolingSystemNotes);
  pushFinding(coolingFindings, "Thermostat condition", record.thermostatConditionState, record.coolingSystemNotes);
  pushFinding(coolingFindings, "Overflow reservoir condition", record.overflowReservoirConditionState, record.coolingSystemNotes);
  pushFinding(coolingFindings, "Cooling system pressure", record.coolingSystemPressureState, record.coolingSystemNotes);
  coolingAdditionalFindings.forEach((finding) => {
    const status = getCustomerInspectionStatus(finding.status);
    if (!status) return;
    coolingFindings.push({
      title: finding.title.trim() || "Cooling finding",
      status,
      note: joinInspectionNotes(finding.note, finding.photoNotes.join("  |  ")),
    });
  });
  pushSection("Cooling System", coolingFindings, record.coolingSystemNotes);

  const steeringFindings: CustomerInspectionFinding[] = [];
  pushFinding(steeringFindings, "Steering wheel play", record.steeringWheelPlayState, record.steeringSystemNotes);
  pushFinding(steeringFindings, "Steering pump / EPS motor", record.steeringPumpMotorState, record.steeringSystemNotes);
  pushFinding(steeringFindings, "Steering fluid condition", record.steeringFluidConditionState, record.steeringSystemNotes);
  pushFinding(steeringFindings, "Steering hose condition", record.steeringHoseConditionState, record.steeringSystemNotes);
  pushFinding(steeringFindings, "Steering column condition", record.steeringColumnConditionState, record.steeringSystemNotes);
  pushFinding(steeringFindings, "Road feel", record.steeringRoadFeelState, record.steeringSystemNotes);
  steeringAdditionalFindings.forEach((finding) => {
    const status = getCustomerInspectionStatus(finding.status);
    if (!status) return;
    steeringFindings.push({
      title: finding.title.trim() || "Steering finding",
      status,
      note: joinInspectionNotes(finding.note, finding.photoNotes.join("  |  ")),
    });
  });
  pushSection("Steering", steeringFindings, record.steeringSystemNotes);

  const engineFindings: CustomerInspectionFinding[] = [];
  pushFinding(engineFindings, "Starting performance", record.engineStartingState, record.enginePerformanceNotes);
  pushFinding(engineFindings, "Idle quality", record.idleQualityState, record.enginePerformanceNotes);
  pushFinding(engineFindings, "Acceleration response", record.accelerationResponseState, record.enginePerformanceNotes);
  pushFinding(engineFindings, "Misfire", record.engineMisfireState, record.enginePerformanceNotes);
  pushFinding(engineFindings, "Smoke", record.engineSmokeState, record.enginePerformanceNotes);
  pushFinding(engineFindings, "Fuel efficiency concern", record.fuelEfficiencyConcernState, record.enginePerformanceNotes);
  enginePerformanceAdditionalFindings.forEach((finding) => {
    const status = getCustomerInspectionStatus(finding.status);
    if (!status) return;
    engineFindings.push({
      title: finding.title.trim() || "Engine performance finding",
      status,
      note: joinInspectionNotes(finding.note, finding.photoNotes.join("  |  ")),
    });
  });
  pushSection("Engine Performance", engineFindings, record.enginePerformanceNotes);

  const roadTestFindings: CustomerInspectionFinding[] = [];
  pushFinding(roadTestFindings, "Noise during road test", record.roadTestNoiseState, record.roadTestNotes);
  pushFinding(roadTestFindings, "Brake feel", record.roadTestBrakeFeelState, record.roadTestNotes);
  pushFinding(roadTestFindings, "Steering tracking", record.roadTestSteeringTrackingState, record.roadTestNotes);
  pushFinding(roadTestFindings, "Ride quality", record.roadTestRideQualityState, record.roadTestNotes);
  pushFinding(roadTestFindings, "Acceleration", record.roadTestAccelerationState, record.roadTestNotes);
  pushFinding(roadTestFindings, "Transmission shift quality", record.roadTestTransmissionShiftState, record.roadTestNotes);
  roadTestAdditionalFindings.forEach((finding) => {
    const status = getCustomerInspectionStatus(finding.status);
    if (!status) return;
    roadTestFindings.push({
      title: finding.title.trim() || "Road test finding",
      status,
      note: joinInspectionNotes(finding.note, finding.photoNotes.join("  |  ")),
    });
  });
  pushSection("Road Test", roadTestFindings, record.roadTestNotes);

  const acFindings: CustomerInspectionFinding[] = [];
  pushFinding(acFindings, "Cooling performance", record.acCoolingPerformanceState, joinInspectionNotes(record.acVentTemperature ? `Vent temperature ${record.acVentTemperature}` : "", record.acNotes));
  pushFinding(acFindings, "Compressor condition", record.acCompressorState, record.acNotes);
  pushFinding(acFindings, "Condenser fan condition", record.acCondenserFanState, record.acNotes);
  pushFinding(acFindings, "Cabin filter condition", record.acCabinFilterState, record.acNotes);
  pushFinding(acFindings, "Airflow condition", record.acAirflowState, record.acNotes);
  pushFinding(acFindings, "Odor condition", record.acOdorState, record.acNotes);
  pushSection("A/C", acFindings, joinInspectionNotes(record.acVentTemperature ? `Vent temperature ${record.acVentTemperature}` : "", record.acNotes));

  const electricalFindings: CustomerInspectionFinding[] = [];
  pushFinding(electricalFindings, "Starter", record.electricalStarterState, record.electricalNotes);
  pushFinding(electricalFindings, "Alternator", record.electricalAlternatorState, record.electricalNotes);
  pushFinding(electricalFindings, "Fuse / relay", record.electricalFuseRelayState, record.electricalNotes);
  pushFinding(electricalFindings, "Wiring", record.electricalWiringState, record.electricalNotes);
  pushFinding(electricalFindings, "Warning light", record.electricalWarningLightState, record.electricalNotes);
  if (electricalBatteryVoltage.trim()) {
    electricalFindings.push({ title: "Battery voltage", status: "Good", note: electricalBatteryVoltage.trim() });
  }
  if (electricalChargingVoltage.trim()) {
    electricalFindings.push({ title: "Charging voltage", status: "Good", note: electricalChargingVoltage.trim() });
  }
  pushSection("Electrical", electricalFindings, record.electricalNotes);

  const transmissionFindings: CustomerInspectionFinding[] = [];
  pushFinding(transmissionFindings, "Transmission fluid", record.transmissionFluidState, record.transmissionNotes);
  pushFinding(transmissionFindings, "Transmission fluid condition", record.transmissionFluidConditionState, record.transmissionNotes);
  pushFinding(transmissionFindings, "Transmission leak", record.transmissionLeakState, record.transmissionNotes);
  pushFinding(transmissionFindings, "Shifting performance", record.shiftingPerformanceState, record.transmissionNotes);
  pushFinding(transmissionFindings, "Clutch operation", record.clutchOperationState, record.transmissionNotes);
  pushFinding(transmissionFindings, "Drivetrain vibration", record.drivetrainVibrationState, record.transmissionNotes);
  pushFinding(transmissionFindings, "CV joint / drive axle", record.cvJointDriveAxleState, record.transmissionNotes);
  pushFinding(transmissionFindings, "Transmission mount", record.transmissionMountState, record.transmissionNotes);
  pushSection("Transmission", transmissionFindings, record.transmissionNotes);

  const suspensionFindings: CustomerInspectionFinding[] = [];
  pushFinding(suspensionFindings, "Front shock", record.frontShockState, record.frontSuspensionNotes);
  pushFinding(suspensionFindings, "Front ball joint", record.frontBallJointState, record.frontSuspensionNotes);
  pushFinding(suspensionFindings, "Front tie rod end", record.frontTieRodEndState, record.frontSuspensionNotes);
  pushFinding(suspensionFindings, "Front rack end", record.frontRackEndState, record.frontSuspensionNotes);
  pushFinding(suspensionFindings, "Front stabilizer link", record.frontStabilizerLinkState, record.frontSuspensionNotes);
  pushFinding(suspensionFindings, "Front control arm bushing", record.frontControlArmBushingState, record.frontSuspensionNotes);
  pushFinding(suspensionFindings, "Front upper control arm", record.frontUpperControlArmState, record.frontSuspensionNotes);
  pushFinding(suspensionFindings, "Front lower control arm", record.frontLowerControlArmState, record.frontSuspensionNotes);
  pushFinding(suspensionFindings, "Front strut mount", record.frontStrutMountState, record.frontSuspensionNotes);
  pushFinding(suspensionFindings, "Steering rack", record.steeringRackConditionState, record.steeringFeelNotes);
  pushFinding(suspensionFindings, "Front CV boot", record.frontCvBootState, record.frontSuspensionNotes);
  pushFinding(suspensionFindings, "Front wheel bearing", record.frontWheelBearingState, record.frontSuspensionNotes);
  pushFinding(suspensionFindings, "Rear shock", record.rearShockState, record.rearSuspensionNotes);
  pushFinding(suspensionFindings, "Rear stabilizer link", record.rearStabilizerLinkState, record.rearSuspensionNotes);
  pushFinding(suspensionFindings, "Rear bushing", record.rearBushingState, record.rearSuspensionNotes);
  pushFinding(suspensionFindings, "Rear spring", record.rearSpringState, record.rearSuspensionNotes);
  pushFinding(suspensionFindings, "Rear control arm", record.rearControlArmState, record.rearSuspensionNotes);
  pushFinding(suspensionFindings, "Rear coil spring", record.rearCoilSpringState, record.rearSuspensionNotes);
  pushFinding(suspensionFindings, "Rear leaf spring", record.rearLeafSpringState, record.rearSuspensionNotes);
  pushFinding(suspensionFindings, "Rear leaf spring bushing", record.rearLeafSpringBushingState, record.rearSuspensionNotes);
  pushFinding(suspensionFindings, "Rear U-bolt mount", record.rearUBoltMountState, record.rearSuspensionNotes);
  pushFinding(suspensionFindings, "Rear axle mount", record.rearAxleMountState, record.rearSuspensionNotes);
  pushFinding(suspensionFindings, "Rear wheel bearing", record.rearWheelBearingState, record.rearSuspensionNotes);
  pushSection("Suspension", suspensionFindings, joinInspectionNotes(record.rearSuspensionType, record.frontSuspensionNotes, record.rearSuspensionNotes, record.steeringFeelNotes, record.suspensionRoadTestNotes));

  const scanFindings: CustomerInspectionFinding[] = [];
  if (record.scanPerformed || scanNotes.trim() || scanUploadNames.length > 0) {
    scanFindings.push({
      title: "Scan performed",
      status: record.scanPerformed ? "Good" : "Needs Attention",
      note: joinInspectionNotes(record.scanToolUsed, record.scanNotes),
    });
  }
  if (scanUploadNames.length > 0) {
    scanFindings.push({
      title: "Scan file uploads",
      status: "Good",
      note: scanUploadNames.join("  |  "),
    });
  }
  pushSection("Scan / Diagnostics", scanFindings, joinInspectionNotes(scanToolUsed, scanNotes));

  const alignmentFindings: CustomerInspectionFinding[] = [];
  if (record.alignmentRecommended || alignmentConcernNotes.trim() || alignmentBeforePrintoutName.trim() || alignmentAfterPrintoutName.trim()) {
    alignmentFindings.push({
      title: "Alignment check",
      status: record.alignmentRecommended ? "Needs Attention" : "Good",
      note: joinInspectionNotes(
        alignmentConcernNotes,
        alignmentBeforePrintoutName ? `Before printout: ${alignmentBeforePrintoutName}` : "",
        alignmentAfterPrintoutName ? `After printout: ${alignmentAfterPrintoutName}` : ""
      ),
    });
  }
  pushSection("Alignment", alignmentFindings, alignmentConcernNotes);

  if (inspectionNotes.trim()) {
    pushSection("Inspection Notes", [{
      title: "Overall notes",
      status: "Good",
      note: inspectionNotes.trim(),
    }], "");
  }

  return sections;
}

function groupInspectionMediaBySection(items?: InspectionEvidenceRecord[] | null) {
  const grouped = new Map<string, InspectionEvidenceRecord[]>();
  (items ?? []).forEach((item) => {
    if (!item || typeof item !== "object") return;
    const key = String(item?.section ?? "").trim() || "General";
    const current = grouped.get(key) ?? [];
    current.push(item);
    grouped.set(key, current);
  });
  return Array.from(grouped.entries()).map(([section, media]) => ({ section, media }));
}

type CustomerPortalErrorBoundaryProps = {
  onReset: () => void;
  children: React.ReactNode;
};

type CustomerPortalErrorBoundaryState = {
  hasError: boolean;
  errorMessage: string;
};

class CustomerPortalErrorBoundary extends React.Component<CustomerPortalErrorBoundaryProps, CustomerPortalErrorBoundaryState> {
  state: CustomerPortalErrorBoundaryState = {
    hasError: false,
    errorMessage: "",
  };

  static getDerivedStateFromError(error: Error): CustomerPortalErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error.message || "Customer portal could not be rendered.",
    };
  }

  componentDidCatch(error: Error, _errorInfo: React.ErrorInfo) {
    console.error("Customer portal render error:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <style>{globalCss}</style>
          <div style={styles.appShell}>
            <div style={styles.mainArea}>
              <div style={styles.pageContent}>
                <div style={styles.grid}>
                  <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
                    <Card title="Customer Portal" subtitle="Recovery view">
                      <div style={styles.errorBox}>Customer portal failed to load.</div>
                      <div style={styles.formHint}>
                        {this.state.errorMessage || "A legacy record or inspection item caused the customer portal to crash. The rest of the app is still available."}
                      </div>
                      <div style={styles.inlineActions}>
                        <button type="button" style={styles.smallButtonSuccess} onClick={this.props.onReset}>
                          Return to Staff Login
                        </button>
                      </div>
                    </Card>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      );
    }

    return this.props.children;
  }
}

function isAttentionOrReplacement(value: InspectionCheckValue) {
  return value === "Needs Attention" || value === "Needs Replacement";
}


function isWarningLightOn(value: WarningLightState) {
  return value === "On";
}

function getWarningLightStyle(value: WarningLightState): React.CSSProperties {
  if (value === "On") return styles.statusLocked;
  if (value === "Off") return styles.statusOk;
  return styles.statusNeutral;
}

function getCustomerConditionLabelFromWorkLine(line: RepairOrderWorkLine) {
  if (line.status === "Completed") return "Good";
  if (line.status === "Waiting Parts") return "Needs Attention";
  if (line.priority === "High") return "Needs Replacement";
  if (line.priority === "Medium") return "Needs Attention";
  return "Monitor";
}

function getCustomerConditionStyle(label: "Good" | "Monitor" | "Needs Attention" | "Needs Replacement"): React.CSSProperties {
  if (label === "Good") return styles.statusOk;
  if (label === "Monitor") return styles.statusNeutral;
  if (label === "Needs Attention") return styles.statusWarning;
  return styles.statusLocked;
}

function buildScanRecommendations(form: InspectionForm) {
  const recommendations: string[] = [];
  const push = (condition: boolean, rec: string) => {
    if (condition && !recommendations.includes(rec)) recommendations.push(rec);
  };

  const anyArrivalWarningOn = [
    form.arrivalCheckEngineLight,
    form.arrivalAbsLight,
    form.arrivalAirbagLight,
    form.arrivalBatteryLight,
    form.arrivalOilPressureLight,
    form.arrivalTempLight,
    form.arrivalTransmissionLight,
    form.arrivalOtherWarningLight,
  ].some(isWarningLightOn);

  push(anyArrivalWarningOn, "OBD2 scan / warning light diagnostic");
  push(form.scanPerformed || form.scanUploadNames.length > 0, "Diagnostic review of scan results");
  push(anyArrivalWarningOn && (form.scanPerformed || form.scanUploadNames.length > 0), "Full system diagnostic review");
  push(!!form.scanNotes.trim(), "Diagnostic note review");

  return recommendations;
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





function buildCoolingRecommendations(form: InspectionForm) {
  const recommendations: string[] = [];

  const push = (condition: boolean, rec: string) => {
    if (condition && !recommendations.includes(rec)) recommendations.push(rec);
  };

  push(isAttentionOrReplacement(form.coolingFanOperationState), "Cooling fan inspection / service");
  push(isAttentionOrReplacement(form.radiatorConditionState), "Radiator inspection / service");
  push(isAttentionOrReplacement(form.waterPumpConditionState), "Water pump inspection / replacement");
  push(isAttentionOrReplacement(form.thermostatConditionState), "Thermostat inspection / replacement");
  push(isAttentionOrReplacement(form.overflowReservoirConditionState), "Overflow reservoir inspection");
  push(isAttentionOrReplacement(form.coolingSystemPressureState), "Cooling system pressure test");
  push(
    [
      form.coolingFanOperationState,
      form.radiatorConditionState,
      form.waterPumpConditionState,
      form.thermostatConditionState,
      form.overflowReservoirConditionState,
      form.coolingSystemPressureState,
    ].some(isAttentionOrReplacement) || !!form.coolingSystemNotes.trim(),
    "Cooling system diagnosis"
  );

  return recommendations;
}

function buildSteeringRecommendations(form: InspectionForm) {
  const recommendations: string[] = [];

  const push = (condition: boolean, rec: string) => {
    if (condition && !recommendations.includes(rec)) recommendations.push(rec);
  };

  push(isAttentionOrReplacement(form.steeringWheelPlayState), "Steering play inspection");
  push(isAttentionOrReplacement(form.steeringPumpMotorState), "Steering pump / EPS motor inspection");
  push(isAttentionOrReplacement(form.steeringFluidConditionState), "Steering fluid inspection / service");
  push(isAttentionOrReplacement(form.steeringHoseConditionState), "Steering hose / line inspection");
  push(isAttentionOrReplacement(form.steeringColumnConditionState), "Steering column inspection");
  push(isAttentionOrReplacement(form.steeringRoadFeelState), "Steering road feel diagnosis");
  push(
    [
      form.steeringWheelPlayState,
      form.steeringPumpMotorState,
      form.steeringFluidConditionState,
      form.steeringHoseConditionState,
      form.steeringColumnConditionState,
      form.steeringRoadFeelState,
    ].some(isAttentionOrReplacement) || !!form.steeringSystemNotes.trim(),
    "Steering system diagnosis"
  );

  return recommendations;
}

function buildEnginePerformanceRecommendations(form: InspectionForm) {
  const recommendations: string[] = [];

  const push = (condition: boolean, rec: string) => {
    if (condition && !recommendations.includes(rec)) recommendations.push(rec);
  };

  push(isAttentionOrReplacement(form.engineStartingState), "Starting performance diagnosis");
  push(isAttentionOrReplacement(form.idleQualityState), "Idle quality diagnosis");
  push(isAttentionOrReplacement(form.accelerationResponseState), "Acceleration response diagnosis");
  push(isAttentionOrReplacement(form.engineMisfireState), "Misfire diagnosis");
  push(isAttentionOrReplacement(form.engineSmokeState), "Engine smoke / combustion diagnosis");
  push(isAttentionOrReplacement(form.fuelEfficiencyConcernState), "Fuel efficiency performance check");
  push(
    [
      form.engineStartingState,
      form.idleQualityState,
      form.accelerationResponseState,
      form.engineMisfireState,
      form.engineSmokeState,
      form.fuelEfficiencyConcernState,
    ].some(isAttentionOrReplacement) || !!form.enginePerformanceNotes.trim(),
    "Engine performance diagnosis"
  );

  return recommendations;
}

function buildRoadTestRecommendations(form: InspectionForm) {
  const recommendations: string[] = [];

  const push = (condition: boolean, rec: string) => {
    if (condition && !recommendations.includes(rec)) recommendations.push(rec);
  };

  push(isAttentionOrReplacement(form.roadTestNoiseState), "Road-test noise diagnosis");
  push(isAttentionOrReplacement(form.roadTestBrakeFeelState), "Brake feel road-test diagnosis");
  push(isAttentionOrReplacement(form.roadTestSteeringTrackingState), "Steering tracking road-test diagnosis");
  push(isAttentionOrReplacement(form.roadTestRideQualityState), "Ride quality road-test diagnosis");
  push(isAttentionOrReplacement(form.roadTestAccelerationState), "Acceleration road-test diagnosis");
  push(isAttentionOrReplacement(form.roadTestTransmissionShiftState), "Shift quality road-test diagnosis");
  push(
    [
      form.roadTestNoiseState,
      form.roadTestBrakeFeelState,
      form.roadTestSteeringTrackingState,
      form.roadTestRideQualityState,
      form.roadTestAccelerationState,
      form.roadTestTransmissionShiftState,
    ].some(isAttentionOrReplacement) || !!form.roadTestNotes.trim(),
    "Extended road test and drivability review"
  );

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
    return `${index + 1}. ${line.title || "Untitled Work Line"}  -  ${amount}  -  ${decision}`;
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

function buildCustomerNotificationTemplates({
  ro,
  inspection,
  approvalRecord,
  approvalLinkToken,
  oilReminder,
  followUpReminder,
  partsRequests,
  releaseRecord,
  backjobRecord,
}: {
  ro: RepairOrderRecord | null;
  inspection: InspectionRecord | null;
  approvalRecord: ApprovalRecord | null;
  approvalLinkToken: ApprovalLinkToken | null;
  oilReminder: OilChangeReminder | null;
  followUpReminder: ReleaseFollowUpReminder | null;
  partsRequests: PartsRequestRecord[];
  releaseRecord: ReleaseRecord | null;
  backjobRecord: BackjobRecord | null;
}): CustomerNotificationTemplate[] {
  if (!ro) return [];

  const customerName = ro.accountLabel || ro.customerName || "Customer";
  const vehicleLabel = [ro.make, ro.model, ro.year].filter(Boolean).join(" ") || ro.plateNumber || ro.conductionNumber || "your vehicle";
  const plateLabel = ro.plateNumber || ro.conductionNumber || "-";
  const portalLink = approvalLinkToken ? `${buildCustomerPortalUrl(approvalLinkToken.token)}` : "";
  const estimateTotal = ro.workLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0);
  const inspectionSections = inspection ? buildCustomerInspectionSections(inspection) : [];
  const inspectionFindings = inspectionSections.flatMap((section) =>
    section.findings.map((finding) => ({
      section: section.label,
      title: finding.title,
      status: finding.status,
      note: finding.note,
    }))
  );
  const notableFindings = inspectionFindings.filter((finding) => finding.status !== "Good").slice(0, 4);
  const findingLines = notableFindings.length
    ? notableFindings.map((finding) => `- ${finding.section}: ${finding.title} - ${finding.status}${finding.note ? ` - ${finding.note}` : ""}`)
    : inspectionFindings.slice(0, 3).map((finding) => `- ${finding.section}: ${finding.title} - ${finding.status}${finding.note ? ` - ${finding.note}` : ""}`);
  const approvalLines = ro.workLines
    .filter((line) => (line.approvalDecision ?? "Pending") === "Pending" || line.approvalDecision === "Deferred")
    .slice(0, 4)
    .map((line) => {
      const amount = formatCurrency(parseMoneyInput(line.totalEstimate));
      const note = line.notes || getCustomerFriendlyLineDescription(line);
      return `- ${line.title || "Untitled Work Item"} (${amount}) - ${note}`;
    });
  const partsLines = partsRequests
    .filter((request) => request.roId === ro.id && !["Closed", "Cancelled"].includes(request.status))
    .slice(0, 4)
    .map((request) => `- ${request.partName || "Part request"} x${request.quantity || "1"} - ${request.status}`);
  const releaseChecklist = releaseRecord
    ? [
        `- Final total: ${formatCurrency(parseMoneyInput(releaseRecord.finalTotalAmount))}`,
        `- Payment settled: ${releaseRecord.paymentSettled ? "Yes" : "No"}`,
        `- Documents ready: ${releaseRecord.documentsReady ? "Yes" : "No"}`,
        `- Vehicle clean: ${releaseRecord.cleanVehicle ? "Yes" : "No"}`,
      ]
    : [
        `- Final total: ${formatCurrency(estimateTotal)}`,
        `- Payment settled: Pending`,
        `- Documents ready: Pending`,
        `- Vehicle clean: Pending`,
      ];
  const pullOutReason = ro.pullOutReason || backjobRecord?.findings || backjobRecord?.complaint || ro.customerConcern || "Work has been stopped for review.";
  const backjobLine = backjobRecord
    ? `- Backjob ${backjobRecord.backjobNumber}: ${backjobRecord.responsibility} | ${backjobRecord.status}`
    : "- No backjob record has been logged yet.";
  const bookingLink = buildCustomerBookingUrl();

  return [
    {
      key: "approval-request",
      title: "Approval Request",
      subtitle: "Send when the RO is ready for customer decision",
      body: [
        `Hi ${customerName},`,
        "",
        `Your repair order ${ro.roNumber} for ${vehicleLabel} (${plateLabel}) is ready for your approval.`,
        "",
        "Inspection highlights:",
        ...(findingLines.length ? findingLines : ["- No major inspection concerns recorded."]),
        "",
        "Recommended work items:",
        ...(approvalLines.length ? approvalLines : ["- Review the current estimate in the customer portal."]),
        "",
        portalLink ? `Open customer portal: ${portalLink}` : "Open customer portal from the SMS approval link system.",
        approvalRecord ? `Approval record: ${approvalRecord.approvalNumber} | ${approvalRecord.items.length} item(s)` : "Approval record: Not yet generated",
        "",
        "Reply if you want us to explain any item before you decide.",
      ].join("\n"),
    },
    {
      key: "waiting-parts",
      title: "Waiting Parts Update",
      subtitle: "Send when work is blocked by parts availability",
      body: [
        `Hi ${customerName},`,
        "",
        `Your repair order ${ro.roNumber} for ${vehicleLabel} is currently waiting for parts before work can continue.`,
        "",
        "Current parts update:",
        ...(partsLines.length ? partsLines : ["- No active parts request is currently linked to this RO."]),
        "",
        `RO status: ${ro.status}`,
        "We will update you again once the needed parts arrive and the job can resume.",
      ].join("\n"),
    },
    {
      key: "ready-release",
      title: "Ready for Release",
      subtitle: "Send when the vehicle is cleared for handover",
      body: [
        `Hi ${customerName},`,
        "",
        `Your vehicle ${vehicleLabel} (${plateLabel}) under RO ${ro.roNumber} is ready for release.`,
        "",
        ...releaseChecklist,
        "",
        releaseRecord?.releaseSummary || "Release checklist is complete and the vehicle is ready for pickup.",
        "",
        "Please visit the workshop for handover and final release.",
      ].join("\n"),
    },
    {
      key: "pull-out-notice",
      title: "Pull-Out or Stopped Work Notice",
      subtitle: "Send when a job is stopped or pulled out",
      body: [
        `Hi ${customerName},`,
        "",
        `Work on RO ${ro.roNumber} for ${vehicleLabel} has been stopped.`,
        "",
        `Reason: ${pullOutReason}`,
        `Current status: ${ro.status}`,
        backjobLine,
        "",
        "Please contact your service advisor if you want to review the next steps or resume the job later.",
      ].join("\n"),
    },
    {
      key: "oil-reminder",
      title: "Oil Change Reminder",
      subtitle: "Send when the next oil change is due or due soon",
      body: oilReminder
        ? buildOilChangeReminderMessage(oilReminder)
        : [
            `Hi ${customerName},`,
            "",
            `This is a friendly oil change reminder for ${vehicleLabel} (${plateLabel}).`,
            "",
            "We review the latest oil change record and trigger reminders based on the service date and odometer interval.",
            "",
            `Book your next visit here: ${bookingLink}`,
            "DVI Workshop | Please contact your service advisor for assistance.",
          ].join("\n"),
    },
    {
      key: "follow-up",
      title: "Follow-up (3 days after release)",
      subtitle: "Send three days after the vehicle is marked as Released",
      body: followUpReminder && followUpReminder.isDue
        ? buildReleaseFollowUpMessage(followUpReminder)
        : [
            `Hi ${customerName},`,
            "",
            "A post-release follow-up becomes available 3 days after the vehicle is marked as Released.",
            "",
            `RO: ${ro.roNumber}`,
            `Vehicle: ${vehicleLabel} (${plateLabel})`,
            `Release: ${releaseRecord?.releaseNumber || "-"}`,
            "",
            "Once the follow-up is due, you can copy the ready-to-send message from this panel.",
          ].join("\n"),
    },
  ];
}

function hasInspectionCriticalState(record: InspectionRecord) {
  return [
    record.underHoodState,
    record.engineOilLevel,
    record.engineOilCondition,
    record.engineOilLeaks,
    record.coolantLevel,
    record.coolantCondition,
    record.radiatorHoseCondition,
    record.coolingLeaks,
    record.brakeFluidLevel,
    record.brakeFluidCondition,
    record.powerSteeringLevel,
    record.powerSteeringCondition,
    record.batteryCondition,
    record.batteryTerminalCondition,
    record.batteryHoldDownCondition,
    record.driveBeltCondition,
    record.airFilterCondition,
    record.intakeHoseCondition,
    record.engineMountCondition,
    record.wiringCondition,
    record.unusualSmellState,
    record.unusualSoundState,
    record.visibleEngineLeakState,
    record.frontShockState,
    record.frontBallJointState,
    record.frontTieRodEndState,
    record.frontRackEndState,
    record.frontStabilizerLinkState,
    record.frontControlArmBushingState,
    record.frontCvBootState,
    record.frontWheelBearingState,
    record.rearShockState,
    record.rearStabilizerLinkState,
    record.rearBushingState,
    record.rearSpringState,
    record.rearWheelBearingState,
    (record as any).coolingFanOperationState ?? "Not Checked",
    (record as any).radiatorConditionState ?? "Not Checked",
    (record as any).waterPumpConditionState ?? "Not Checked",
    (record as any).thermostatConditionState ?? "Not Checked",
    (record as any).overflowReservoirConditionState ?? "Not Checked",
    (record as any).coolingSystemPressureState ?? "Not Checked",
    (record as any).steeringWheelPlayState ?? "Not Checked",
    (record as any).steeringPumpMotorState ?? "Not Checked",
    (record as any).steeringFluidConditionState ?? "Not Checked",
    (record as any).steeringHoseConditionState ?? "Not Checked",
    (record as any).steeringColumnConditionState ?? "Not Checked",
    (record as any).steeringRoadFeelState ?? "Not Checked",
    (record as any).engineStartingState ?? "Not Checked",
    (record as any).idleQualityState ?? "Not Checked",
    (record as any).accelerationResponseState ?? "Not Checked",
    (record as any).engineMisfireState ?? "Not Checked",
    (record as any).engineSmokeState ?? "Not Checked",
    (record as any).fuelEfficiencyConcernState ?? "Not Checked",
    (record as any).roadTestNoiseState ?? "Not Checked",
    (record as any).roadTestBrakeFeelState ?? "Not Checked",
    (record as any).roadTestSteeringTrackingState ?? "Not Checked",
    (record as any).roadTestRideQualityState ?? "Not Checked",
    (record as any).roadTestAccelerationState ?? "Not Checked",
    (record as any).roadTestTransmissionShiftState ?? "Not Checked",
    record.acCoolingPerformanceState,
    record.acCompressorState,
    record.acCondenserFanState,
    record.acCabinFilterState,
    record.acAirflowState,
    record.acOdorState,
    record.arrivalLights,
    record.arrivalBrokenGlass,
    record.arrivalWipers,
    record.arrivalHorn,
    record.frontLeftTireState,
    record.frontRightTireState,
    record.rearLeftTireState,
    record.rearRightTireState,
    record.frontBrakeState,
    record.rearBrakeState,
    record.electricalStarterState,
    record.electricalAlternatorState,
    record.electricalFuseRelayState,
    record.electricalWiringState,
    record.electricalWarningLightState,
    (record as any).transmissionFluidState ?? "Not Checked",
    (record as any).transmissionFluidConditionState ?? "Not Checked",
    (record as any).transmissionLeakState ?? "Not Checked",
    (record as any).shiftingPerformanceState ?? "Not Checked",
    (record as any).clutchOperationState ?? "Not Checked",
    (record as any).drivetrainVibrationState ?? "Not Checked",
    (record as any).cvJointDriveAxleState ?? "Not Checked",
    (record as any).transmissionMountState ?? "Not Checked",
  ].some((value) => value === "Needs Attention" || value === "Needs Replacement");
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

function buildDefaultCustomerDescription(line: Pick<RepairOrderWorkLine, "title" | "category" | "notes">) {
  const title = line.title.trim() || "Recommended work";
  const category = line.category.trim() || "General";
  const notes = line.notes.trim();
  return notes
    ? `${category}: ${title}. ${notes}`
    : `${category}: ${title}.`;
}

function getWorkLinePricing(line: RepairOrderWorkLine) {
  const laborHours = parseMoneyInput(line.laborHours);
  const laborRate = parseMoneyInput(line.laborRate);
  const partsCost = parseMoneyInput(line.partsCost);
  const markupPercent = parseMoneyInput(line.partsMarkupPercent);
  const laborFromInputs = laborHours > 0 && laborRate > 0 ? laborHours * laborRate : parseMoneyInput(line.serviceEstimate);
  const partsFromInputs = partsCost > 0 ? partsCost * (1 + markupPercent / 100) : parseMoneyInput(line.partsEstimate);
  return {
    laborAmount: laborFromInputs,
    partsAmount: partsFromInputs,
    totalAmount: laborFromInputs + partsFromInputs,
  };
}

function buildApprovalCategorySummary(lines: RepairOrderWorkLine[]) {
  const grouped = new Map<string, { count: number; total: number }>();
  lines.forEach((line) => {
    const key = line.category.trim() || "General";
    const current = grouped.get(key) ?? { count: 0, total: 0 };
    grouped.set(key, {
      count: current.count + 1,
      total: current.total + parseMoneyInput(line.totalEstimate),
    });
  });
  return Array.from(grouped.entries())
    .map(([category, value]) => ({ category, ...value }))
    .sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));
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
    enableCoolingCheck: (record as any).enableCoolingCheck ?? false,
    coolingFanOperationState: (record as any).coolingFanOperationState ?? "Not Checked",
    radiatorConditionState: (record as any).radiatorConditionState ?? "Not Checked",
    waterPumpConditionState: (record as any).waterPumpConditionState ?? "Not Checked",
    thermostatConditionState: (record as any).thermostatConditionState ?? "Not Checked",
    overflowReservoirConditionState: (record as any).overflowReservoirConditionState ?? "Not Checked",
    coolingSystemPressureState: (record as any).coolingSystemPressureState ?? "Not Checked",
    coolingSystemNotes: (record as any).coolingSystemNotes ?? "",
    coolingAdditionalFindings: normalizeAdditionalFindings((record as any).coolingAdditionalFindings),
    enableSteeringCheck: (record as any).enableSteeringCheck ?? false,
    steeringWheelPlayState: (record as any).steeringWheelPlayState ?? "Not Checked",
    steeringPumpMotorState: (record as any).steeringPumpMotorState ?? "Not Checked",
    steeringFluidConditionState: (record as any).steeringFluidConditionState ?? "Not Checked",
    steeringHoseConditionState: (record as any).steeringHoseConditionState ?? "Not Checked",
    steeringColumnConditionState: (record as any).steeringColumnConditionState ?? "Not Checked",
    steeringRoadFeelState: (record as any).steeringRoadFeelState ?? "Not Checked",
    steeringSystemNotes: (record as any).steeringSystemNotes ?? "",
    steeringAdditionalFindings: normalizeAdditionalFindings((record as any).steeringAdditionalFindings),
    enableEnginePerformanceCheck: (record as any).enableEnginePerformanceCheck ?? false,
    engineStartingState: (record as any).engineStartingState ?? "Not Checked",
    idleQualityState: (record as any).idleQualityState ?? "Not Checked",
    accelerationResponseState: (record as any).accelerationResponseState ?? "Not Checked",
    engineMisfireState: (record as any).engineMisfireState ?? "Not Checked",
    engineSmokeState: (record as any).engineSmokeState ?? "Not Checked",
    fuelEfficiencyConcernState: (record as any).fuelEfficiencyConcernState ?? "Not Checked",
    enginePerformanceNotes: (record as any).enginePerformanceNotes ?? "",
    enginePerformanceAdditionalFindings: normalizeAdditionalFindings((record as any).enginePerformanceAdditionalFindings),
    enableRoadTestCheck: (record as any).enableRoadTestCheck ?? false,
    roadTestNoiseState: (record as any).roadTestNoiseState ?? "Not Checked",
    roadTestBrakeFeelState: (record as any).roadTestBrakeFeelState ?? "Not Checked",
    roadTestSteeringTrackingState: (record as any).roadTestSteeringTrackingState ?? "Not Checked",
    roadTestRideQualityState: (record as any).roadTestRideQualityState ?? "Not Checked",
    roadTestAccelerationState: (record as any).roadTestAccelerationState ?? "Not Checked",
    roadTestTransmissionShiftState: (record as any).roadTestTransmissionShiftState ?? "Not Checked",
    roadTestNotes: (record as any).roadTestNotes ?? "",
    roadTestAdditionalFindings: normalizeAdditionalFindings((record as any).roadTestAdditionalFindings),
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
      customerDescription: (line as any).customerDescription ?? "",
      laborHours: (line as any).laborHours ?? "",
      laborRate: (line as any).laborRate ?? "",
      partsCost: (line as any).partsCost ?? "",
      partsMarkupPercent: (line as any).partsMarkupPercent ?? "",
      estimateUploadName: (line as any).estimateUploadName ?? "",
      recommendationSource: (line as any).recommendationSource ?? "",
      approvalDecision: (line as any).approvalDecision ?? "Pending",
      approvalAt: (line as any).approvalAt ?? "",
      totalEstimate: recalculateWorkLine({
        ...line,
        customerDescription: (line as any).customerDescription ?? "",
        laborHours: (line as any).laborHours ?? "",
        laborRate: (line as any).laborRate ?? "",
        partsCost: (line as any).partsCost ?? "",
        partsMarkupPercent: (line as any).partsMarkupPercent ?? "",
        estimateUploadName: (line as any).estimateUploadName ?? "",
        recommendationSource: (line as any).recommendationSource ?? "",
        approvalDecision: (line as any).approvalDecision ?? "Pending",
        approvalAt: (line as any).approvalAt ?? "",
      }).totalEstimate,
    })),
    latestApprovalRecordId: (record as any).latestApprovalRecordId ?? "",
    deferredLineTitles: (record as any).deferredLineTitles ?? [],
    backjobReferenceRoId: (record as any).backjobReferenceRoId ?? "",
    findingRecommendationDecisions: Array.isArray((record as any).findingRecommendationDecisions)
      ? (record as any).findingRecommendationDecisions.map((item: any, index: number) => ({
          recommendationId: String(item?.recommendationId ?? `finding_rec_${index}`),
          title: String(item?.title ?? ""),
          category: String(item?.category ?? "General"),
          decision: item?.decision === "Approved" ? "Approved" : "Declined",
          decidedAt: String(item?.decidedAt ?? ""),
          note: String(item?.note ?? ""),
        }))
      : [],
  };
}

function migratePartsRequestRecord(record: PartsRequestRecord): PartsRequestRecord {
  return {
    ...record,
    status: normalizeLegacyPartsStatus(record.status),
    workshopPhotos: Array.isArray((record as any).workshopPhotos)
      ? (record as any).workshopPhotos.map((item: any) => ({
          id: String(item?.id ?? uid("pmedia")),
          owner: (item?.owner === "Supplier" || item?.owner === "Return") ? item.owner : "Workshop",
          kind: String(item?.kind ?? "Reference"),
          fileName: String(item?.fileName ?? "image.jpg"),
          previewDataUrl: String(item?.previewDataUrl ?? ""),
          addedAt: String(item?.addedAt ?? new Date().toISOString()),
          note: String(item?.note ?? ""),
          uploadedBy: String(item?.uploadedBy ?? record.requestedBy ?? "Workshop"),
        }))
      : [],
    bids: Array.isArray(record.bids)
      ? record.bids.map((bid: any) => ({
          ...bid,
          productPhotos: Array.isArray(bid?.productPhotos)
            ? bid.productPhotos.map((item: any) => ({
                id: String(item?.id ?? uid("pmedia")),
                owner: "Supplier" as PartsMediaOwner,
                kind: String(item?.kind ?? "Supplier Item"),
                fileName: String(item?.fileName ?? "image.jpg"),
                previewDataUrl: String(item?.previewDataUrl ?? ""),
                addedAt: String(item?.addedAt ?? bid?.createdAt ?? new Date().toISOString()),
                note: String(item?.note ?? ""),
                uploadedBy: String(item?.uploadedBy ?? bid?.supplierName ?? "Supplier"),
              }))
            : [],
          invoiceFileName: String(bid?.invoiceFileName ?? ""),
          shippingLabelFileName: String(bid?.shippingLabelFileName ?? ""),
          trackingNumber: String(bid?.trackingNumber ?? ""),
          courierName: String(bid?.courierName ?? ""),
          shippingNotes: String(bid?.shippingNotes ?? ""),
        }))
      : [],
    returnRecords: Array.isArray((record as any).returnRecords)
      ? (record as any).returnRecords.map((entry: any) => ({
          id: String(entry?.id ?? uid("pret")),
          reason: String(entry?.reason ?? ""),
          notes: String(entry?.notes ?? ""),
          pictures: Array.isArray(entry?.pictures) ? entry.pictures.map((item: any) => ({
            id: String(item?.id ?? uid("pmedia")),
            owner: "Return" as PartsMediaOwner,
            kind: String(item?.kind ?? "Return"),
            fileName: String(item?.fileName ?? "image.jpg"),
            previewDataUrl: String(item?.previewDataUrl ?? ""),
            addedAt: String(item?.addedAt ?? entry?.createdAt ?? new Date().toISOString()),
            note: String(item?.note ?? ""),
            uploadedBy: String(item?.uploadedBy ?? entry?.createdBy ?? "Workshop"),
          })) : [],
          createdAt: String(entry?.createdAt ?? new Date().toISOString()),
          createdBy: String(entry?.createdBy ?? record.requestedBy ?? "Workshop"),
          responseStatus: entry?.responseStatus === "Approved" || entry?.responseStatus === "Rejected" || entry?.responseStatus === "Replacement in Process" || entry?.responseStatus === "Refund in Process" ? entry.responseStatus : "Requested",
          responseNotes: String(entry?.responseNotes ?? ""),
          responsePictures: Array.isArray(entry?.responsePictures) ? entry.responsePictures.map((item: any) => ({
            id: String(item?.id ?? uid("pmedia")),
            owner: "Return" as PartsMediaOwner,
            kind: String(item?.kind ?? "Supplier Return Response"),
            fileName: String(item?.fileName ?? "image.jpg"),
            previewDataUrl: String(item?.previewDataUrl ?? ""),
            addedAt: String(item?.addedAt ?? entry?.respondedAt ?? new Date().toISOString()),
            note: String(item?.note ?? ""),
            uploadedBy: String(item?.uploadedBy ?? entry?.respondedBy ?? "Supplier"),
          })) : [],
          respondedAt: entry?.respondedAt ? String(entry.respondedAt) : undefined,
          respondedBy: entry?.respondedBy ? String(entry.respondedBy) : undefined,
        }))
      : [],
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


function migrateBackjobRecord(record: BackjobRecord): BackjobRecord {
  return {
    ...record,
    updatedAt: (record as any).updatedAt ?? record.createdAt ?? new Date().toISOString(),
    originalInvoiceNumber: (record as any).originalInvoiceNumber ?? "",
    comebackInvoiceNumber: (record as any).comebackInvoiceNumber ?? "",
    originalPrimaryTechnicianId: (record as any).originalPrimaryTechnicianId ?? "",
    comebackPrimaryTechnicianId: (record as any).comebackPrimaryTechnicianId ?? "",
    supportingTechnicianIds: Array.isArray((record as any).supportingTechnicianIds)
      ? (record as any).supportingTechnicianIds.map((item: any) => String(item))
      : [],
    findings: (record as any).findings ?? "",
    actionTaken: (record as any).actionTaken ?? "",
    status: (record as any).status ?? "Open",
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

function getUpcomingBookingDates(days = 14) {
  return Array.from({ length: days }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + index);
    return {
      value: date.toISOString().slice(0, 10),
      label: date.toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      weekday: date.toLocaleDateString(undefined, { weekday: "short" }),
    };
  });
}

function BookingCalendarPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const dates = useMemo(() => getUpcomingBookingDates(14), []);
  return (
    <div style={styles.formGroup}>
      <label style={styles.label}>Calendar</label>
      <div style={styles.calendarStrip}>
        {dates.map((item) => (
          <button
            key={item.value}
            type="button"
            style={{
              ...styles.calendarDateButton,
              ...(value === item.value ? styles.calendarDateButtonActive : {}),
            }}
            onClick={() => onChange(item.value)}
          >
            <span style={styles.calendarWeekday}>{item.weekday}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </div>
    </div>
  );
}

function LoginScreen({
  audience,
  setAudience,
  staffForm,
  setStaffForm,
  staffError,
  onStaffSubmit,
  customerForm,
  setCustomerForm,
  customerError,
  onCustomerSubmit,
  supplierForm,
  setSupplierForm,
  supplierError,
  onSupplierSubmit,
  publicBookingForm,
  setPublicBookingForm,
  publicBookingError,
  onPublicBookingSubmit,
  onQuickStaffLogin,
  onLoadDemoData,
  onOpenDemoCustomerPortal,
}: {
  audience: LoginAudience;
  setAudience: React.Dispatch<React.SetStateAction<LoginAudience>>;
  staffForm: LoginForm;
  setStaffForm: React.Dispatch<React.SetStateAction<LoginForm>>;
  staffError: string;
  onStaffSubmit: (e: React.FormEvent) => void;
  customerForm: CustomerLoginForm;
  setCustomerForm: React.Dispatch<React.SetStateAction<CustomerLoginForm>>;
  customerError: string;
  onCustomerSubmit: (e: React.FormEvent) => void;
  supplierForm: SupplierLoginForm;
  setSupplierForm: React.Dispatch<React.SetStateAction<SupplierLoginForm>>;
  supplierError: string;
  onSupplierSubmit: (e: React.FormEvent) => void;
  publicBookingForm: BookingForm;
  setPublicBookingForm: React.Dispatch<React.SetStateAction<BookingForm>>;
  publicBookingError: string;
  onPublicBookingSubmit: (e: React.FormEvent) => void;
  onQuickStaffLogin: (username: string) => void;
  onLoadDemoData: () => void;
  onOpenDemoCustomerPortal: () => void;
}) {
  const isStaff = audience === "staff";
  const isCustomer = audience === "customer";
  const isBooking = audience === "booking";

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

        <div style={styles.inlineActions}>
          <button
            type="button"
            style={{
              ...styles.secondaryButton,
              ...(isStaff ? styles.portalTabActive : {}),
            }}
            onClick={() => setAudience("staff")}
          >
            Staff Sign In
          </button>
          <button
            type="button"
            style={{
              ...styles.secondaryButton,
              ...(isCustomer ? styles.portalTabActive : {}),
            }}
            onClick={() => setAudience("customer")}
          >
            Customer Portal
          </button>
          <button
            type="button"
            style={{
              ...styles.secondaryButton,
              ...(isBooking ? styles.portalTabActive : {}),
            }}
            onClick={() => setAudience("booking")}
          >
            Book Service
          </button>
          <button
            type="button"
            style={{
              ...styles.secondaryButton,
              ...(!isStaff && !isCustomer && !isBooking ? styles.portalTabActive : {}),
            }}
            onClick={() => setAudience("supplier")}
          >
            Supplier Portal
          </button>
        </div>

        <div style={styles.buildNoteBox}>
          <div style={styles.buildNoteTitle}>
            {isStaff ? "Staff Access" : isCustomer ? "Customer Portal Access" : isBooking ? "Book Service" : "Supplier Portal Access"}
          </div>
          <div style={styles.buildNoteText}>
            {isStaff
              ? "Continue using your staff account to manage intake, inspections, repair orders, parts, QC, release, and reporting."
              : isCustomer
                ? "Customers can sign in using their phone number or email plus password to review jobs, track progress, approve work, and browse their vehicles."
                : isBooking
                  ? "Use this public-facing service request page as a landing page so anyone can request an appointment without signing in first."
                  : "Suppliers can enter their supplier name and submit bids into open parts requests without opening the staff dashboard."}
          </div>
        </div>

        {isStaff ? (
          <>
            <form onSubmit={onStaffSubmit} style={styles.loginForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Username</label>
                <input
                  style={styles.input}
                  value={staffForm.username}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, username: e.target.value }))}
                  autoComplete="username"
                  placeholder="Enter username"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={staffForm.password}
                  onChange={(e) => setStaffForm((prev) => ({ ...prev, password: e.target.value }))}
                  autoComplete="current-password"
                  placeholder="Enter password"
                />
              </div>

              {staffError ? <div style={styles.errorBox}>{staffError}</div> : null}

              <button type="submit" style={styles.primaryButton}>
                Sign In
              </button>
            </form>

            <div style={styles.updateNoteBox}><div style={styles.updateNoteTitle}>Latest Build Update</div><div style={styles.updateNoteText}>Phase 17K.1 refines the Inspection module with cleaner navigation, faster encoding cues, stronger edit visibility, and a clearer action layout while preserving the current full system branch.</div></div><div style={styles.demoBox}>
              <div style={styles.demoTitle}>Quick Demo Access</div>
              <div style={styles.inlineActions}>
                <button type="button" style={styles.smallButtonSuccess} onClick={onOpenDemoCustomerPortal}>Open Demo Customer Portal</button>
                <button type="button" style={styles.smallButton} onClick={onLoadDemoData}>Load Simulated Data</button>
                <button type="button" style={styles.smallButtonMuted} onClick={() => onQuickStaffLogin("admin")}>Admin</button>
                <button type="button" style={styles.smallButtonMuted} onClick={() => onQuickStaffLogin("advisor")}>Advisor</button>
                <button type="button" style={styles.smallButtonMuted} onClick={() => onQuickStaffLogin("chieftech")}>Chief Tech</button>
                <button type="button" style={styles.smallButtonMuted} onClick={() => onQuickStaffLogin("senior")}>Senior</button>
                <button type="button" style={styles.smallButtonMuted} onClick={() => onQuickStaffLogin("mechanic")}>Mechanic</button>
                <button type="button" style={styles.smallButtonMuted} onClick={() => onQuickStaffLogin("office")}>Office</button>
                <button type="button" style={styles.smallButtonMuted} onClick={() => onQuickStaffLogin("reception")}>Reception</button>
                <button type="button" style={styles.smallButtonMuted} onClick={() => onQuickStaffLogin("ojt")}>OJT</button>
              </div>
              <div style={styles.demoGrid}>
                <div>Admin instantly opens full access for testing.</div>
                <div>Load Simulated Data seeds intake, inspection, RO, approval, parts, invoice, payment, QC, release, and work-log records.</div>
                <div>Quick buttons still use your real in-app roles and permissions.</div>
              </div>
            </div>
          </>
        ) : isCustomer ? (
          <>
            <form onSubmit={onCustomerSubmit} style={styles.loginForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone or Email</label>
                <input
                  style={styles.input}
                  value={customerForm.identifier}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, identifier: e.target.value }))}
                  autoComplete="username"
                  placeholder="Enter phone number or email"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Password</label>
                <input
                  style={styles.input}
                  type="password"
                  value={customerForm.password}
                  onChange={(e) => setCustomerForm((prev) => ({ ...prev, password: e.target.value }))}
                  autoComplete="current-password"
                  placeholder="Enter portal password"
                />
              </div>

              {customerError ? <div style={styles.errorBox}>{customerError}</div> : null}

              <button type="submit" style={styles.primaryButton}>
                Open Portal
              </button>
            </form>

            <div style={styles.demoBox}>
              <div style={styles.demoTitle}>Portal Starter Note</div>
              <div style={styles.demoGrid}>
                <div>Customer accounts are generated from intake and repair-order records.</div>
                <div>Default portal password uses the last 4 digits of the customer phone number.</div>
                <div>Sample portal login: Miguel Santos  -  09171234567 / 4567</div>
                <div>Sample portal login: Andrea Lim  -  fleet@primemovers.example.com / 6543</div>
                <div>Customers can review active jobs, see approval items, track progress, and browse their vehicles.</div>
              </div>
            </div>
          </>
        ) : isBooking ? (
          <>
            <form onSubmit={onPublicBookingSubmit} style={styles.loginForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Customer Name</label>
                <input style={styles.input} value={publicBookingForm.customerName} onChange={(e) => setPublicBookingForm((prev) => ({ ...prev, customerName: e.target.value }))} placeholder="Enter full name" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Phone</label>
                <input style={styles.input} value={publicBookingForm.phone} onChange={(e) => setPublicBookingForm((prev) => ({ ...prev, phone: e.target.value }))} placeholder="Enter phone number" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Email</label>
                <input style={styles.input} value={publicBookingForm.email} onChange={(e) => setPublicBookingForm((prev) => ({ ...prev, email: e.target.value }))} placeholder="Enter email" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Plate Number</label>
                <input style={styles.input} value={publicBookingForm.plateNumber} onChange={(e) => setPublicBookingForm((prev) => ({ ...prev, plateNumber: e.target.value.toUpperCase() }))} placeholder="ABC-1234" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Make</label>
                <input style={styles.input} value={publicBookingForm.make} onChange={(e) => setPublicBookingForm((prev) => ({ ...prev, make: e.target.value }))} placeholder="Toyota" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Model</label>
                <input style={styles.input} value={publicBookingForm.model} onChange={(e) => setPublicBookingForm((prev) => ({ ...prev, model: e.target.value }))} placeholder="Fortuner" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Year</label>
                <input style={styles.input} value={publicBookingForm.year} onChange={(e) => setPublicBookingForm((prev) => ({ ...prev, year: e.target.value }))} placeholder="2021" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Preferred Date</label>
                <input type="date" style={styles.input} value={publicBookingForm.requestedDate} onChange={(e) => setPublicBookingForm((prev) => ({ ...prev, requestedDate: e.target.value }))} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Preferred Time</label>
                <input type="time" style={styles.input} value={publicBookingForm.requestedTime} onChange={(e) => setPublicBookingForm((prev) => ({ ...prev, requestedTime: e.target.value }))} />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Service Type</label>
                <select
                  style={styles.select}
                  value={publicBookingForm.serviceType}
                  onChange={(e) =>
                    setPublicBookingForm((prev) => {
                      const nextType = e.target.value as BookingServiceType;
                      return {
                        ...prev,
                        serviceType: nextType,
                        serviceDetail: getBookingServiceDetailOptions(nextType)[0],
                      };
                    })
                  }
                >
                  {BOOKING_SERVICE_OPTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Service Detail</label>
                <select
                  style={styles.select}
                  value={publicBookingForm.serviceDetail}
                  onChange={(e) => setPublicBookingForm((prev) => ({ ...prev, serviceDetail: e.target.value }))}
                >
                  {getBookingServiceDetailOptions(publicBookingForm.serviceType).map((detail) => (
                    <option key={detail} value={detail}>
                      {detail}
                    </option>
                  ))}
                </select>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Concern / Requested Service</label>
                <textarea style={styles.textarea} value={publicBookingForm.concern} onChange={(e) => setPublicBookingForm((prev) => ({ ...prev, concern: e.target.value }))} placeholder="Describe the service request" />
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>Notes</label>
                <textarea style={styles.textarea} value={publicBookingForm.notes} onChange={(e) => setPublicBookingForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Optional notes" />
              </div>
              {publicBookingError ? <div style={styles.errorBox}>{publicBookingError}</div> : null}
              <button type="submit" style={styles.primaryButton}>Submit Public Booking</button>
            </form>
            <div style={styles.demoBox}>
              <div style={styles.demoTitle}>Public Booking Landing Page</div>
              <div style={styles.demoGrid}>
                <div>This tab works without customer login and can be used as a public-facing landing page.</div>
                <div>Each submission creates a booking record inside the Bookings module for staff follow-up.</div>
                <div>The calendar strip helps customers pick an upcoming date faster on mobile.</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <form onSubmit={onSupplierSubmit} style={styles.loginForm}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Supplier Name</label>
                <input
                  style={styles.input}
                  value={supplierForm.supplierName}
                  onChange={(e) => setSupplierForm({ supplierName: e.target.value })}
                  placeholder="Enter supplier name"
                />
              </div>

              {supplierError ? <div style={styles.errorBox}>{supplierError}</div> : null}

              <button type="submit" style={styles.primaryButton}>
                Open Supplier Portal
              </button>
            </form>

            <div style={styles.demoBox}>
              <div style={styles.demoTitle}>Supplier Portal Note</div>
              <div style={styles.demoGrid}>
                <div>Open requests come from the same internal Parts module.</div>
                <div>Bids submitted here are added directly to the matching request record.</div>
                <div>Staff can still privately compare bids and choose the winning supplier internally.</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}


function CustomerPortalPage({
  customer,
  repairOrders,
  setRepairOrders,
  approvalLinkTokens,
  intakeRecords,
  inspectionRecords,
  qcRecords,
  releaseRecords,
  approvalRecords,
  backjobRecords,
  invoiceRecords,
  paymentRecords,
  bookings,
  setBookings,
  customerAccounts,
  setCustomerAccounts,
  setCustomerSession,
  onLogout,
  isCompactLayout,
  isDemoMode,
  portalLaunchView,
  sharedLinkRoId,
  sharedLinkMode,
}: {
  customer: CustomerAccount;
  repairOrders: RepairOrderRecord[];
  setRepairOrders: React.Dispatch<React.SetStateAction<RepairOrderRecord[]>>;
  approvalLinkTokens: ApprovalLinkToken[];
  intakeRecords: IntakeRecord[];
  inspectionRecords: InspectionRecord[];
  qcRecords: QCRecord[];
  releaseRecords: ReleaseRecord[];
  approvalRecords: ApprovalRecord[];
  backjobRecords: BackjobRecord[];
  invoiceRecords: InvoiceRecord[];
  paymentRecords: PaymentRecord[];
  bookings: BookingRecord[];
  setBookings: React.Dispatch<React.SetStateAction<BookingRecord[]>>;
  customerAccounts: CustomerAccount[];
  setCustomerAccounts: React.Dispatch<React.SetStateAction<CustomerAccount[]>>;
  setCustomerSession: React.Dispatch<React.SetStateAction<CustomerAccount | null>>;
  onLogout: () => void;
  isCompactLayout: boolean;
  isDemoMode: boolean;
  portalLaunchView?: CustomerPortalView;
  sharedLinkRoId?: string;
  sharedLinkMode?: boolean;
}) {
  const [portalView, setPortalView] = useState<CustomerPortalView>(portalLaunchView ?? "dashboard");
  const [selectedVehicleKey, setSelectedVehicleKey] = useState("");

  const customerLinkedPlateNumbers = Array.isArray(customer.linkedPlateNumbers) ? customer.linkedPlateNumbers : [];
  const customerLinkedRoIds = Array.isArray(customer.linkedRoIds) ? customer.linkedRoIds : [];
  const customerPhone = sanitizePhone(customer.phone || "");
  const customerEmail = (customer.email || "").trim().toLowerCase();

  const linkedRepairOrders = useMemo(() => {
    const linkedPlates = new Set(customerLinkedPlateNumbers);
    const linkedRoIds = new Set(customerLinkedRoIds);

    return repairOrders.filter((row) => {
      const rowPhone = sanitizePhone(row.phone || "");
      const rowEmail = (row.email || "").trim().toLowerCase();
      const rowPlate = row.plateNumber || row.conductionNumber || "";
      return (
        linkedRoIds.has(row.id) ||
        linkedPlates.has(rowPlate) ||
        (!!customerPhone && rowPhone === customerPhone) ||
        (!!customerEmail && rowEmail === customerEmail)
      );
    });
  }, [customerLinkedPlateNumbers, customerLinkedRoIds, repairOrders, customerPhone, customerEmail]);

  const linkedVehicleKeys = useMemo(() => {
    const keys = new Set<string>();
    customerLinkedPlateNumbers.forEach((plate) => {
      keys.add(normalizeVehicleKey(plate, ""));
    });

    intakeRecords.forEach((row) => {
      const rowPhone = sanitizePhone(row.phone || "");
      const rowEmail = (row.email || "").trim().toLowerCase();
      if (
        (!!customerPhone && rowPhone === customerPhone) ||
        (!!customerEmail && rowEmail === customerEmail)
      ) {
        keys.add(normalizeVehicleKey(row.plateNumber, row.conductionNumber));
      }
    });

    linkedRepairOrders.forEach((row) => {
      keys.add(normalizeVehicleKey(row.plateNumber, row.conductionNumber));
    });

    return keys;
  }, [customerLinkedPlateNumbers, intakeRecords, linkedRepairOrders, customerPhone, customerEmail]);

  const portalVehicleGroups = useMemo(() => {
    const groups = buildVehicleHistoryGroups({
      intakeRecords,
      inspectionRecords,
      repairOrders,
      qcRecords,
      releaseRecords,
      approvalRecords,
      backjobRecords,
      invoiceRecords,
      paymentRecords,
    });

    const filtered = groups.filter((group) => linkedVehicleKeys.has(group.vehicleKey));
    const existingKeys = new Set(filtered.map((group) => group.vehicleKey));
    Array.from(linkedVehicleKeys).forEach((key) => {
      if (existingKeys.has(key)) return;
      filtered.push({
        vehicleKey: key,
        plateNumber: customerLinkedPlateNumbers.find((item) => normalizeVehicleKey(item, "") === key) || "",
        conductionNumber: "",
        vehicleLabel: "Customer-added vehicle",
        latestOdometerKm: "",
        lastVisitAt: "",
        totalVisits: 0,
        activeJobCount: 0,
        rows: [],
      });
    });
    return filtered.sort((a, b) => (b.lastVisitAt || "").localeCompare(a.lastVisitAt || ""));
  }, [
    intakeRecords,
    inspectionRecords,
    repairOrders,
    qcRecords,
    releaseRecords,
    approvalRecords,
    backjobRecords,
    invoiceRecords,
    paymentRecords,
    linkedVehicleKeys,
  ]);

  const selectedVehicleGroup =
    portalVehicleGroups.find((group) => group.vehicleKey === selectedVehicleKey) ??
    portalVehicleGroups[0] ??
    null;

  useEffect(() => {
    if (!selectedVehicleGroup) return;
    if (selectedVehicleKey !== selectedVehicleGroup.vehicleKey) {
      setSelectedVehicleKey(selectedVehicleGroup.vehicleKey);
    }
  }, [selectedVehicleGroup, selectedVehicleKey]);

  useEffect(() => {
    if (portalLaunchView) {
      setPortalView(portalLaunchView);
    }
  }, [portalLaunchView]);

  const pendingApprovalCount = linkedRepairOrders.reduce(
    (sum, row) => sum + row.workLines.filter((line) => (line.approvalDecision ?? "Pending") === "Pending").length,
    0
  );

  const activeJobCount = linkedRepairOrders.filter((row) => !["Released", "Closed"].includes(row.status)).length;
  const releasedJobCount = linkedRepairOrders.filter((row) => ["Released", "Closed"].includes(row.status)).length;
  const portalInspectionRows = useMemo(() => {
    const seenInspectionIds = new Set<string>();
    const rows: Array<{ row: RepairOrderRecord; inspection: InspectionRecord }> = [];

    linkedRepairOrders.forEach((row) => {
      const inspection = inspectionRecords.find((r) => r.id === row.inspectionId || r.intakeId === row.intakeId) ?? null;
      if (!inspection || seenInspectionIds.has(inspection.id)) return;
      seenInspectionIds.add(inspection.id);
      rows.push({ row, inspection });
    });

    return rows;
  }, [inspectionRecords, linkedRepairOrders]);

  const approvalReviewRows = useMemo(
    () =>
      portalInspectionRows.map(({ row, inspection }) => ({
        row,
        inspection,
        sections: buildCustomerInspectionSections(inspection),
        mediaGroups: groupInspectionMediaBySection(inspection.evidenceItems ?? []),
      })),
    [portalInspectionRows]
  );

  const displayedApprovalReviewRows = useMemo(() => {
    if (!sharedLinkRoId) return approvalReviewRows;
    return [...approvalReviewRows].sort((a, b) => {
      if (a.row.id === sharedLinkRoId) return -1;
      if (b.row.id === sharedLinkRoId) return 1;
      return a.row.roNumber.localeCompare(b.row.roNumber);
    });
  }, [approvalReviewRows, sharedLinkRoId]);

  const activePortalLinks = approvalLinkTokens.filter((row) => row.customerId === customer.id && isApprovalLinkActive(row)).length;
  const [bookingForm, setBookingForm] = useState(() => getDefaultBookingForm(customer.fullName));
  const [bookingError, setBookingError] = useState("");
  const [portalVehicleForm, setPortalVehicleForm] = useState({
    plateNumber: "",
    conductionNumber: "",
    make: "",
    model: "",
    year: "",
  });
  const [portalVehicleError, setPortalVehicleError] = useState("");
  const customerBookings = useMemo(() => {
    return bookings
      .filter((row) => {
        const rowPhone = sanitizePhone(row.phone || "");
        const rowEmail = (row.email || "").trim().toLowerCase();
        const rowVehicleKey = normalizeVehicleKey(row.plateNumber, row.conductionNumber);
        return (
          row.linkedCustomerId === customer.id ||
          (!!customerPhone && rowPhone === customerPhone) ||
          (!!customerEmail && rowEmail === customerEmail) ||
          linkedVehicleKeys.has(rowVehicleKey)
        );
      })
      .sort((a, b) => (b.requestedDate + b.requestedTime).localeCompare(a.requestedDate + a.requestedTime));
  }, [bookings, customer.id, customerPhone, customerEmail, linkedVehicleKeys]);

  const submitPortalBooking = (e: React.FormEvent) => {
    e.preventDefault();
    const isNewVehicle = selectedVehicleKey === "__new__";
    const vehicleGroup = !isNewVehicle
      ? portalVehicleGroups.find((group) => group.vehicleKey === selectedVehicleKey) ?? portalVehicleGroups[0] ?? null
      : null;
    const concern = bookingForm.concern.trim();
    const plateNumber = isNewVehicle ? bookingForm.plateNumber.trim() : vehicleGroup?.plateNumber || "";
    const conductionNumber = isNewVehicle ? bookingForm.conductionNumber.trim() : vehicleGroup?.conductionNumber || "";
    const make = isNewVehicle ? bookingForm.make.trim() : (vehicleGroup?.vehicleLabel.split(" ")[0] || "");
    const model = isNewVehicle ? bookingForm.model.trim() : (vehicleGroup?.vehicleLabel.split(" ").slice(1).join(" ") || "");
    const year = isNewVehicle ? bookingForm.year.trim() : "";
    if (!vehicleGroup && !isNewVehicle) {
      setBookingError("No linked vehicle available for booking.");
      return;
    }
    if (isNewVehicle && !plateNumber && !conductionNumber) {
      setBookingError("Enter plate number or conduction number for the new vehicle.");
      return;
    }
    if (isNewVehicle && (!make || !model)) {
      setBookingError("Enter make and model for the new vehicle.");
      return;
    }
    if (!bookingForm.requestedDate || !bookingForm.requestedTime || !concern) {
      setBookingError("Preferred date, time, and service request are required.");
      return;
    }
    const newBooking: BookingRecord = {
      id: uid("book"),
      bookingNumber: nextDailyNumber("BKG"),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      requestedDate: bookingForm.requestedDate,
      requestedTime: bookingForm.requestedTime,
      customerName: customer.fullName,
      companyName: "",
      accountType: "Personal",
      phone: customer.phone,
      email: customer.email,
      plateNumber,
      conductionNumber,
      make,
      model,
      year,
      serviceType: bookingForm.serviceType,
      serviceDetail: bookingForm.serviceDetail,
      concern,
      notes: bookingForm.notes.trim(),
      status: "New",
      source: "Customer Portal",
      createdBy: customer.fullName,
      linkedCustomerId: customer.id,
    };
    setBookings((prev) => [newBooking, ...prev]);
    if (isNewVehicle) {
      const identifierValue = plateNumber || conductionNumber;
      const now = new Date().toISOString();
      const updateAccount = (account: CustomerAccount): CustomerAccount => ({
        ...account,
        linkedPlateNumbers: mergeUniqueStrings([...(account.linkedPlateNumbers || []), identifierValue]),
        updatedAt: now,
      });
      setCustomerAccounts((prev) => prev.map((account) => (account.id === customer.id ? updateAccount(account) : account)));
      setCustomerSession((prev) => (prev && prev.id === customer.id ? updateAccount(prev) : prev));
      setSelectedVehicleKey(normalizeVehicleKey(plateNumber, conductionNumber));
    }
    setBookingForm((prev) => ({ ...getDefaultBookingForm(customer.fullName), requestedDate: prev.requestedDate, requestedTime: prev.requestedTime }));
    setBookingError("");
    setPortalView("bookings");
  };

  const handleAddPortalVehicle = (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = portalVehicleForm.plateNumber.trim() || portalVehicleForm.conductionNumber.trim();
    if (!identifier) {
      setPortalVehicleError("Plate number or conduction number is required.");
      return;
    }
    if (!portalVehicleForm.make.trim() || !portalVehicleForm.model.trim()) {
      setPortalVehicleError("Make and model are required.");
      return;
    }
    const vehicleKey = normalizeVehicleKey(portalVehicleForm.plateNumber, portalVehicleForm.conductionNumber);
    const identifierValue = portalVehicleForm.plateNumber.trim() || portalVehicleForm.conductionNumber.trim();
    const now = new Date().toISOString();

    const updateAccount = (account: CustomerAccount): CustomerAccount => ({
      ...account,
      linkedPlateNumbers: mergeUniqueStrings([...(account.linkedPlateNumbers || []), identifierValue]),
      updatedAt: now,
    });

    setCustomerAccounts((prev) => prev.map((account) => (account.id === customer.id ? updateAccount(account) : account)));
    setCustomerSession((prev) => (prev && prev.id === customer.id ? updateAccount(prev) : prev));
    setPortalVehicleForm({
      plateNumber: "",
      conductionNumber: "",
      make: "",
      model: "",
      year: "",
    });
    setPortalVehicleError("");
    setSelectedVehicleKey(vehicleKey);
  };

  const setCustomerDecision = (roId: string, lineId: string, decision: ApprovalDecision) => {
    const now = new Date().toISOString();
    setRepairOrders((prev) =>
      prev.map((row) => {
        if (row.id !== roId) return row;
        const nextWorkLines = row.workLines.map((line) =>
          line.id === lineId ? { ...line, approvalDecision: decision, approvalAt: now } : line
        );
        const hasPending = nextWorkLines.some((line) => (line.approvalDecision ?? "Pending") === "Pending");
        const hasApproved = nextWorkLines.some((line) => line.approvalDecision === "Approved");
        const nextStatus =
          row.status === "Waiting Approval" || row.status === "Approved / Ready to Work"
            ? hasPending
              ? "Waiting Approval"
              : hasApproved
                ? "Approved / Ready to Work"
                : "Waiting Approval"
            : row.status;

        return {
          ...row,
          workLines: nextWorkLines,
          status: nextStatus,
          updatedAt: now,
        };
      })
    );
  };

  return (
    <>
      <style>{globalCss}</style>
      <div style={styles.appShell}>
        <div style={styles.mainArea}>
          <header style={styles.topBar}>
            <div style={styles.topBarLeft}>
              <div>
                <div style={styles.pageTitle}>Customer Portal</div>
                <div style={styles.pageSubtitle}>{BUILD_VERSION}</div>
              </div>
            </div>

            <div style={styles.topBarRight}>
              {isDemoMode ? <span style={styles.statusWarning}>Demo Mode</span> : null}
              {sharedLinkMode ? <span style={styles.statusInfo}>Customer View</span> : null}
              <span style={styles.statusInfo}>Pending approvals: {pendingApprovalCount}  |  Active links: {activePortalLinks}</span>
              <div style={styles.topBarName}>{customer.fullName}</div>
              <button type="button" onClick={onLogout} style={styles.logoutButtonCompact}>
                Sign Out
              </button>
            </div>
          </header>

          <main style={styles.mainContent}>
            <div style={styles.inlineActions}>
              <button
                type="button"
                style={{ ...styles.secondaryButton, ...(portalView === "dashboard" ? styles.portalTabActive : {}) }}
                onClick={() => setPortalView("dashboard")}
              >
                Dashboard
              </button>
              <button
                type="button"
                style={{ ...styles.secondaryButton, ...(portalView === "jobs" ? styles.portalTabActive : {}) }}
                onClick={() => setPortalView("jobs")}
              >
                Jobs
              </button>
              <button
                type="button"
                style={{ ...styles.secondaryButton, ...(portalView === "approvals" ? styles.portalTabActive : {}) }}
                onClick={() => setPortalView("approvals")}
              >
                Approvals
              </button>
              <button
                type="button"
                style={{ ...styles.secondaryButton, ...(portalView === "inspection" ? styles.portalTabActive : {}) }}
                onClick={() => setPortalView("inspection")}
              >
                Inspection Report
              </button>
              <button
                type="button"
                style={{ ...styles.secondaryButton, ...(portalView === "myVehicles" ? styles.portalTabActive : {}) }}
                onClick={() => setPortalView("myVehicles")}
              >
                My Vehicles
              </button>
              <button
                type="button"
                style={{ ...styles.secondaryButton, ...(portalView === "bookings" ? styles.portalTabActive : {}) }}
                onClick={() => setPortalView("bookings")}
              >
                Book Service
              </button>
            </div>

            <div style={styles.portalHeroCard}>
              <div style={styles.portalHeroTitle}>Welcome back, {customer.fullName}</div>
              <div style={styles.portalHeroText}>
                Review current repair orders, inspect approval items, and browse the full history of every linked vehicle from one customer portal.
              </div>
            </div>

            {portalView === "dashboard" ? (
              <div style={styles.grid}>
                <div style={{ ...styles.gridItem, gridColumn: isCompactLayout ? "span 12" : "span 3" }}>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>Active Jobs</div>
                    <div style={styles.statValue}>{activeJobCount}</div>
                    <div style={styles.statNote}>Jobs still being worked on or awaiting next action</div>
                  </div>
                </div>
                <div style={{ ...styles.gridItem, gridColumn: isCompactLayout ? "span 12" : "span 3" }}>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>Pending Approvals</div>
                    <div style={styles.statValue}>{pendingApprovalCount}</div>
                    <div style={styles.statNote}>Recommended items that still need your decision</div>
                  </div>
                </div>
                <div style={{ ...styles.gridItem, gridColumn: isCompactLayout ? "span 12" : "span 3" }}>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>Completed Jobs</div>
                    <div style={styles.statValue}>{releasedJobCount}</div>
                    <div style={styles.statNote}>Finished jobs already handed over or closed</div>
                  </div>
                </div>
                <div style={{ ...styles.gridItem, gridColumn: isCompactLayout ? "span 12" : "span 3" }}>
                  <div style={styles.statCard}>
                    <div style={styles.statLabel}>My Vehicles</div>
                    <div style={styles.statValue}>{portalVehicleGroups.length}</div>
                    <div style={styles.statNote}>Vehicles linked to this customer account</div>
                  </div>
                </div>

                <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
                  <Card title="Your Account" subtitle="Cleaner customer-facing view of linked vehicles, open jobs, approvals, and portal access">
                    <div style={styles.quickAccessList}>
                      <div style={styles.quickAccessRow}><span>Name</span><strong>{customer.fullName}</strong></div>
                      <div style={styles.quickAccessRow}><span>Phone</span><strong>{customer.phone || "-"}</strong></div>
                      <div style={styles.quickAccessRow}><span>Email</span><strong>{customer.email || "-"}</strong></div>
                      <div style={styles.quickAccessRow}><span>Vehicles</span><strong>{customerLinkedPlateNumbers.join(", ") || portalVehicleGroups.map((group) => group.plateNumber || group.conductionNumber).filter(Boolean).join(", ") || "-"}</strong></div>
                      <div style={styles.quickAccessRow}><span>Open Jobs</span><strong>{activeJobCount}</strong></div>
                      <div style={styles.quickAccessRow}><span>Pending Decisions</span><strong>{pendingApprovalCount}</strong></div>
                      <div style={styles.quickAccessRow}><span>SMS Approval Links</span><strong>{activePortalLinks}</strong></div>
                    </div>
                  </Card>
                </div>
              </div>
            ) : portalView === "jobs" ? (
              <div style={styles.mobileCardList}>
                {linkedRepairOrders.length === 0 ? (
                  <div style={styles.emptyState}>No repair orders linked to this portal account yet.</div>
                ) : (
                  linkedRepairOrders.map((row) => (
                    <div key={row.id} style={styles.mobileDataCard}>
                      <div style={styles.mobileDataCardHeader}>
                        <strong>{row.roNumber}</strong>
                        <ROStatusBadge status={row.status} />
                      </div>
                      <div style={styles.mobileDataPrimary}>{row.plateNumber || row.conductionNumber || "-"}</div>
                      <div style={styles.mobileDataSecondary}>{[row.make, row.model, row.year].filter(Boolean).join(" ") || "-"}</div>
                      <div style={styles.mobileDataSecondary}>Advisor: {row.advisorName || "-"}</div>
                      <div style={styles.mobileMetaRow}>
                        <span>Approval Snapshot</span>
                        <strong>{row.workLines.filter((line) => line.approvalDecision === "Approved").length} approved  |  {row.workLines.filter((line) => (line.approvalDecision ?? "Pending") === "Pending").length} pending</strong>
                      </div>
                      <div style={styles.mobileMetaRow}>
                        <span>Concern</span>
                        <strong>{row.customerConcern || "-"}</strong>
                      </div>
                      <div style={styles.quickAccessList}>
                        {row.workLines.map((line) => (
                          <div key={line.id} style={styles.quickAccessRow}>
                            <span>{line.customerDescription || line.title || "Work Item"}</span>
                            <strong>{formatCurrency(parseMoneyInput(line.totalEstimate))}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : portalView === "inspection" ? (
              <div style={styles.mobileCardList}>
                <div style={{ ...styles.sectionCardMuted, marginBottom: 8 }}>
                  <div style={styles.sectionTitle}>Condition Legend</div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginTop: 6 }}>
                    <span style={{ background: "#dcfce7", color: "#15803d", borderRadius: 4, padding: "2px 10px", fontWeight: 600, fontSize: 12 }}>Good</span>
                    <span style={{ background: "#fef3c7", color: "#b45309", borderRadius: 4, padding: "2px 10px", fontWeight: 600, fontSize: 12 }}>Needs Attention</span>
                    <span style={{ background: "#fee2e2", color: "#b91c1c", borderRadius: 4, padding: "2px 10px", fontWeight: 600, fontSize: 12 }}>Critical</span>
                  </div>
                </div>
                {portalInspectionRows.length === 0 ? (
                  <div style={styles.emptyState}>No inspection records available.</div>
                ) : (
                  portalInspectionRows.map(({ row, inspection }) => {
                    const sections = buildCustomerInspectionSections(inspection);
                    const totals = sections.flatMap((section) => section.findings).reduce(
                      (acc, finding) => {
                        acc[finding.status] += 1;
                        return acc;
                      },
                      { Good: 0, "Needs Attention": 0, Critical: 0 } as Record<CustomerInspectionStatus, number>
                    );
                    const mediaGroups = groupInspectionMediaBySection(inspection.evidenceItems ?? []);
                    const mediaCount = mediaGroups.reduce((sum, group) => sum + group.media.length, 0);

                    return (
                      <div key={inspection.id} style={{ ...styles.mobileDataCard, padding: 0, overflow: "hidden" }}>
                        <div style={{ background: "#1e293b", padding: "12px 14px" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" as const, gap: 6 }}>
                            <strong style={{ color: "#f8fafc", fontSize: 15 }}>{inspection.inspectionNumber}</strong>
                            <span style={getInspectionStatusStyle(inspection.status)}>{inspection.status}</span>
                          </div>
                          <div style={{ color: "#94a3b8", fontSize: 13, marginTop: 2 }}>{row.roNumber}  |  {inspection.accountLabel}</div>
                          <div style={{ color: "#64748b", fontSize: 12 }}>{inspection.plateNumber || inspection.conductionNumber || "-"}  |  {[inspection.make, inspection.model, inspection.year].filter(Boolean).join(" ") || "-"}</div>
                          <div style={{ color: "#94a3b8", fontSize: 12 }}>Created {formatDateTime(inspection.createdAt)}  |  Updated {formatDateTime(inspection.updatedAt)}</div>
                        </div>

                        <div style={{ padding: "12px 14px" }}>
                          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 12 }}>
                            <div style={{ background: "#dcfce7", borderRadius: 6, padding: "8px 10px", textAlign: "center" as const }}>
                              <div style={{ fontSize: 20, fontWeight: 700, color: "#15803d" }}>{totals.Good}</div>
                              <div style={{ fontSize: 11, color: "#15803d" }}>Good</div>
                            </div>
                            <div style={{ background: "#fef3c7", borderRadius: 6, padding: "8px 10px", textAlign: "center" as const }}>
                              <div style={{ fontSize: 20, fontWeight: 700, color: "#b45309" }}>{totals["Needs Attention"]}</div>
                              <div style={{ fontSize: 11, color: "#b45309" }}>Needs Attention</div>
                            </div>
                            <div style={{ background: "#fee2e2", borderRadius: 6, padding: "8px 10px", textAlign: "center" as const }}>
                              <div style={{ fontSize: 20, fontWeight: 700, color: "#b91c1c" }}>{totals.Critical}</div>
                              <div style={{ fontSize: 11, color: "#b91c1c" }}>Critical</div>
                            </div>
                            <div style={{ background: "#e2e8f0", borderRadius: 6, padding: "8px 10px", textAlign: "center" as const }}>
                              <div style={{ fontSize: 20, fontWeight: 700, color: "#334155" }}>{mediaCount}</div>
                              <div style={{ fontSize: 11, color: "#334155" }}>Media</div>
                            </div>
                          </div>

                          {sections.length === 0 ? (
                            <div style={styles.emptyState}>No inspection findings recorded.</div>
                          ) : (
                            sections.map((section) => (
                              <div key={section.label} style={{ marginBottom: 14 }}>
                                <div style={{ fontWeight: 600, fontSize: 13, color: "#334155", borderBottom: "1px solid #e2e8f0", paddingBottom: 4, marginBottom: 8 }}>
                                  {section.label} <span style={{ fontWeight: 400, color: "#94a3b8", fontSize: 12 }}>({section.findings.length})</span>
                                </div>
                                {section.note ? <div style={styles.concernCard}>{section.note}</div> : null}
                                <div style={styles.formStack}>
                                  {section.findings.map((finding, findingIndex) => (
                                    <div key={`${section.label}_${finding.title}_${findingIndex}`} style={styles.sectionCardMuted}>
                                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" as const }}>
                                        <strong style={{ fontSize: 14 }}>{finding.title}</strong>
                                        <span style={getCustomerInspectionStatusStyle(finding.status)}>{finding.status}</span>
                                      </div>
                                      {finding.note ? <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{finding.note}</div> : null}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))
                          )}

                          {mediaGroups.length > 0 ? (
                            <div style={{ marginTop: 12 }}>
                              <div style={{ fontWeight: 600, fontSize: 13, color: "#334155", borderBottom: "1px solid #e2e8f0", paddingBottom: 4, marginBottom: 8 }}>
                                Photos / Videos ({mediaCount})
                              </div>
                              <div style={styles.formStack}>
                                {mediaGroups.map(({ section, media }) => (
                                  <div key={section}>
                                    <div style={{ fontWeight: 600, fontSize: 13, color: "#334155", marginBottom: 6 }}>
                                      {section} ({media.length})
                                    </div>
                                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
                                      {media.map((item) => (
                                        <div key={item.id} style={{ borderRadius: 6, overflow: "hidden", border: "1px solid #e2e8f0", background: "#fff" }}>
                                          {item.previewDataUrl && item.type === "Photo" ? (
                                            <img src={item.previewDataUrl} alt={item.itemLabel || item.section || "Inspection photo"} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" as const, display: "block" }} />
                                          ) : item.previewDataUrl && item.type === "Video" ? (
                                            <video src={item.previewDataUrl} controls style={{ width: "100%", aspectRatio: "1", objectFit: "cover" as const, display: "block", background: "#0f172a" }} />
                                          ) : (
                                            <div style={{ minHeight: 92, padding: "10px 8px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, background: "#f8fafc" }}>
                                              <strong style={{ fontSize: 12, color: "#0f172a" }}>{item.type}</strong>
                                              <span style={{ fontSize: 11, color: "#64748b" }}>{item.fileName}</span>
                                            </div>
                                          )}
                                          <div style={{ padding: "4px 6px", fontSize: 10, color: "#64748b", background: "#f8fafc" }}>
                                            {item.itemLabel || item.section || item.fileName}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>            ) : portalView === "bookings" ? (
              <div style={styles.grid}>
                <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }}>
                  <Card title="My Booking Requests" subtitle="Track customer-submitted service requests and appointment status">
                    {customerBookings.length === 0 ? (
                      <div style={styles.emptyState}>No booking requests yet.</div>
                    ) : (
                      <div style={styles.mobileCardList}>
                        {customerBookings.map((row) => (
                          <div key={row.id} style={styles.mobileDataCard}>
                            <div style={styles.mobileDataCardHeader}>
                              <strong>{row.bookingNumber}</strong>
                              <span style={getBookingStatusStyle(row.status)}>{row.status}</span>
                            </div>
                            <div style={styles.mobileDataPrimary}>{row.plateNumber || row.conductionNumber || "-"}</div>
                            <div style={styles.mobileDataSecondary}>{row.serviceType}  |  {row.serviceDetail || "-"}  |  {row.requestedDate} {row.requestedTime}</div>
                            <div style={styles.formHint}>{row.concern || row.notes || "Booking request"}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>
                <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }}>
                  <Card title="Request New Appointment" subtitle="Choose one of your vehicles and send a booking request to the shop">
                    <form onSubmit={submitPortalBooking} style={styles.formStack}>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Vehicle</label>
                        <select style={styles.select} value={selectedVehicleKey} onChange={(e) => setSelectedVehicleKey(e.target.value)}>
                          {portalVehicleGroups.map((group) => (
                            <option key={group.vehicleKey} value={group.vehicleKey}>{group.plateNumber || group.conductionNumber || "No plate"}  |  {group.vehicleLabel}</option>
                          ))}
                          <option value="__new__">+ Add New Vehicle for This Booking</option>
                        </select>
                      </div>
                      {selectedVehicleKey === "__new__" ? (
                        <div style={styles.sectionCardMuted}>
                          <div style={styles.sectionTitle}>New Vehicle Details</div>
                          <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Plate Number</label>
                              <input style={styles.input} value={bookingForm.plateNumber} onChange={(e) => setBookingForm((prev) => ({ ...prev, plateNumber: e.target.value }))} placeholder="ABC-1234" />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Conduction Number</label>
                              <input style={styles.input} value={bookingForm.conductionNumber} onChange={(e) => setBookingForm((prev) => ({ ...prev, conductionNumber: e.target.value }))} placeholder="Use if no plate yet" />
                            </div>
                          </div>
                          <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Make</label>
                              <input style={styles.input} value={bookingForm.make} onChange={(e) => setBookingForm((prev) => ({ ...prev, make: e.target.value }))} placeholder="Toyota" />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Model</label>
                              <input style={styles.input} value={bookingForm.model} onChange={(e) => setBookingForm((prev) => ({ ...prev, model: e.target.value }))} placeholder="Fortuner" />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Year</label>
                              <input style={styles.input} value={bookingForm.year} onChange={(e) => setBookingForm((prev) => ({ ...prev, year: e.target.value }))} placeholder="2021" />
                            </div>
                          </div>
                        </div>
                      ) : null}
                      <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Preferred Date</label>
                          <input type="date" style={styles.input} value={bookingForm.requestedDate} onChange={(e) => setBookingForm((prev) => ({ ...prev, requestedDate: e.target.value }))} />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Preferred Time</label>
                          <input type="time" style={styles.input} value={bookingForm.requestedTime} onChange={(e) => setBookingForm((prev) => ({ ...prev, requestedTime: e.target.value }))} />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Service Type</label>
                          <select
                            style={styles.select}
                            value={bookingForm.serviceType}
                            onChange={(e) =>
                              setBookingForm((prev) => {
                                const nextType = e.target.value as BookingServiceType;
                                return {
                                  ...prev,
                                  serviceType: nextType,
                                  serviceDetail: getBookingServiceDetailOptions(nextType)[0],
                                };
                              })
                            }
                          >
                            {BOOKING_SERVICE_OPTIONS.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Service Detail</label>
                          <select
                            style={styles.select}
                            value={bookingForm.serviceDetail}
                            onChange={(e) => setBookingForm((prev) => ({ ...prev, serviceDetail: e.target.value }))}
                          >
                            {getBookingServiceDetailOptions(bookingForm.serviceType).map((detail) => (
                              <option key={detail} value={detail}>
                                {detail}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Concern / Request</label>
                        <textarea style={styles.textarea} value={bookingForm.concern} onChange={(e) => setBookingForm((prev) => ({ ...prev, concern: e.target.value }))} placeholder="Describe the service request" />
                      </div>
                      <div style={styles.formGroup}>
                        <label style={styles.label}>Notes</label>
                        <textarea style={styles.textarea} value={bookingForm.notes} onChange={(e) => setBookingForm((prev) => ({ ...prev, notes: e.target.value }))} placeholder="Optional notes" />
                      </div>
                      {bookingError ? <div style={styles.errorBox}>{bookingError}</div> : null}
                      <div style={styles.inlineActions}><button type="submit" style={styles.primaryButton}>Submit Booking Request</button></div>
                    </form>
                  </Card>
                </div>
              </div>
            ) : portalView === "approvals" ? (
              <div style={styles.mobileCardList}>
                <div style={styles.sectionCardMuted}>
                  <div style={styles.sectionTitle}>Customer Approval Review</div>
                  <div style={styles.formHint}>
                    Review the inspection findings by category, then approve, defer, or decline the linked recommendations for each repair order.
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const, marginTop: 10 }}>
                    <span style={{ background: "#dcfce7", color: "#15803d", borderRadius: 4, padding: "2px 10px", fontWeight: 600, fontSize: 12 }}>Good</span>
                    <span style={{ background: "#fef3c7", color: "#b45309", borderRadius: 4, padding: "2px 10px", fontWeight: 600, fontSize: 12 }}>Needs Attention</span>
                    <span style={{ background: "#fee2e2", color: "#b91c1c", borderRadius: 4, padding: "2px 10px", fontWeight: 600, fontSize: 12 }}>Critical</span>
                  </div>
                </div>

                {sharedLinkRoId ? (
                  <div style={{ ...styles.sectionCardMuted, marginBottom: 8 }}>
                    <div style={styles.sectionTitle}>Shared Approval Link</div>
                    <div style={styles.formHint}>
                      This is a simulated customer-facing approval link opened from the staff app for internal demo testing.
                    </div>
                    <div style={styles.quickAccessList}>
                      <div style={styles.quickAccessRow}>
                        <span>Mode</span>
                        <strong>Customer-facing demo link</strong>
                      </div>
                      <div style={styles.quickAccessRow}>
                        <span>Focus RO</span>
                        <strong>{sharedLinkRoId}</strong>
                      </div>
                    </div>
                  </div>
                ) : null}

                {displayedApprovalReviewRows.length === 0 ? (
                  <div style={styles.emptyState}>No inspection-linked recommendations available for approval review.</div>
                ) : (
                  displayedApprovalReviewRows.map(({ row, inspection, sections, mediaGroups }) => (
                    <div key={row.id} style={styles.mobileDataCard}>
                      <div style={styles.mobileDataCardHeader}>
                        <strong>{row.roNumber}</strong>
                        <ROStatusBadge status={row.status} />
                      </div>
                      <div style={styles.mobileDataPrimary}>{row.plateNumber || row.conductionNumber || "-"}</div>
                      <div style={styles.mobileDataSecondary}>{row.accountLabel}</div>
                      <div style={styles.mobileDataSecondary}>{[row.make, row.model, row.year].filter(Boolean).join(" ") || "-"}</div>
                      <div style={styles.mobileMetaRow}>
                        <span>Inspection</span>
                        <strong>{inspection.inspectionNumber}</strong>
                      </div>
                      <div style={styles.mobileMetaRow}>
                        <span>Pending decisions</span>
                        <strong>{row.workLines.filter((line) => (line.approvalDecision ?? "Pending") === "Pending").length}</strong>
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <div style={styles.sectionTitle}>Inspection Findings</div>
                        {sections.length === 0 ? (
                          <div style={styles.emptyState}>No inspection findings recorded.</div>
                        ) : (
                          <div style={styles.formStack}>
                            {sections.map((section) => {
                              const sectionMedia = mediaGroups.find((group) => group.section === section.label)?.media ?? [];
                              return (
                                <div key={section.label} style={styles.sectionCardMuted}>
                                  <div style={styles.mobileDataCardHeader}>
                                    <strong>{section.label}</strong>
                                    <span style={styles.statusInfo}>{section.findings.length} items</span>
                                  </div>
                                  {section.note ? <div style={styles.formHint}>{section.note}</div> : null}
                                  <div style={styles.formStack}>
                                    {section.findings.map((finding, findingIndex) => (
                                      <div key={`${section.label}_${finding.title}_${findingIndex}`} style={styles.sectionCardMuted}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" as const }}>
                                          <strong style={{ fontSize: 14 }}>{finding.title}</strong>
                                          <span style={getCustomerInspectionStatusStyle(finding.status)}>{finding.status}</span>
                                        </div>
                                        {finding.note ? <div style={{ fontSize: 13, color: "#475569", marginTop: 4 }}>{finding.note}</div> : null}
                                      </div>
                                    ))}
                                  </div>

                                  {sectionMedia.length > 0 ? (
                                    <div style={{ marginTop: 10 }}>
                                      <div style={{ fontWeight: 600, fontSize: 13, color: "#334155", marginBottom: 8 }}>
                                        Media ({sectionMedia.length})
                                      </div>
                                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(110px, 1fr))", gap: 8 }}>
                                        {sectionMedia.map((item) => (
                                          <div key={item.id} style={{ borderRadius: 6, overflow: "hidden", border: "1px solid #e2e8f0", background: "#fff" }}>
                                            {item.previewDataUrl && item.type === "Photo" ? (
                                              <img src={item.previewDataUrl} alt={item.itemLabel || item.section || "Inspection photo"} style={{ width: "100%", aspectRatio: "1", objectFit: "cover" as const, display: "block" }} />
                                            ) : item.previewDataUrl && item.type === "Video" ? (
                                              <video src={item.previewDataUrl} controls style={{ width: "100%", aspectRatio: "1", objectFit: "cover" as const, display: "block", background: "#0f172a" }} />
                                            ) : (
                                              <div style={{ minHeight: 92, padding: "10px 8px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, background: "#f8fafc" }}>
                                                <strong style={{ fontSize: 12, color: "#0f172a" }}>{item.type}</strong>
                                                <span style={{ fontSize: 11, color: "#64748b" }}>{item.fileName}</span>
                                              </div>
                                            )}
                                            <div style={{ padding: "4px 6px", fontSize: 10, color: "#64748b", background: "#f8fafc" }}>
                                              {item.itemLabel || item.section || item.fileName}
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      <div style={{ marginTop: 12 }}>
                        <div style={styles.sectionTitle}>Recommendations</div>
                        {row.workLines.length === 0 ? (
                          <div style={styles.emptyState}>No recommendations linked to this repair order.</div>
                        ) : (
                          <div style={styles.formStack}>
                            {row.workLines.map((line) => (
                              <div key={line.id} style={styles.sectionCardMuted}>
                                <div style={styles.mobileDataCardHeader}>
                                  <strong>{line.customerDescription || line.title || "Work Item"}</strong>
                                  <span style={getApprovalDecisionStyle(line.approvalDecision ?? "Pending")}>
                                    {line.approvalDecision ?? "Pending"}
                                  </span>
                                </div>
                                <div style={styles.mobileDataSecondary}>{line.category || "General"}  |  {line.priority} priority</div>
                                <div style={styles.formHint}>{line.notes || getCustomerFriendlyLineDescription(line)}</div>
                                <div style={styles.mobileMetaRow}>
                                  <span>Total</span>
                                  <strong>{formatCurrency(parseMoneyInput(line.totalEstimate))}</strong>
                                </div>
                                <div style={styles.inlineActions}>
                                  <button type="button" style={styles.smallButtonSuccess} onClick={() => setCustomerDecision(row.id, line.id, "Approved")}>
                                    Approve
                                  </button>
                                  <button type="button" style={styles.smallButtonMuted} onClick={() => setCustomerDecision(row.id, line.id, "Deferred")}>
                                    Defer
                                  </button>
                                  <button type="button" style={styles.smallButtonDanger} onClick={() => setCustomerDecision(row.id, line.id, "Declined")}>
                                    Decline
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            ) : portalView === "myVehicles" ? (
              <div style={styles.grid}>
                <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }}>
                  <Card title="My Vehicles" subtitle="Each vehicle is grouped separately with latest visit first">
                    <form onSubmit={handleAddPortalVehicle} style={styles.sectionCardMuted}>
                      <div style={styles.sectionTitle}>Add Vehicle</div>
                      <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Plate Number</label>
                          <input style={styles.input} value={portalVehicleForm.plateNumber} onChange={(e) => setPortalVehicleForm((prev) => ({ ...prev, plateNumber: e.target.value }))} placeholder="ABC-1234" />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Conduction Number</label>
                          <input style={styles.input} value={portalVehicleForm.conductionNumber} onChange={(e) => setPortalVehicleForm((prev) => ({ ...prev, conductionNumber: e.target.value }))} placeholder="Optional if no plate yet" />
                        </div>
                      </div>
                      <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Make</label>
                          <input style={styles.input} value={portalVehicleForm.make} onChange={(e) => setPortalVehicleForm((prev) => ({ ...prev, make: e.target.value }))} placeholder="Toyota" />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Model</label>
                          <input style={styles.input} value={portalVehicleForm.model} onChange={(e) => setPortalVehicleForm((prev) => ({ ...prev, model: e.target.value }))} placeholder="Fortuner" />
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Year</label>
                          <input style={styles.input} value={portalVehicleForm.year} onChange={(e) => setPortalVehicleForm((prev) => ({ ...prev, year: e.target.value }))} placeholder="2021" />
                        </div>
                      </div>
                      {portalVehicleError ? <div style={styles.errorBox}>{portalVehicleError}</div> : null}
                      <div style={styles.inlineActions}>
                        <button type="submit" style={styles.smallButton}>Add Vehicle</button>
                      </div>
                    </form>
                    {portalVehicleGroups.length === 0 ? (
                      <div style={styles.emptyState}>No vehicles are linked to this customer portal yet.</div>
                    ) : (
                      <div style={styles.mobileCardList}>
                        {portalVehicleGroups.map((group) => (
                          <button
                            key={group.vehicleKey}
                            type="button"
                            onClick={() => setSelectedVehicleKey(group.vehicleKey)}
                            style={{
                              ...styles.mobileDataCard,
                              ...(selectedVehicleKey === group.vehicleKey ? styles.selectedQueueCard : {}),
                              textAlign: "left",
                              cursor: "pointer",
                            }}
                          >
                            <div style={styles.mobileDataCardHeader}>
                              <strong>{group.plateNumber || group.conductionNumber || group.vehicleKey}</strong>
                              {group.activeJobCount > 0 ? <span style={styles.statusWarning}>{group.activeJobCount} Active</span> : <span style={styles.statusOk}>No Open Job</span>}
                            </div>
                            <div style={styles.mobileDataPrimary}>{group.vehicleLabel}</div>
                            <div style={styles.mobileDataSecondary}>Latest Odometer: {group.latestOdometerKm || "-"}</div>
                            <div style={styles.mobileDataSecondary}>Last Visit: {formatDateTime(group.lastVisitAt)}</div>
                            <div style={styles.mobileMetaRow}>
                              <span>Total Visits</span>
                              <strong>{group.totalVisits}</strong>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>

                <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(8, isCompactLayout) }}>
                  <Card
                    title={selectedVehicleGroup ? `Vehicle Timeline  -  ${selectedVehicleGroup.plateNumber || selectedVehicleGroup.conductionNumber || selectedVehicleGroup.vehicleKey}` : "Vehicle Timeline"}
                    subtitle="Newest transaction first with odometer and status shown"
                    right={selectedVehicleGroup ? <span style={styles.statusInfo}>{selectedVehicleGroup.vehicleLabel}</span> : undefined}
                  >
                    {!selectedVehicleGroup ? (
                      <div style={styles.emptyState}>Select a vehicle to review its history.</div>
                    ) : (
                      <div style={styles.formStack}>
                        <div style={styles.sectionCardMuted}>
                          <div style={styles.quickAccessList}>
                            <div style={styles.quickAccessRow}><span>Plate Number</span><strong>{selectedVehicleGroup.plateNumber || "-"}</strong></div>
                            <div style={styles.quickAccessRow}><span>Conduction Number</span><strong>{selectedVehicleGroup.conductionNumber || "-"}</strong></div>
                            <div style={styles.quickAccessRow}><span>Vehicle</span><strong>{selectedVehicleGroup.vehicleLabel}</strong></div>
                            <div style={styles.quickAccessRow}><span>Latest Odometer</span><strong>{selectedVehicleGroup.latestOdometerKm || "-"}</strong></div>
                            <div style={styles.quickAccessRow}><span>Last Visit</span><strong>{formatDateTime(selectedVehicleGroup.lastVisitAt)}</strong></div>
                            <div style={styles.quickAccessRow}><span>Total Visits</span><strong>{selectedVehicleGroup.totalVisits}</strong></div>
                          </div>
                        </div>

                        <div style={styles.mobileCardList}>
                          {selectedVehicleGroup.rows.map((row) => (
                            <div key={row.id} style={styles.mobileDataCard}>
                              <div style={styles.mobileDataCardHeader}>
                                <strong>{row.type}</strong>
                                <span style={styles.statusInfo}>{row.status || "-"}</span>
                              </div>
                              <div style={styles.mobileDataPrimary}>{row.number}</div>
                              <div style={styles.mobileDataSecondary}>{formatDateTime(row.date)}</div>
                              <div style={styles.mobileMetaRow}>
                                <span>Odometer</span>
                                <strong>{row.odometerKm || "-"}</strong>
                              </div>
                              <div style={styles.formHint}>{row.summary || "-"}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </Card>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>
    </>
  );
}


function SupplierPortalPage({
  supplier,
  partsRequests,
  setPartsRequests,
  onLogout,
  isCompactLayout,
}: {
  supplier: SupplierSession;
  partsRequests: PartsRequestRecord[];
  setPartsRequests: React.Dispatch<React.SetStateAction<PartsRequestRecord[]>>;
  onLogout: () => void;
  isCompactLayout: boolean;
}) {
  const [portalView, setPortalView] = useState<SupplierPortalView>("openRequests");
  const [search, setSearch] = useState("");
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [brand, setBrand] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unitCost, setUnitCost] = useState("");
  const [deliveryTime, setDeliveryTime] = useState("");
  const [warrantyNote, setWarrantyNote] = useState("");
  const [condition, setCondition] = useState<SupplierBidCondition>("Brand New");
  const [notes, setNotes] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [courierName, setCourierName] = useState("");
  const [shippingNotes, setShippingNotes] = useState("");
  const [invoiceFileName, setInvoiceFileName] = useState("");
  const [shippingLabelFileName, setShippingLabelFileName] = useState("");
  const [error, setError] = useState("");
  const [returnResponseStatus, setReturnResponseStatus] = useState<Exclude<PartsReturnResponseStatus, "Requested">>("Approved");
  const [returnResponseNotes, setReturnResponseNotes] = useState("");

  const openRequests = useMemo(() => {
    const term = search.trim().toLowerCase();
    return partsRequests
      .filter((row) => !["Closed", "Cancelled", "Return Approved", "Return Rejected"].includes(row.status))
      .filter((row) =>
        !term
          ? true
          : [row.requestNumber, row.roNumber, row.partName, row.partNumber, row.plateNumber, row.accountLabel, row.vehicleLabel, row.notes]
              .join(" ")
              .toLowerCase()
              .includes(term)
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [partsRequests, search]);

  const myBids = useMemo(
    () =>
      partsRequests.flatMap((request) =>
        request.bids
          .filter((bid) => bid.supplierName.trim().toLowerCase() === supplier.supplierName.trim().toLowerCase())
          .map((bid) => ({ request, bid }))
      ),
    [partsRequests, supplier.supplierName]
  );

  const selectedRequest = openRequests.find((row) => row.id === selectedRequestId) ?? openRequests[0] ?? null;

  useEffect(() => {
    if (!selectedRequestId && openRequests.length > 0) {
      setSelectedRequestId(openRequests[0].id);
      return;
    }
    if (selectedRequestId && !openRequests.some((row) => row.id === selectedRequestId)) {
      setSelectedRequestId(openRequests[0]?.id ?? "");
    }
  }, [selectedRequestId, openRequests]);

  const updateRequest = (requestId: string, updater: (request: PartsRequestRecord) => PartsRequestRecord) => {
    setPartsRequests((prev) => prev.map((request) => (request.id === requestId ? updater(request) : request)));
  };

  const submitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) {
      setError("Select a parts request first.");
      return;
    }
    if (!brand.trim() || !quantity.trim() || !unitCost.trim() || !deliveryTime.trim()) {
      setError("Brand, quantity, unit cost, and delivery time are required.");
      return;
    }

    const quantityValue = Math.max(1, parseMoneyInput(quantity));
    const unitCostValue = parseMoneyInput(unitCost);
    const totalCostValue = quantityValue * unitCostValue;
    const productPhotoInput = document.getElementById("supplier-product-photos") as HTMLInputElement | null;
    const productPhotos = await buildPartsMediaRecords(productPhotoInput?.files ?? null, "Supplier", "Supplier Item Photo", supplier.supplierName);

    const newBid: SupplierBid = {
      id: uid("bid"),
      supplierName: supplier.supplierName,
      brand: brand.trim(),
      quantity: quantityValue.toString(),
      unitCost: unitCostValue.toFixed(2),
      totalCost: totalCostValue.toFixed(2),
      deliveryTime: deliveryTime.trim(),
      warrantyNote: warrantyNote.trim(),
      condition,
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      productPhotos,
      invoiceFileName: invoiceFileName.trim(),
      shippingLabelFileName: shippingLabelFileName.trim(),
      trackingNumber: trackingNumber.trim(),
      courierName: courierName.trim(),
      shippingNotes: shippingNotes.trim(),
    };

    updateRequest(selectedRequest.id, (request) => ({
      ...request,
      bids: [newBid, ...request.bids],
      status:
        newBid.invoiceFileName || newBid.shippingLabelFileName || newBid.trackingNumber
          ? "In Transit"
          : request.status === "Draft" || request.status === "Requested" || request.status === "Sent to Suppliers"
            ? "Waiting for Bids"
            : "Bidding",
      updatedAt: new Date().toISOString(),
    }));

    setBrand("");
    setQuantity("1");
    setUnitCost("");
    setDeliveryTime("");
    setWarrantyNote("");
    setCondition("Brand New");
    setNotes("");
    setTrackingNumber("");
    setCourierName("");
    setShippingNotes("");
    setInvoiceFileName("");
    setShippingLabelFileName("");
    setError("");
    if (productPhotoInput) productPhotoInput.value = "";
    setPortalView("myBids");
  };

  const updateShippingForBid = (requestId: string, bidId: string) => {
    updateRequest(requestId, (request) => ({
      ...request,
      bids: request.bids.map((bid) =>
        bid.id === bidId
          ? {
              ...bid,
              invoiceFileName: invoiceFileName.trim() || bid.invoiceFileName,
              shippingLabelFileName: shippingLabelFileName.trim() || bid.shippingLabelFileName,
              trackingNumber: trackingNumber.trim() || bid.trackingNumber,
              courierName: courierName.trim() || bid.courierName,
              shippingNotes: shippingNotes.trim() || bid.shippingNotes,
            }
          : bid
      ),
      status:
        invoiceFileName.trim() || shippingLabelFileName.trim() || trackingNumber.trim()
          ? "In Transit"
          : request.status,
      updatedAt: new Date().toISOString(),
    }));
    setInvoiceFileName("");
    setShippingLabelFileName("");
    setTrackingNumber("");
    setCourierName("");
    setShippingNotes("");
  };

  const respondToReturn = async (requestId: string) => {
    const responseInput = document.getElementById(`supplier-return-response-${requestId}`) as HTMLInputElement | null;
    const responsePictures = await buildPartsMediaRecords(responseInput?.files ?? null, "Return", "Supplier Return Response", supplier.supplierName);
    updateRequest(requestId, (request) => ({
      ...request,
      returnRecords: request.returnRecords.map((entry, index) =>
        index === 0
          ? {
              ...entry,
              responseStatus: returnResponseStatus,
              responseNotes: returnResponseNotes.trim(),
              responsePictures: [...entry.responsePictures, ...responsePictures],
              respondedAt: new Date().toISOString(),
              respondedBy: supplier.supplierName,
            }
          : entry
      ),
      status:
        returnResponseStatus === "Approved" || returnResponseStatus === "Replacement in Process" || returnResponseStatus === "Refund in Process"
          ? "Return Approved"
          : "Return Rejected",
      updatedAt: new Date().toISOString(),
    }));
    if (responseInput) responseInput.value = "";
    setReturnResponseNotes("");
  };

  return (
    <>
      <style>{globalCss}</style>
      <div style={styles.appShell}>
        <div style={styles.mainArea}>
          <header style={styles.topBar}>
            <div style={styles.topBarLeft}>
              <div>
                <div style={styles.pageTitle}>Supplier Portal</div>
                <div style={styles.pageSubtitle}>{BUILD_VERSION}</div>
              </div>
            </div>

            <div style={styles.topBarRight}>
              <span style={styles.statusInfo}>Open requests: {openRequests.length}  |  My bids: {myBids.length}</span>
              <div style={styles.topBarName}>{supplier.supplierName}</div>
              <button type="button" onClick={onLogout} style={styles.logoutButtonCompact}>
                Sign Out
              </button>
            </div>
          </header>

          <main style={styles.mainContent}>
            <div style={styles.inlineActions}>
              <button
                type="button"
                style={{ ...styles.secondaryButton, ...(portalView === "openRequests" ? styles.portalTabActive : {}) }}
                onClick={() => setPortalView("openRequests")}
              >
                Open Requests
              </button>
              <button
                type="button"
                style={{ ...styles.secondaryButton, ...(portalView === "myBids" ? styles.portalTabActive : {}) }}
                onClick={() => setPortalView("myBids")}
              >
                My Submitted Bids
              </button>
            </div>

            <div style={styles.portalHeroCard}>
              <div style={styles.portalHeroTitle}>Media, shipping, and return response center</div>
              <div style={styles.portalHeroText}>
                Review workshop reference pictures, submit bid photos, upload invoice and shipping label details, and respond to return requests with reasons and pictures.
              </div>
            </div>

            {portalView === "openRequests" ? (
              <div style={styles.grid}>
                <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }}>
                  <Card title="Open Parts Requests" subtitle="Requests ready for supplier review and quotation">
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Search Requests</label>
                      <input
                        style={styles.input}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search request no., RO, plate, part, vehicle"
                      />
                    </div>

                    {openRequests.length === 0 ? (
                      <div style={styles.emptyState}>No open requests available right now.</div>
                    ) : (
                      <div style={styles.mobileCardList}>
                        {openRequests.map((request) => (
                          <button
                            key={request.id}
                            type="button"
                            onClick={() => setSelectedRequestId(request.id)}
                            style={{
                              ...styles.mobileDataCard,
                              ...(selectedRequestId === request.id ? styles.selectedQueueCard : {}),
                              textAlign: "left",
                              cursor: "pointer",
                            }}
                          >
                            <div style={styles.mobileDataCardHeader}>
                              <strong>{request.requestNumber}</strong>
                              <span style={getPartsRequestStatusStyle(request.status)}>{request.status}</span>
                            </div>
                            <div style={styles.mobileDataPrimary}>{request.partName}</div>
                            <div style={styles.mobileDataSecondary}>{request.partNumber || "No part number"}</div>
                            <div style={styles.mobileDataSecondary}>{request.vehicleLabel}  |  {request.plateNumber || "-"}</div>
                            <div style={styles.mobileMetaRow}><span>Workshop Photos</span><strong>{request.workshopPhotos.length}</strong></div>
                            <div style={styles.mobileMetaRow}><span>Bids</span><strong>{request.bids.length}</strong></div>
                          </button>
                        ))}
                      </div>
                    )}
                  </Card>
                </div>

                <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }}>
                  <Card title="Submit Supplier Bid" subtitle="Use workshop media as reference, then send pricing, pictures, and shipping-ready details">
                    {!selectedRequest ? (
                      <div style={styles.emptyState}>Select a request from the left to submit a bid.</div>
                    ) : (
                      <form onSubmit={submitBid} style={styles.formStack}>
                        <div style={styles.sectionCardMuted}>
                          <div style={styles.quickAccessList}>
                            <div style={styles.quickAccessRow}><span>Request</span><strong>{selectedRequest.requestNumber}</strong></div>
                            <div style={styles.quickAccessRow}><span>RO</span><strong>{selectedRequest.roNumber}</strong></div>
                            <div style={styles.quickAccessRow}><span>Part</span><strong>{selectedRequest.partName}</strong></div>
                            <div style={styles.quickAccessRow}><span>Required Qty</span><strong>{selectedRequest.quantity}</strong></div>
                            <div style={styles.quickAccessRow}><span>Vehicle</span><strong>{selectedRequest.vehicleLabel}</strong></div>
                          </div>
                        </div>

                        <div style={styles.sectionCardMuted}>
                          <div style={styles.sectionTitle}>Workshop Reference Pictures</div>
                          {selectedRequest.workshopPhotos.length === 0 ? (
                            <div style={styles.formHint}>No workshop pictures uploaded yet.</div>
                          ) : (
                            <div style={styles.partsMediaGrid}>
                              {selectedRequest.workshopPhotos.map((photo) => (
                                <div key={photo.id} style={styles.partsMediaCard}>
                                  <img src={photo.previewDataUrl} alt={photo.fileName} style={styles.partsMediaImage} />
                                  <div style={styles.formHint}>{photo.fileName}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Supplier</label>
                            <input style={styles.input} value={supplier.supplierName} disabled />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Brand</label>
                            <input style={styles.input} value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Brand or line" />
                          </div>
                        </div>

                        <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Quantity</label>
                            <input style={styles.input} value={quantity} onChange={(e) => setQuantity(e.target.value)} />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Unit Cost</label>
                            <input style={styles.input} value={unitCost} onChange={(e) => setUnitCost(e.target.value)} placeholder="PHP" />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Condition</label>
                            <select style={styles.select} value={condition} onChange={(e) => setCondition(e.target.value as SupplierBidCondition)}>
                              <option value="Brand New">Brand New</option>
                              <option value="OEM">OEM</option>
                              <option value="Replacement">Replacement</option>
                              <option value="Surplus">Surplus</option>
                            </select>
                          </div>
                        </div>

                        <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Delivery Time</label>
                            <input style={styles.input} value={deliveryTime} onChange={(e) => setDeliveryTime(e.target.value)} placeholder="Same day / 2 days / 1 week" />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Warranty Note</label>
                            <input style={styles.input} value={warrantyNote} onChange={(e) => setWarrantyNote(e.target.value)} placeholder="Optional warranty note" />
                          </div>
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Add Product Photos</label>
                          <input id="supplier-product-photos" style={styles.input} type="file" accept="image/*" multiple />
                          <div style={styles.formHint}>You can select multiple photos in one upload and add more in future updates.</div>
                          <div style={styles.formHint}>Add one or many product photos now, then add more later if needed.</div>
                        </div>

                        <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Invoice File Name</label>
                            <input style={styles.input} value={invoiceFileName} onChange={(e) => setInvoiceFileName(e.target.value)} placeholder="Invoice file or number" />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Shipping Label File Name</label>
                            <input style={styles.input} value={shippingLabelFileName} onChange={(e) => setShippingLabelFileName(e.target.value)} placeholder="Label file name" />
                          </div>
                        </div>

                        <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Tracking Number</label>
                            <input style={styles.input} value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Tracking number" />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Courier</label>
                            <input style={styles.input} value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="Courier / shipper" />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Shipping Notes</label>
                            <input style={styles.input} value={shippingNotes} onChange={(e) => setShippingNotes(e.target.value)} placeholder="Optional shipping note" />
                          </div>
                        </div>

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Notes</label>
                          <textarea style={styles.textarea} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional fitment, stock, or delivery notes" />
                        </div>

                        {error ? <div style={styles.errorBox}>{error}</div> : null}

                        <div style={styles.inlineActions}>
                          <button type="submit" style={styles.primaryButton}>Submit Bid</button>
                        </div>
                      </form>
                    )}
                  </Card>
                </div>
              </div>
            ) : (
              <div style={styles.mobileCardList}>
                {myBids.length === 0 ? (
                  <div style={styles.emptyState}>No bids submitted from this supplier portal session yet.</div>
                ) : (
                  myBids.map(({ request, bid }) => {
                    const latestReturn = request.returnRecords[0] ?? null;
                    return (
                      <div key={bid.id} style={styles.mobileDataCard}>
                        <div style={styles.mobileDataCardHeader}>
                          <strong>{request.requestNumber}</strong>
                          <span style={getPartsRequestStatusStyle(request.status)}>{request.status}</span>
                        </div>
                        <div style={styles.mobileDataPrimary}>{request.partName}</div>
                        <div style={styles.mobileDataSecondary}>{bid.brand || "No brand"}  |  {bid.condition}</div>
                        <div style={styles.mobileMetaRow}><span>Total Bid</span><strong>{formatCurrency(parseMoneyInput(bid.totalCost))}</strong></div>
                        <div style={styles.mobileMetaRow}><span>Delivery</span><strong>{bid.deliveryTime || "-"}</strong></div>
                        <div style={styles.mobileMetaRow}><span>Tracking</span><strong>{bid.trackingNumber || "-"}</strong></div>
                        <div style={styles.mobileMetaRow}><span>Invoice</span><strong>{bid.invoiceFileName || "-"}</strong></div>
                        <div style={styles.mobileMetaRow}><span>Label</span><strong>{bid.shippingLabelFileName || "-"}</strong></div>
                        {bid.productPhotos.length > 0 ? (
                          <div style={styles.partsMediaGrid}>
                            {bid.productPhotos.map((photo) => (
                              <div key={photo.id} style={styles.partsMediaCard}>
                                <img src={photo.previewDataUrl} alt={photo.fileName} style={styles.partsMediaImage} />
                                <div style={styles.formHint}>{photo.fileName}</div>
                              </div>
                            ))}
                          </div>
                        ) : null}
                        <div style={styles.sectionCardMuted}>
                          <div style={styles.sectionTitle}>Update Shipping</div>
                          <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Invoice File Name</label>
                              <input style={styles.input} value={invoiceFileName} onChange={(e) => setInvoiceFileName(e.target.value)} placeholder={bid.invoiceFileName || "Invoice file or number"} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Shipping Label File Name</label>
                              <input style={styles.input} value={shippingLabelFileName} onChange={(e) => setShippingLabelFileName(e.target.value)} placeholder={bid.shippingLabelFileName || "Shipping label file"} />
                            </div>
                          </div>
                          <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Tracking Number</label>
                              <input style={styles.input} value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder={bid.trackingNumber || "Tracking number"} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Courier</label>
                              <input style={styles.input} value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder={bid.courierName || "Courier"} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Shipping Notes</label>
                              <input style={styles.input} value={shippingNotes} onChange={(e) => setShippingNotes(e.target.value)} placeholder={bid.shippingNotes || "Optional note"} />
                            </div>
                          </div>
                          <button type="button" style={styles.smallButton} onClick={() => updateShippingForBid(request.id, bid.id)}>
                            Save Shipping Update
                          </button>
                        </div>
                        {latestReturn ? (
                          <div style={styles.sectionCardMuted}>
                            <div style={styles.sectionTitle}>Return Notification</div>
                            <div style={styles.formHint}>Reason: {latestReturn.reason || "-"}</div>
                            <div style={styles.formHint}>Notes: {latestReturn.notes || "-"}</div>
                            {latestReturn.pictures.length > 0 ? (
                              <div style={styles.partsMediaGrid}>
                                {latestReturn.pictures.map((photo) => (
                                  <div key={photo.id} style={styles.partsMediaCard}>
                                    <img src={photo.previewDataUrl} alt={photo.fileName} style={styles.partsMediaImage} />
                                    <div style={styles.formHint}>{photo.fileName}</div>
                                  </div>
                                ))}
                              </div>
                            ) : null}
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Return Response</label>
                              <select style={styles.select} value={returnResponseStatus} onChange={(e) => setReturnResponseStatus(e.target.value as Exclude<PartsReturnResponseStatus, "Requested">)}>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                                <option value="Replacement in Process">Replacement in Process</option>
                                <option value="Refund in Process">Refund in Process</option>
                              </select>
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Response Notes</label>
                              <textarea style={styles.textarea} value={returnResponseNotes} onChange={(e) => setReturnResponseNotes(e.target.value)} placeholder="Explain the return response" />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Add Response Photos</label>
                              <input id={`supplier-return-response-${request.id}`} style={styles.input} type="file" accept="image/*" multiple />
                              <div style={styles.formHint}>Add one or many response photos. New uploads are appended.</div>
                            </div>
                            <button type="button" style={styles.smallButtonDanger} onClick={() => respondToReturn(request.id)}>
                              Send Return Response
                            </button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </main>
        </div>
      </div>
    </>
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
  workLogs,
  partsRequests,
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
  workLogs: WorkLog[];
  partsRequests: PartsRequestRecord[];
  isCompactLayout: boolean;
}) {
  const activeUsers = users.filter((u) => u.active);
  const userRoleCounts = ALL_ROLES.map((role) => ({
    role,
    count: activeUsers.filter((u) => u.role === role).length,
  }));

  const currentPermissions = getPermissionsForRole(currentUser.role, roleDefinitions);
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
  const approvalsDone = approvalRecords.length;
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

  const laborRevenueTotal = repairOrders.reduce(
    (sum, ro) => sum + ro.workLines.reduce((lineSum, line) => lineSum + parseMoneyInput(line.serviceEstimate), 0),
    0
  );
  const partsRevenueTotal = repairOrders.reduce(
    (sum, ro) => sum + ro.workLines.reduce((lineSum, line) => lineSum + parseMoneyInput(line.partsEstimate), 0),
    0
  );
  const partsInternalCostTotal = repairOrders.reduce(
    (sum, ro) =>
      sum +
      ro.workLines.reduce((lineSum, line) => {
        const baseCost = parseMoneyInput(line.partsCost);
        return lineSum + baseCost;
      }, 0),
    0
  );
  const estimatedGrossProfit = laborRevenueTotal + partsRevenueTotal - partsInternalCostTotal;
  const estimatedGrossMargin = laborRevenueTotal + partsRevenueTotal > 0
    ? Math.round((estimatedGrossProfit / (laborRevenueTotal + partsRevenueTotal)) * 100)
    : 0;

  const releasedRevenue = releaseRecords.reduce((sum, row) => sum + parseMoneyInput(row.finalTotalAmount), 0);
  const releasedJobsCount = releaseRecords.length;
  const averageReleasedTicket = releasedJobsCount ? releasedRevenue / releasedJobsCount : 0;

  const reportTechProductivity = getTechnicianProductivity(repairOrders, workLogs, users);
  const reportAdvisorSales = getAdvisorSalesProduced(repairOrders, invoiceRecords);
  const reportRepeatCustomers = getRepeatCustomerFrequency(repairOrders);
  const reportQcSummary = getQcPassFailSummary(qcRecords);
  const reportWaitingPartsAging = getWaitingPartsAging(repairOrders, partsRequests);
  const reportBackjobRate = getBackjobRate(repairOrders, backjobRecords);

  const roProfitMap = repairOrders
    .map((ro) => {
      const laborRevenue = ro.workLines.reduce((sum, line) => sum + parseMoneyInput(line.serviceEstimate), 0)
      const partsRevenue = ro.workLines.reduce((sum, line) => sum + parseMoneyInput(line.partsEstimate), 0)
      const partsCost = ro.workLines.reduce((sum, line) => sum + parseMoneyInput(line.partsCost), 0)
      const grossProfit = laborRevenue + partsRevenue - partsCost
      return {
        ro,
        laborRevenue,
        partsRevenue,
        partsCost,
        grossProfit,
        margin:
          laborRevenue + partsRevenue > 0
            ? Math.round((grossProfit / (laborRevenue + partsRevenue)) * 100)
            : 0,
      }
    })
    .sort((a, b) => b.grossProfit - a.grossProfit)
    .slice(0, 6);

  const techRevenueMap = users.filter((u) => u.active).map((user) => {
    const assigned = repairOrders.filter((ro) => ro.primaryTechnicianId === user.id).length;
    const active = repairOrders.filter((ro) => ro.primaryTechnicianId === user.id && ["Approved / Ready to Work", "In Progress", "Waiting Parts", "Quality Check"].includes(ro.status)).length;
    const total = repairOrders
      .filter((ro) => ro.primaryTechnicianId === user.id)
      .reduce((sum, ro) => sum + ro.workLines.reduce((lineSum, line) => lineSum + parseMoneyInput(line.serviceEstimate), 0), 0);
    const completed = repairOrders.filter((ro) => ro.primaryTechnicianId === user.id && ["Ready Release", "Released", "Closed"].includes(ro.status)).length;
    const qcFailed = qcRecords.filter((qc) => qc.result === "Failed" && repairOrders.find((ro) => ro.id === qc.roId)?.primaryTechnicianId === user.id).length;
    const userLogs = workLogs.filter((log) => log.technicianId === user.id);
    const bookedMinutes = userLogs.reduce((sum, log) => sum + getWorkLogMinutes(log), 0);
    const activeTimers = userLogs.filter((log) => !log.endedAt).length;
    const laborProduced = userLogs.reduce((sum, log) => {
      const ro = repairOrders.find((row) => row.id === log.roId);
      const line = ro?.workLines.find((row) => row.id === log.workLineId);
      return sum + parseMoneyInput(line?.serviceEstimate ?? "0");
    }, 0);
    const efficiency = bookedMinutes > 0 ? Math.round((laborProduced / bookedMinutes) * 60) : 0;
    return { user, assigned, active, total, completed, qcFailed, bookedMinutes, activeTimers, laborProduced, efficiency };
  }).sort((a,b)=>b.laborProduced-a.laborProduced).slice(0,8);

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
            <div style={styles.statNote}>{unpaidInvoices} unpaid  |  {partialInvoices} partial</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Open ROs</div>
            <div style={styles.statValue}>{openROs}</div>
            <div style={styles.statNote}>{inProgressCount} in progress  |  {qcQueueCount} in QC</div>
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

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Estimated Gross Profit</div>
            <div style={styles.statValueSmall}>{formatCurrency(estimatedGrossProfit)}</div>
            <div style={styles.statNote}>Labor + parts revenue minus internal parts cost</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Gross Margin</div>
            <div style={styles.statValue}>{estimatedGrossMargin}%</div>
            <div style={styles.statNote}>Estimated margin across all repair orders</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Average Released Ticket</div>
            <div style={styles.statValueSmall}>{formatCurrency(averageReleasedTicket)}</div>
            <div style={styles.statNote}>Average final released amount per job</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>QC Pass Rate</div>
            <div style={styles.statValue}>{reportQcSummary.passRatePct}%</div>
            <div style={styles.statNote}>{reportQcSummary.passed} passed  |  {reportQcSummary.failed} failed of {reportQcSummary.total}</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Backjob Rate</div>
            <div style={styles.statValue}>{reportBackjobRate.backjobRatePct}%</div>
            <div style={styles.statNote}>{reportBackjobRate.backjobCount} backjobs of {reportBackjobRate.totalROs} ROs</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Repeat Customers</div>
            <div style={styles.statValue}>{reportRepeatCustomers.length}</div>
            <div style={styles.statNote}>Vehicles / accounts with 2+ visits</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>Parts-Blocked ROs</div>
            <div style={styles.statValue}>{reportWaitingPartsAging.length}</div>
            <div style={styles.statNote}>{reportWaitingPartsAging[0] ? `Longest: ${reportWaitingPartsAging[0].daysWaiting}d` : "No blocked ROs"}</div>
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
              {techRevenueMap.map(({ user, total, completed, active, qcFailed, bookedMinutes, activeTimers, laborProduced, efficiency }) => (
                <div key={user.id} style={styles.quickAccessRow}>
                  <span>{user.fullName}</span>
                  <strong>{formatCurrency(laborProduced || total)}  |  {formatMinutesAsHours(bookedMinutes)}  |  {completed} done  |  {active} active  |  {activeTimers} live  |  {qcFailed} QC fail  |  {efficiency}% eff.</strong>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }}>
          <Card title="Top Repair Orders by Profit" subtitle="Estimated gross profit based on labor + parts revenue less internal parts cost">
            <div style={styles.quickAccessList}>
              {roProfitMap.length === 0 ? (
                <div style={styles.emptyState}>No repair orders available yet.</div>
              ) : (
                roProfitMap.map(({ ro, grossProfit, margin, laborRevenue, partsRevenue, partsCost }) => (
                  <div key={ro.id} style={styles.quickAccessRow}>
                    <span>{ro.roNumber}  |  {ro.plateNumber || ro.conductionNumber || "-"}</span>
                    <strong>{formatCurrency(grossProfit)}  |  {margin}% margin  |  L {formatCurrency(laborRevenue)}  |  P {formatCurrency(partsRevenue)}  |  Cost {formatCurrency(partsCost)}</strong>
                  </div>
                ))
              )}
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

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Technician Productivity" subtitle="Labor produced and logged hours per technician">
            {reportTechProductivity.length === 0 ? (
              <div style={styles.emptyState}>No technician data yet.</div>
            ) : isCompactLayout ? (
              <div style={styles.mobileCardList}>
                {reportTechProductivity.map((row) => (
                  <div key={row.technicianId} style={styles.mobileDataCard}>
                    <div style={styles.mobileDataCardHeader}><strong>{row.technicianName}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Jobs</span><strong>{row.jobCount}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Labor Produced</span><strong>{formatCurrency(row.laborProduced)}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Logged</span><strong>{formatMinutesAsHours(row.loggedMinutes)}</strong></div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Technician</th>
                      <th style={styles.th}>Jobs</th>
                      <th style={styles.th}>Labor Produced</th>
                      <th style={styles.th}>Logged</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportTechProductivity.map((row) => (
                      <tr key={row.technicianId}>
                        <td style={styles.td}>{row.technicianName}</td>
                        <td style={styles.td}>{row.jobCount}</td>
                        <td style={styles.td}>{formatCurrency(row.laborProduced)}</td>
                        <td style={styles.td}>{formatMinutesAsHours(row.loggedMinutes)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }}>
          <Card title="Advisor Sales Produced" subtitle="RO volume and invoiced amounts per service advisor">
            {reportAdvisorSales.length === 0 ? (
              <div style={styles.emptyState}>No invoice data yet.</div>
            ) : isCompactLayout ? (
              <div style={styles.mobileCardList}>
                {reportAdvisorSales.map((row) => (
                  <div key={row.advisorName} style={styles.mobileDataCard}>
                    <div style={styles.mobileDataCardHeader}><strong>{row.advisorName}</strong></div>
                    <div style={styles.mobileMetaRow}><span>ROs</span><strong>{row.roCount}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Total Invoiced</span><strong>{formatCurrency(row.totalInvoiced)}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Labor</span><strong>{formatCurrency(row.laborSubtotal)}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Parts</span><strong>{formatCurrency(row.partsSubtotal)}</strong></div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Advisor</th>
                      <th style={styles.th}>ROs</th>
                      <th style={styles.th}>Total Invoiced</th>
                      <th style={styles.th}>Labor</th>
                      <th style={styles.th}>Parts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportAdvisorSales.map((row) => (
                      <tr key={row.advisorName}>
                        <td style={styles.td}>{row.advisorName}</td>
                        <td style={styles.td}>{row.roCount}</td>
                        <td style={styles.td}>{formatCurrency(row.totalInvoiced)}</td>
                        <td style={styles.td}>{formatCurrency(row.laborSubtotal)}</td>
                        <td style={styles.td}>{formatCurrency(row.partsSubtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(6, isCompactLayout) }}>
          <Card title="QC Pass / Fail by Officer" subtitle="Quality check outcomes per QC officer">
            {reportQcSummary.byQCOfficer.length === 0 ? (
              <div style={styles.emptyState}>No QC records yet.</div>
            ) : isCompactLayout ? (
              <div style={styles.mobileCardList}>
                {reportQcSummary.byQCOfficer.map((row) => (
                  <div key={row.qcBy} style={styles.mobileDataCard}>
                    <div style={styles.mobileDataCardHeader}><strong>{row.qcBy}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Total</span><strong>{row.total}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Passed</span><strong style={{ color: "#15803d" }}>{row.passed}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Failed</span><strong style={{ color: "#b91c1c" }}>{row.failed}</strong></div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>QC Officer</th>
                      <th style={styles.th}>Total</th>
                      <th style={styles.th}>Passed</th>
                      <th style={styles.th}>Failed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportQcSummary.byQCOfficer.map((row) => (
                      <tr key={row.qcBy}>
                        <td style={styles.td}>{row.qcBy}</td>
                        <td style={styles.td}>{row.total}</td>
                        <td style={{ ...styles.td, color: "#15803d" }}>{row.passed}</td>
                        <td style={{ ...styles.td, color: row.failed > 0 ? "#b91c1c" : undefined }}>{row.failed}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(8, isCompactLayout) }}>
          <Card title="Waiting Parts Aging" subtitle="ROs blocked by parts requests, sorted by days waiting">
            {reportWaitingPartsAging.length === 0 ? (
              <div style={styles.emptyState}>No parts-blocked ROs.</div>
            ) : isCompactLayout ? (
              <div style={styles.mobileCardList}>
                {reportWaitingPartsAging.map((row) => (
                  <div key={row.roId} style={styles.mobileDataCard}>
                    <div style={styles.mobileDataCardHeader}><strong>{row.roNumber}</strong><span style={{ color: row.daysWaiting >= 3 ? "#b45309" : undefined }}>{row.daysWaiting}d waiting</span></div>
                    <div style={styles.mobileDataPrimary}>{row.plateNumber || row.accountLabel || "-"}</div>
                    <div style={styles.mobileDataSecondary}>{row.blockedWorkLineTitles.join(", ") || "-"}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>RO No.</th>
                      <th style={styles.th}>Plate</th>
                      <th style={styles.th}>Account</th>
                      <th style={styles.th}>Days Waiting</th>
                      <th style={styles.th}>Blocked Work Lines</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportWaitingPartsAging.map((row) => (
                      <tr key={row.roId}>
                        <td style={styles.td}>{row.roNumber}</td>
                        <td style={styles.td}>{row.plateNumber || "-"}</td>
                        <td style={styles.td}>{row.accountLabel || "-"}</td>
                        <td style={{ ...styles.td, color: row.daysWaiting >= 3 ? "#b45309" : undefined, fontWeight: row.daysWaiting >= 3 ? 700 : undefined }}>{row.daysWaiting}d</td>
                        <td style={styles.td}>{row.blockedWorkLineTitles.join(", ") || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }}>
          <Card title="Backjob Breakdown" subtitle="Comeback rate by responsibility">
            {reportBackjobRate.byResponsibility.length === 0 ? (
              <div style={styles.emptyState}>No backjob records yet.</div>
            ) : isCompactLayout ? (
              <div style={styles.mobileCardList}>
                {reportBackjobRate.byResponsibility.map((row) => (
                  <div key={row.responsibility} style={styles.mobileDataCard}>
                    <div style={styles.mobileDataCardHeader}><strong>{row.responsibility}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Count</span><strong>{row.count}</strong></div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Responsibility</th>
                      <th style={styles.th}>Count</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportBackjobRate.byResponsibility.map((row) => (
                      <tr key={row.responsibility}>
                        <td style={styles.td}>{row.responsibility}</td>
                        <td style={styles.td}>{row.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card title="Repeat Customers / Vehicles" subtitle="Vehicles or accounts with more than one repair order">
            {reportRepeatCustomers.length === 0 ? (
              <div style={styles.emptyState}>No repeat visits recorded yet.</div>
            ) : isCompactLayout ? (
              <div style={styles.mobileCardList}>
                {reportRepeatCustomers.map((row) => (
                  <div key={row.key} style={styles.mobileDataCard}>
                    <div style={styles.mobileDataCardHeader}><strong>{row.plateNumber || row.accountLabel || row.key}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Visits</span><strong>{row.visitCount}</strong></div>
                    <div style={styles.mobileMetaRow}><span>Last Visit</span><strong>{row.lastVisitDate ? new Date(row.lastVisitDate).toLocaleDateString() : "-"}</strong></div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={styles.tableWrap}>
                <table style={styles.table}>
                  <thead>
                    <tr>
                      <th style={styles.th}>Plate / Account</th>
                      <th style={styles.th}>Visits</th>
                      <th style={styles.th}>Last Visit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportRepeatCustomers.map((row) => (
                      <tr key={row.key}>
                        <td style={styles.td}>{row.plateNumber || row.accountLabel || row.key}</td>
                        <td style={styles.td}>{row.visitCount}</td>
                        <td style={styles.td}>{row.lastVisitDate ? new Date(row.lastVisitDate).toLocaleDateString() : "-"}</td>
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
  const inspectionDraftValue = readLocalStorage<{ selectedIntakeId: string; form: InspectionForm } | null>(STORAGE_KEYS.inspectionDraft, null);
  const [selectedIntakeId, setSelectedIntakeId] = useState(inspectionDraftValue?.selectedIntakeId ?? "");
  const [form, setForm] = useState<InspectionForm>(() => inspectionDraftValue?.form ? { ...getDefaultInspectionForm(), ...inspectionDraftValue.form } : getDefaultInspectionForm());
  const [error, setError] = useState("");
  const [showDraftRestore, setShowDraftRestore] = useState(() => !!inspectionDraftValue);
  const inspectionDraft = useDraftAutosave(STORAGE_KEYS.inspectionDraft, { selectedIntakeId, form }, !!selectedIntakeId || hasNonEmptyValues(form));
  const [search, setSearch] = useState("");
  const [evidenceSection, setEvidenceSection] = useState("Under the Hood");
  const [evidenceItemLabel, setEvidenceItemLabel] = useState("");


  const addEvidenceFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const nextItems: InspectionEvidenceRecord[] = [];
    for (const file of Array.from(files)) {
      const isVideo = file.type.startsWith("video/");
      if (isVideo && file.size > MOBILE_EVIDENCE_VIDEO_MAX_MB * 1024 * 1024) {
        setError(`Video evidence must be ${MOBILE_EVIDENCE_VIDEO_MAX_MB}MB or less for mobile-friendly viewing.`);
        return;
      }

      let previewDataUrl = "";
      let mobileOptimized = false;
      if (!isVideo && file.type.startsWith("image/")) {
        previewDataUrl = await optimizeImageForMobile(file);
        mobileOptimized = true;
      }

      nextItems.push({
        id: uid("evd"),
        type: isVideo ? "Video" : "Photo",
        section: evidenceSection || "General",
        itemLabel: evidenceItemLabel.trim() || evidenceSection || "General",
        fileName: file.name,
        previewDataUrl,
        addedAt: new Date().toISOString(),
        mobileOptimized,
      });
    }

    setForm((prev) => ({
      ...prev,
      evidenceItems: [...prev.evidenceItems, ...nextItems],
    }));
    setError("");
  };

  const removeEvidenceItem = (evidenceId: string) => {
    setForm((prev) => ({
      ...prev,
      evidenceItems: prev.evidenceItems.filter((item) => item.id !== evidenceId),
    }));
  };

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

  const addCategoryFinding = (category: FindingCategoryKey) => {
    setForm((prev) => ({
      ...prev,
      [category]: [...prev[category], getEmptyAdditionalFinding()],
    }));
  };

  const updateCategoryFinding = (
    category: FindingCategoryKey,
    findingId: string,
    field: "title" | "note" | "status",
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [category]: prev[category].map((finding) =>
        finding.id === findingId ? { ...finding, [field]: field === "status" ? (value as FindingStatus) : value } : finding
      ),
    }));
  };

  const removeCategoryFinding = (category: FindingCategoryKey, findingId: string) => {
    setForm((prev) => ({
      ...prev,
      [category]: prev[category].filter((finding) => finding.id !== findingId),
    }));
  };

  const addCategoryFindingPhotoNote = (category: FindingCategoryKey, findingId: string) => {
    setForm((prev) => ({
      ...prev,
      [category]: prev[category].map((finding) =>
        finding.id === findingId ? { ...finding, photoNotes: [...finding.photoNotes, ""] } : finding
      ),
    }));
  };

  const updateCategoryFindingPhotoNote = (
    category: FindingCategoryKey,
    findingId: string,
    photoIndex: number,
    value: string
  ) => {
    setForm((prev) => ({
      ...prev,
      [category]: prev[category].map((finding) =>
        finding.id === findingId
          ? {
              ...finding,
              photoNotes: finding.photoNotes.map((note, index) => (index === photoIndex ? value : note)),
            }
          : finding
      ),
    }));
  };

  const removeCategoryFindingPhotoNote = (
    category: FindingCategoryKey,
    findingId: string,
    photoIndex: number
  ) => {
    setForm((prev) => ({
      ...prev,
      [category]: prev[category].map((finding) =>
        finding.id === findingId
          ? {
              ...finding,
              photoNotes: finding.photoNotes.filter((_, index) => index !== photoIndex),
            }
          : finding
      ),
    }));
  };


  const eligibleIntakes = useMemo(
    () => intakeRecords.filter((row) => row.status === "Waiting Inspection" || row.status === "Draft"),
    [intakeRecords]
  );

  const selectedIntake = useMemo(
    () => intakeRecords.find((row) => row.id === selectedIntakeId) ?? null,
    [intakeRecords, selectedIntakeId]
  );

  const selectedInspection = useMemo(
    () => (selectedIntake ? inspectionRecords.find((row) => row.intakeId === selectedIntake.id) ?? null : null),
    [inspectionRecords, selectedIntake]
  );

  useEffect(() => {
    if (selectedIntakeId && !intakeRecords.some((row) => row.id === selectedIntakeId)) {
      setSelectedIntakeId("");
    }
  }, [intakeRecords, selectedIntakeId]);

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
        enableCoolingCheck: (selectedInspection as any).enableCoolingCheck ?? false,
        coolingFanOperationState: (selectedInspection as any).coolingFanOperationState ?? "Not Checked",
        radiatorConditionState: (selectedInspection as any).radiatorConditionState ?? "Not Checked",
        waterPumpConditionState: (selectedInspection as any).waterPumpConditionState ?? "Not Checked",
        thermostatConditionState: (selectedInspection as any).thermostatConditionState ?? "Not Checked",
        overflowReservoirConditionState: (selectedInspection as any).overflowReservoirConditionState ?? "Not Checked",
        coolingSystemPressureState: (selectedInspection as any).coolingSystemPressureState ?? "Not Checked",
        coolingSystemNotes: (selectedInspection as any).coolingSystemNotes ?? "",
        coolingAdditionalFindings: normalizeAdditionalFindings((selectedInspection as any).coolingAdditionalFindings),
        enableSteeringCheck: (selectedInspection as any).enableSteeringCheck ?? false,
        steeringWheelPlayState: (selectedInspection as any).steeringWheelPlayState ?? "Not Checked",
        steeringPumpMotorState: (selectedInspection as any).steeringPumpMotorState ?? "Not Checked",
        steeringFluidConditionState: (selectedInspection as any).steeringFluidConditionState ?? "Not Checked",
        steeringHoseConditionState: (selectedInspection as any).steeringHoseConditionState ?? "Not Checked",
        steeringColumnConditionState: (selectedInspection as any).steeringColumnConditionState ?? "Not Checked",
        steeringRoadFeelState: (selectedInspection as any).steeringRoadFeelState ?? "Not Checked",
        steeringSystemNotes: (selectedInspection as any).steeringSystemNotes ?? "",
        steeringAdditionalFindings: normalizeAdditionalFindings((selectedInspection as any).steeringAdditionalFindings),
        enableEnginePerformanceCheck: (selectedInspection as any).enableEnginePerformanceCheck ?? false,
        engineStartingState: (selectedInspection as any).engineStartingState ?? "Not Checked",
        idleQualityState: (selectedInspection as any).idleQualityState ?? "Not Checked",
        accelerationResponseState: (selectedInspection as any).accelerationResponseState ?? "Not Checked",
        engineMisfireState: (selectedInspection as any).engineMisfireState ?? "Not Checked",
        engineSmokeState: (selectedInspection as any).engineSmokeState ?? "Not Checked",
        fuelEfficiencyConcernState: (selectedInspection as any).fuelEfficiencyConcernState ?? "Not Checked",
        enginePerformanceNotes: (selectedInspection as any).enginePerformanceNotes ?? "",
        enginePerformanceAdditionalFindings: normalizeAdditionalFindings((selectedInspection as any).enginePerformanceAdditionalFindings),
        enableRoadTestCheck: (selectedInspection as any).enableRoadTestCheck ?? false,
        roadTestNoiseState: (selectedInspection as any).roadTestNoiseState ?? "Not Checked",
        roadTestBrakeFeelState: (selectedInspection as any).roadTestBrakeFeelState ?? "Not Checked",
        roadTestSteeringTrackingState: (selectedInspection as any).roadTestSteeringTrackingState ?? "Not Checked",
        roadTestRideQualityState: (selectedInspection as any).roadTestRideQualityState ?? "Not Checked",
        roadTestAccelerationState: (selectedInspection as any).roadTestAccelerationState ?? "Not Checked",
        roadTestTransmissionShiftState: (selectedInspection as any).roadTestTransmissionShiftState ?? "Not Checked",
        roadTestNotes: (selectedInspection as any).roadTestNotes ?? "",
        roadTestAdditionalFindings: normalizeAdditionalFindings((selectedInspection as any).roadTestAdditionalFindings),
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

  const inspectionHistoryMatches = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return [];
    return inspectionRecords
      .filter((row) =>
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
      )
      .slice(0, 10);
  }, [inspectionRecords, search]);

  const relatedInspectionHistory = useMemo(() => {
    if (!selectedIntake) return [];
    const keyPlate = (selectedIntake.plateNumber || selectedIntake.conductionNumber || "").trim().toLowerCase();
    const keyCustomer = (selectedIntake.companyName || selectedIntake.customerName || "").trim().toLowerCase();
    return inspectionRecords
      .filter((row) =>
        row.id !== selectedInspection?.id &&
        (
          (!!keyPlate && [row.plateNumber, row.conductionNumber].join(" ").toLowerCase().includes(keyPlate)) ||
          (!!keyCustomer && row.accountLabel.toLowerCase().includes(keyCustomer))
        )
      )
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
      .slice(0, 8);
  }, [inspectionRecords, selectedIntake, selectedInspection]);

  const reopenInspection = () => {
    if (!selectedInspection) {
      setError("Select an existing inspection first.");
      return;
    }
    const now = new Date().toISOString();
    setInspectionRecords((prev) =>
      prev.map((row) =>
        row.id === selectedInspection.id
          ? { ...row, status: "In Progress", updatedAt: now, reopenedAt: now, reopenedBy: currentUser.fullName, lastUpdatedBy: currentUser.fullName }
          : row
      )
    );
    setForm((prev) => ({ ...prev, status: "In Progress" }));
    setError("");
  };

  const autoRecommendations = useMemo(() => {
    const detailed = buildDetailedUnderHoodRecommendations(form);
    const typed = parseRecommendationLines(form.recommendedWork);
    const suspension = buildSuspensionRecommendations(form);
    const cooling = buildCoolingRecommendations(form);
    const steering = buildSteeringRecommendations(form);
    const enginePerformance = buildEnginePerformanceRecommendations(form);
    const roadTest = buildRoadTestRecommendations(form);
    const ac = buildAcRecommendations(form);
    const electrical = buildElectricalRecommendations(form);
    const transmission = buildTransmissionRecommendations(form);
    const alignment = form.alignmentRecommended || form.alignmentConcernNotes.trim() ? ["Wheel Alignment"] : [];
    return [...new Set([...typed, ...detailed, ...suspension, ...cooling, ...steering, ...enginePerformance, ...roadTest, ...ac, ...electrical, ...transmission, ...alignment])];
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



  const criticalFindingCount = useMemo(() => {
    let count = 0;
    const checkValues: InspectionCheckValue[] = [
      form.underHoodState,
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
      form.rearShockState,
      form.coolingFanOperationState,
      form.radiatorConditionState,
      form.waterPumpConditionState,
      form.steeringWheelPlayState,
      form.steeringPumpMotorState,
      form.engineStartingState,
      form.idleQualityState,
      form.acCoolingPerformanceState,
      form.electricalStarterState,
      form.electricalAlternatorState,
      form.transmissionFluidState,
      form.shiftingPerformanceState,
    ];
    checkValues.forEach((value) => {
      if (value === "Needs Attention" || value === "Needs Replacement") count += 1;
    });
    [
      form.arrivalCheckEngineLight,
      form.arrivalAbsLight,
      form.arrivalAirbagLight,
      form.arrivalBatteryLight,
      form.arrivalOilPressureLight,
      form.arrivalTempLight,
      form.arrivalTransmissionLight,
      form.arrivalOtherWarningLight,
    ].forEach((value) => {
      if (value === "On") count += 1;
    });
    return count;
  }, [form]);

  const inspectionQuickSections = useMemo(() => {
    const sections = [
      { id: "inspection-overview", label: "Overview", enabled: true },
      { id: "inspection-arrival", label: "Arrival", enabled: form.enableSafetyChecks },
      { id: "inspection-tires", label: "Tires", enabled: form.enableTires },
      { id: "inspection-underhood", label: "Under Hood", enabled: true },
      { id: "inspection-brakes", label: "Brakes", enabled: form.enableBrakes },
      { id: "inspection-suspension", label: "Suspension", enabled: form.enableSuspensionCheck },
      { id: "inspection-cooling", label: "Cooling", enabled: form.enableCoolingCheck },
      { id: "inspection-steering", label: "Steering", enabled: form.enableSteeringCheck },
      { id: "inspection-engineperf", label: "Engine", enabled: form.enableEnginePerformanceCheck },
      { id: "inspection-roadtest", label: "Road Test", enabled: form.enableRoadTestCheck },
      { id: "inspection-ac", label: "A/C", enabled: form.enableAcCheck },
      { id: "inspection-electrical", label: "Electrical", enabled: form.enableElectricalCheck },
      { id: "inspection-scan", label: "Scan", enabled: form.enableScanCheck },
      { id: "inspection-transmission", label: "Transmission", enabled: form.enableTransmissionCheck },
      { id: "inspection-evidence", label: "Evidence", enabled: true },
    ];
    return sections.filter((section) => section.enabled);
  }, [form]);

  const jumpToInspectionSection = (sectionId: string) => {
    if (typeof document === "undefined") return;
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

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
        form.coolingFanOperationState,
        form.radiatorConditionState,
        form.waterPumpConditionState,
        form.thermostatConditionState,
        form.overflowReservoirConditionState,
        form.coolingSystemPressureState,
        form.steeringWheelPlayState,
        form.steeringPumpMotorState,
        form.steeringFluidConditionState,
        form.steeringHoseConditionState,
        form.steeringColumnConditionState,
        form.steeringRoadFeelState,
        form.engineStartingState,
        form.idleQualityState,
        form.accelerationResponseState,
        form.engineMisfireState,
        form.engineSmokeState,
        form.fuelEfficiencyConcernState,
        form.roadTestNoiseState,
        form.roadTestBrakeFeelState,
        form.roadTestSteeringTrackingState,
        form.roadTestRideQualityState,
        form.roadTestAccelerationState,
        form.roadTestTransmissionShiftState,
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
      enableCoolingCheck: form.enableCoolingCheck,
      coolingFanOperationState: form.coolingFanOperationState,
      radiatorConditionState: form.radiatorConditionState,
      waterPumpConditionState: form.waterPumpConditionState,
      thermostatConditionState: form.thermostatConditionState,
      overflowReservoirConditionState: form.overflowReservoirConditionState,
      coolingSystemPressureState: form.coolingSystemPressureState,
      coolingSystemNotes: form.coolingSystemNotes.trim(),
      coolingAdditionalFindings: form.coolingAdditionalFindings.map((finding) => ({ ...finding, title: finding.title.trim(), note: finding.note.trim(), photoNotes: finding.photoNotes.map((note) => note.trim()).filter(Boolean) })),
      enableSteeringCheck: form.enableSteeringCheck,
      steeringWheelPlayState: form.steeringWheelPlayState,
      steeringPumpMotorState: form.steeringPumpMotorState,
      steeringFluidConditionState: form.steeringFluidConditionState,
      steeringHoseConditionState: form.steeringHoseConditionState,
      steeringColumnConditionState: form.steeringColumnConditionState,
      steeringRoadFeelState: form.steeringRoadFeelState,
      steeringSystemNotes: form.steeringSystemNotes.trim(),
      steeringAdditionalFindings: form.steeringAdditionalFindings.map((finding) => ({ ...finding, title: finding.title.trim(), note: finding.note.trim(), photoNotes: finding.photoNotes.map((note) => note.trim()).filter(Boolean) })),
      enableEnginePerformanceCheck: form.enableEnginePerformanceCheck,
      engineStartingState: form.engineStartingState,
      idleQualityState: form.idleQualityState,
      accelerationResponseState: form.accelerationResponseState,
      engineMisfireState: form.engineMisfireState,
      engineSmokeState: form.engineSmokeState,
      fuelEfficiencyConcernState: form.fuelEfficiencyConcernState,
      enginePerformanceNotes: form.enginePerformanceNotes.trim(),
      enginePerformanceAdditionalFindings: form.enginePerformanceAdditionalFindings.map((finding) => ({ ...finding, title: finding.title.trim(), note: finding.note.trim(), photoNotes: finding.photoNotes.map((note) => note.trim()).filter(Boolean) })),
      enableRoadTestCheck: form.enableRoadTestCheck,
      roadTestNoiseState: form.roadTestNoiseState,
      roadTestBrakeFeelState: form.roadTestBrakeFeelState,
      roadTestSteeringTrackingState: form.roadTestSteeringTrackingState,
      roadTestRideQualityState: form.roadTestRideQualityState,
      roadTestAccelerationState: form.roadTestAccelerationState,
      roadTestTransmissionShiftState: form.roadTestTransmissionShiftState,
      roadTestNotes: form.roadTestNotes.trim(),
      roadTestAdditionalFindings: form.roadTestAdditionalFindings.map((finding) => ({ ...finding, title: finding.title.trim(), note: finding.note.trim(), photoNotes: finding.photoNotes.map((note) => note.trim()).filter(Boolean) })),
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
      lastUpdatedBy: currentUser.fullName,
      reopenedAt: selectedInspection?.reopenedAt ?? "",
      reopenedBy: selectedInspection?.reopenedBy ?? "",
      linkedRoIds: selectedInspection?.linkedRoIds ?? [],
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

  const renderAdditionalFindingsSection = (
    category: FindingCategoryKey,
    title: string,
    subtitle: string
  ) => {
    const findings = form[category];

    return (
      <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
        <div style={styles.mobileDataCardHeader}>
          <div>
            <div style={styles.sectionTitle}>{title}</div>
            <div style={styles.formHint}>{subtitle}</div>
          </div>
          <button type="button" style={styles.secondaryButton} onClick={() => addCategoryFinding(category)}>
            Add Finding
          </button>
        </div>

        {findings.length === 0 ? (
          <div style={styles.formHint}>No additional findings added for this category.</div>
        ) : (
          <div style={styles.formStack}>
            {findings.map((finding, findingIndex) => (
              <div key={finding.id} style={styles.mobileDataCard}>
                <div style={styles.mobileDataCardHeader}>
                  <strong>{title} Finding {findingIndex + 1}</strong>
                  <button type="button" style={styles.smallButtonMuted} onClick={() => removeCategoryFinding(category, finding.id)}>
                    Remove
                  </button>
                </div>

                <div style={styles.formStack}>
                  <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Finding Title</label>
                      <input
                        style={styles.input}
                        value={finding.title}
                        onChange={(e) => updateCategoryFinding(category, finding.id, "title", e.target.value)}
                        placeholder="Example: Cooling fan noisy"
                      />
                    </div>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>Status</label>
                      <select
                        style={styles.select}
                        value={finding.status}
                        onChange={(e) => updateCategoryFinding(category, finding.id, "status", e.target.value)}
                      >
                        <option value="OK">OK</option>
                        <option value="Monitor">Monitor</option>
                        <option value="Replace">Replace</option>
                      </select>
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Finding Note</label>
                    <textarea
                      style={styles.textarea}
                      value={finding.note}
                      onChange={(e) => updateCategoryFinding(category, finding.id, "note", e.target.value)}
                      placeholder="Technician note, observation, or explanation"
                    />
                  </div>

                  <div style={{ ...styles.sectionCardMuted, marginTop: 4 }}>
                    <div style={styles.mobileDataCardHeader}>
                      <strong>Photo / Media Notes</strong>
                      <button type="button" style={styles.secondaryButton} onClick={() => addCategoryFindingPhotoNote(category, finding.id)}>
                        Add Photo Note
                      </button>
                    </div>

                    {finding.photoNotes.length === 0 ? (
                      <div style={styles.formHint}>No photo or media notes yet.</div>
                    ) : (
                      <div style={styles.formStack}>
                        {finding.photoNotes.map((photoNote, photoIndex) => (
                          <div key={`${finding.id}_${photoIndex}`} style={styles.mobileDataCard}>
                            <div style={styles.mobileDataCardHeader}>
                              <strong>Photo Note {photoIndex + 1}</strong>
                              <button
                                type="button"
                                style={styles.smallButtonMuted}
                                onClick={() => removeCategoryFindingPhotoNote(category, finding.id, photoIndex)}
                              >
                                Remove
                              </button>
                            </div>
                            <input
                              style={styles.input}
                              value={photoNote}
                              onChange={(e) => updateCategoryFindingPhotoNote(category, finding.id, photoIndex, e.target.value)}
                              placeholder="Filename, angle, or evidence note"
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

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
                          {hasInspection ? <span style={(inspectionRecords.find((item) => item.intakeId === row.id)?.status === "Completed") ? styles.statusOk : styles.statusWarning}>{inspectionRecords.find((item) => item.intakeId === row.id)?.status === "Completed" ? "Completed" : "In Progress"}</span> : <span style={styles.statusInfo}>New</span>}
                        </div>
                        <div style={styles.queueLine}>{row.plateNumber || row.conductionNumber || "-"}</div>
                        <div style={styles.queueLineMuted}>{row.companyName || row.customerName || "-"}</div>
                        <div style={styles.queueLineMuted}>{[row.make, row.model, row.year].filter(Boolean).join("  |  ")}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        ) : null}

        {!selectedIntake ? (
          <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(8, isCompactLayout) }}>
            <Card
              title="Inspection Edit + History Lookup"
              subtitle="Search any prior inspection by plate, customer, company, or inspection number and reopen it for editing"
              right={<span style={styles.statusInfo}>{inspectionHistoryMatches.length} match(es)</span>}
            >
              {showDraftRestore ? (
                <div style={styles.sectionCardMuted}>
                  <div style={styles.mobileDataCardHeader}>
                    <div>
                      <div style={styles.sectionTitle}>Draft Recovery</div>
                      <div style={styles.formHint}>An unfinished inspection draft was recovered automatically.</div>
                    </div>
                    <span style={styles.statusWarning}>Recovered</span>
                  </div>
                  <div style={styles.inlineActions}>
                    <button type="button" style={styles.smallButtonMuted} onClick={() => setShowDraftRestore(false)}>Keep Draft</button>
                    <button type="button" style={styles.smallButtonDanger} onClick={() => { setSelectedIntakeId(""); setForm(getDefaultInspectionForm()); inspectionDraft.clearDraft(); setShowDraftRestore(false); }}>Discard Draft</button>
                  </div>
                </div>
              ) : null}
              <div style={styles.quickAccessRow}>
                <span>Draft Status</span>
                <strong>{inspectionDraft.draftState}</strong>
              </div>
              <div style={styles.formGroup}>
                <label style={styles.label}>History Search</label>
                <input
                  style={styles.input}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by plate, customer, company, inspection no., make, or concern"
                />
              </div>

              {!search.trim() ? (
                <div style={styles.formHint}>Select a vehicle from the queue or search older inspection records to reopen and edit them.</div>
              ) : inspectionHistoryMatches.length === 0 ? (
                <div style={styles.emptyState}>No inspection history found for this search.</div>
              ) : (
                <div style={styles.mobileCardList}>
                  {inspectionHistoryMatches.map((row) => (
                    <div key={row.id} style={styles.mobileDataCard}>
                      <div style={styles.mobileDataCardHeader}>
                        <strong>{row.inspectionNumber}</strong>
                        <InspectionStatusBadge status={row.status} />
                      </div>
                      <div style={styles.mobileDataPrimary}>{row.plateNumber || row.conductionNumber || "-"}</div>
                      <div style={styles.mobileDataSecondary}>{row.accountLabel}</div>
                      <div style={styles.mobileDataSecondary}>{[row.make, row.model, row.year].filter(Boolean).join(" ") || "-"}</div>
                      <div style={styles.mobileMetaRow}>
                        <span>Updated</span>
                        <strong>{formatDateTime(row.updatedAt)}</strong>
                      </div>
                      <div style={styles.inlineActions}>
                        <button type="button" style={styles.smallButton} onClick={() => setSelectedIntakeId(row.intakeId)}>
                          Edit Inspection
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        ) : null}

        <div style={{ ...styles.gridItem, gridColumn: !selectedIntake ? getResponsiveSpan(12, isCompactLayout) : "span 12" }}>
          <Card
            title="Inspection Form"
            subtitle="Safety first, tires second, under the hood always included, brakes triggered"
            right={selectedIntake ? (<div style={styles.inlineActions}><button type="button" style={styles.secondaryButton} onClick={() => { setSelectedIntakeId(""); setError(""); }}>Change Vehicle</button>{selectedInspection ? <button type="button" style={styles.smallButtonMuted} onClick={reopenInspection}>Reopen</button> : null}{selectedInspection ? <InspectionStatusBadge status={selectedInspection.status} /> : <span style={styles.statusNeutral}>Draft Seeded</span>}</div>) : (selectedInspection ? <InspectionStatusBadge status={selectedInspection.status} /> : <span style={styles.statusNeutral}>Draft Seeded</span>)}
          >
            {!selectedIntake ? (
              <div style={styles.emptyState}>Select an intake from the queue to start inspection.</div>
            ) : (
              <div style={styles.formStack}>
                <div style={styles.inspectionActionBanner}>
                  <div style={styles.inspectionActionSummary}>
                    <div style={styles.inspectionSummaryPill}><strong>{form.status}</strong><span>Current status</span></div>
                    <div style={styles.inspectionSummaryPill}><strong>{criticalFindingCount}</strong><span>Critical items</span></div>
                    <div style={styles.inspectionSummaryPill}><strong>{autoRecommendations.length}</strong><span>Auto recommendations</span></div>
                    <div style={styles.inspectionSummaryPill}><strong>{form.evidenceItems.length}</strong><span>Evidence files</span></div>
                  </div>
                  <div style={styles.inlineActions}>
                    <button type="button" style={styles.primaryButton} onClick={() => saveInspection()}>
                      Save Draft / Update
                    </button>
                    <button type="button" style={styles.smallButtonSuccess} onClick={() => saveInspection("Completed")}>
                      Save as Completed
                    </button>
                    {selectedInspection ? (
                      <button type="button" style={styles.smallButtonMuted} onClick={reopenInspection}>
                        Reopen Inspection
                      </button>
                    ) : null}
                  </div>
                </div>

                <div style={styles.sectionCardMuted}>
                  <div style={styles.sectionTitle}>Quick Section Navigation</div>
                  <div style={styles.formHint}>Jump to the active inspection sections below to reduce scrolling during encoding.</div>
                  <div style={styles.pillWrap}>
                    {inspectionQuickSections.map((section) => (
                      <button key={section.id} type="button" style={styles.pillButton} onClick={() => jumpToInspectionSection(section.id)}>
                        {section.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={styles.grid}>
                  <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(4, isCompactLayout) }}>
                    <div id="inspection-overview" style={{ ...styles.sectionCard, position: isCompactLayout ? "static" : "sticky", top: 16 }}>
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

                      {selectedInspection ? (
                        <div style={styles.sectionCardMuted}>
                          <div style={styles.sectionTitle}>Edit Mode</div>
                          <div style={styles.formHint}>
                            Editing {selectedInspection.inspectionNumber}  |  Created {formatDateTime(selectedInspection.createdAt)}  |  Last updated {formatDateTime(selectedInspection.updatedAt)}{selectedInspection.lastUpdatedBy ? ` by ${selectedInspection.lastUpdatedBy}` : ""}
                          </div>
                        </div>
                      ) : null}

                      {relatedInspectionHistory.length ? (
                        <div style={styles.sectionCardMuted}>
                          <div style={styles.sectionTitle}>Related Vehicle / Customer History</div>
                          <div style={styles.quickAccessList}>
                            {relatedInspectionHistory.map((row) => (
                              <div key={row.id} style={styles.quickAccessRow}>
                                <span>{row.inspectionNumber}  |  {row.plateNumber || row.conductionNumber || "-"}</span>
                                <strong>{formatDateTime(row.updatedAt)}</strong>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}

                      {error ? <div style={styles.errorBox}>{error}</div> : null}

                      <div style={isCompactLayout ? styles.stickyActionBar : styles.inlineActionsColumn}>
                        <button type="button" style={{ ...styles.primaryButton, width: "100%" }} onClick={() => saveInspection()}>
                          Save Draft / Update
                        </button>
                        <button type="button" style={{ ...styles.smallButtonSuccess, width: "100%" }} onClick={() => saveInspection("Completed")}>
                          Mark Complete
                        </button>
                        <button type="button" style={{ ...styles.secondaryButton, width: "100%" }} onClick={() => setForm(getDefaultInspectionForm())}>
                          Reset Working Form
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
                            checked={form.enableCoolingCheck}
                            onChange={(e) => setForm((prev) => ({ ...prev, enableCoolingCheck: e.target.checked }))}
                          />
                          <span>Enable Cooling System Check</span>
                        </label>
                        <label style={styles.checkboxTile}>
                          <input
                            type="checkbox"
                            checked={form.enableSteeringCheck}
                            onChange={(e) => setForm((prev) => ({ ...prev, enableSteeringCheck: e.target.checked }))}
                          />
                          <span>Enable Steering Check</span>
                        </label>
                        <label style={styles.checkboxTile}>
                          <input
                            type="checkbox"
                            checked={form.enableEnginePerformanceCheck}
                            onChange={(e) => setForm((prev) => ({ ...prev, enableEnginePerformanceCheck: e.target.checked }))}
                          />
                          <span>Enable Engine Performance Check</span>
                        </label>
                        <label style={styles.checkboxTile}>
                          <input
                            type="checkbox"
                            checked={form.enableRoadTestCheck}
                            onChange={(e) => setForm((prev) => ({ ...prev, enableRoadTestCheck: e.target.checked }))}
                          />
                          <span>Enable Road Test Check</span>
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
                        <div id="inspection-arrival" style={{ ...styles.sectionCard, marginTop: 16, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
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

                    <div id="inspection-underhood" style={styles.sectionCard}>
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



                      {form.enableCoolingCheck ? (
                        <div style={{ ...styles.sectionCard, marginTop: 16, background: "#eff6ff", border: "1px solid #bfdbfe" }}>
                          <div style={styles.sectionTitle}>Cooling System Inspection</div>
                          <div style={styles.formHint}>Use this trigger for overheating, coolant loss, fan concern, radiator issue, or cooling-system complaint.</div>

                          <div style={styles.formStack}>
                            {renderCheckCard(
                              "Cooling Components",
                              "Fan, radiator, pump, thermostat, and pressure-related checks",
                              [
                                ["Cooling Fan Operation", "coolingFanOperationState"],
                                ["Radiator Condition", "radiatorConditionState"],
                                ["Water Pump Condition", "waterPumpConditionState"],
                                ["Thermostat Condition", "thermostatConditionState"],
                                ["Overflow Reservoir", "overflowReservoirConditionState"],
                                ["Cooling System Pressure", "coolingSystemPressureState"],
                              ],
                              [["Cooling Notes", "coolingSystemNotes", "Overheating, coolant loss, fan not engaging, leaks, pressure issue"]]
                            )}
                          </div>
                        </div>
                      ) : null}

                      {form.enableSteeringCheck ? (
                        <div style={{ ...styles.sectionCard, marginTop: 16, background: "#f5f3ff", border: "1px solid #ddd6fe" }}>
                          <div style={styles.sectionTitle}>Steering Inspection</div>
                          <div style={styles.formHint}>Use this trigger for hard steering, pull, free play, steering noise, fluid leak, or EPS / pump concerns.</div>

                          <div style={styles.formStack}>
                            {renderCheckCard(
                              "Steering System",
                              "Play, assist, fluid, hose, column, and road feel",
                              [
                                ["Steering Wheel Play", "steeringWheelPlayState"],
                                ["Pump / EPS Motor", "steeringPumpMotorState"],
                                ["Steering Fluid Condition", "steeringFluidConditionState"],
                                ["Steering Hose / Line", "steeringHoseConditionState"],
                                ["Steering Column", "steeringColumnConditionState"],
                                ["Steering Road Feel", "steeringRoadFeelState"],
                              ],
                              [["Steering Notes", "steeringSystemNotes", "Hard steering, wandering, free play, leak, assist issue, noise"]]
                            )}
                          </div>
                        </div>
                      ) : null}

                      {form.enableEnginePerformanceCheck ? (
                        <div style={{ ...styles.sectionCard, marginTop: 16, background: "#fff7ed", border: "1px solid #fdba74" }}>
                          <div style={styles.sectionTitle}>Engine Performance Inspection</div>
                          <div style={styles.formHint}>Use this trigger for rough idle, weak power, misfire, smoke, hesitation, poor fuel economy, or drivability concerns.</div>

                          <div style={styles.formStack}>
                            {renderCheckCard(
                              "Engine Performance",
                              "Starting, idle, response, misfire, smoke, and economy-related checks",
                              [
                                ["Starting Performance", "engineStartingState"],
                                ["Idle Quality", "idleQualityState"],
                                ["Acceleration Response", "accelerationResponseState"],
                                ["Misfire / Combustion", "engineMisfireState"],
                                ["Smoke Condition", "engineSmokeState"],
                                ["Fuel Efficiency Concern", "fuelEfficiencyConcernState"],
                              ],
                              [["Engine Performance Notes", "enginePerformanceNotes", "Hard start, rough idle, hesitation, smoke color, power loss"]]
                            )}
                          </div>
                        </div>
                      ) : null}

                      {form.enableRoadTestCheck ? (
                        <div style={{ ...styles.sectionCard, marginTop: 16, background: "#ecfeff", border: "1px solid #a5f3fc" }}>
                          <div style={styles.sectionTitle}>Road Test Inspection</div>
                          <div style={styles.formHint}>Use this trigger for issues that only appear while driving, including noises, pull, brake feel, ride quality, and shift behavior.</div>

                          <div style={styles.formStack}>
                            {renderCheckCard(
                              "Road Test Findings",
                              "Noise, braking, steering tracking, ride quality, acceleration, and shift feel",
                              [
                                ["Noise While Driving", "roadTestNoiseState"],
                                ["Brake Feel", "roadTestBrakeFeelState"],
                                ["Steering Tracking", "roadTestSteeringTrackingState"],
                                ["Ride Quality", "roadTestRideQualityState"],
                                ["Acceleration Feel", "roadTestAccelerationState"],
                                ["Transmission Shift Feel", "roadTestTransmissionShiftState"],
                              ],
                              [["Road Test Notes", "roadTestNotes", "Pulling, vibration, clunk, delayed shift, harsh brake feel, rough ride"]]
                            )}
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
                      {[row.make, row.model, row.year, row.color].filter(Boolean).join("  |  ") || "-"}
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
                          <div style={styles.tableSecondary}>{[row.year, row.color, row.odometerKm && `${row.odometerKm} km`].filter(Boolean).join("  |  ")}</div>
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
  partsRequests,
  releaseRecords,
  approvalLinkTokens,
  autoPortalMessage,
  smsApprovalLogs,
  onGenerateSmsApprovalLink,
  onOpenDemoCustomerApprovalLink,
  onSendSmsTemplate,
  onRevokeApprovalLink,
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
  partsRequests: PartsRequestRecord[];
  releaseRecords: ReleaseRecord[];
  approvalLinkTokens: ApprovalLinkToken[];
  autoPortalMessage: string;
  smsApprovalLogs: SmsApprovalDispatchLog[];
  onGenerateSmsApprovalLink: (ro: RepairOrderRecord) => void;
  onOpenDemoCustomerApprovalLink: (ro: RepairOrderRecord) => void;
  onSendSmsTemplate: (payload: SmsSendPayload) => Promise<SmsSendResult>;
  onRevokeApprovalLink: (tokenId: string) => void;
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
  const smsProviderDefaults = getSmsProviderConfig();
  const [smsProviderMode, setSmsProviderMode] = useState<SmsProviderMode>(smsProviderDefaults.mode);
  const [smsAndroidGatewayUrl, setSmsAndroidGatewayUrl] = useState(smsProviderDefaults.gatewayUrl);
  const [smsAndroidGatewayApiKey, setSmsAndroidGatewayApiKey] = useState(smsProviderDefaults.authToken);
  const [smsAndroidSenderDeviceLabel, setSmsAndroidSenderDeviceLabel] = useState(smsProviderDefaults.senderDeviceLabel);
  const [smsTwilioAccountSid, setSmsTwilioAccountSid] = useState(smsProviderDefaults.twilioAccountSid);
  const [smsTwilioFromNumber, setSmsTwilioFromNumber] = useState(smsProviderDefaults.twilioFromNumber);
  const [smsProviderConfigFeedback, setSmsProviderConfigFeedback] = useState("");

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

  const selectedPartsRequests = useMemo(
    () =>
      selectedRO
        ? partsRequests
            .filter((row) => row.roId === selectedRO.id)
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        : [],
    [partsRequests, selectedRO]
  );

  const selectedReleaseRecord = useMemo(
    () =>
      selectedRO
        ? releaseRecords.find((row) => row.roId === selectedRO.id) ?? null
        : null,
    [releaseRecords, selectedRO]
  );

  const latestVehicleOdometerByKey = useMemo(() => {
    const latest = new Map<string, { date: string; odometerKm: string }>();
    const remember = (vehicleKey: string, date: string, odometerKm: string) => {
      const key = vehicleKey.trim();
      const odo = odometerKm.trim();
      if (!key || !odo) return;
      const existing = latest.get(key);
      if (!existing || date >= existing.date) {
        latest.set(key, { date, odometerKm: odo });
      }
    };

    intakeRecords.forEach((row) => {
      remember(normalizeVehicleKey(row.plateNumber, row.conductionNumber), row.updatedAt || row.createdAt, row.odometerKm);
    });

    repairOrders.forEach((row) => {
      remember(normalizeVehicleKey(row.plateNumber, row.conductionNumber), row.updatedAt || row.createdAt, row.odometerKm);
    });

    return latest;
  }, [intakeRecords, repairOrders]);

  const oilChangeReminders = useMemo(() => {
    const reminders: OilChangeReminder[] = [];

    repairOrders.forEach((ro) => {
      const vehicleKey = normalizeVehicleKey(ro.plateNumber, ro.conductionNumber);
      if (!vehicleKey) return;

      const oilChangeLines = ro.workLines.filter(isOilChangeServiceLine);
      if (!oilChangeLines.length) return;

      const latestLine = oilChangeLines
        .slice()
        .sort((a, b) => (b.completedAt || b.approvalAt || ro.updatedAt || ro.createdAt).localeCompare(a.completedAt || a.approvalAt || ro.updatedAt || ro.createdAt))[0];

      if (!latestLine) return;

      const serviceDate = latestLine.completedAt || latestLine.approvalAt || ro.updatedAt || ro.createdAt;
      const serviceOdometer = parseOdometerValue(ro.odometerKm);
      if (serviceOdometer == null) return;

      const oilType = inferOilChangeTypeFromText(
        latestLine.title,
        latestLine.customerDescription,
        latestLine.category,
        latestLine.notes,
        ro.customerConcern
      );
      const policy = getOilChangePolicy(oilType);
      const dueDate = addMonthsToDate(serviceDate, policy.months);
      const currentOdometer = parseOdometerValue(latestVehicleOdometerByKey.get(vehicleKey)?.odometerKm ?? ro.odometerKm) ?? serviceOdometer;
      const dueOdometerKm = serviceOdometer + policy.kilometers;
      const dueByDate = Date.now() >= dueDate.getTime();
      const dueByDistance = currentOdometer >= dueOdometerKm;
      const reminderDue = dueByDate || dueByDistance;

      reminders.push({
        vehicleKey,
        roId: ro.id,
        roNumber: ro.roNumber,
        customerName: ro.accountLabel || ro.customerName || "Customer",
        vehicleLabel: [ro.make, ro.model, ro.year].filter(Boolean).join(" ") || ro.plateNumber || ro.conductionNumber || "Vehicle",
        plateNumber: ro.plateNumber || "",
        conductionNumber: ro.conductionNumber || "",
        oilType,
        serviceDate,
        serviceOdometerKm: ro.odometerKm,
        currentOdometerKm: String(currentOdometer),
        dueDate: dueDate.toISOString(),
        dueOdometerKm,
        isDue: reminderDue,
        dueReason: reminderDue
          ? dueByDate && dueByDistance
            ? `Due by date and mileage`
            : dueByDate
              ? `Due by date`
              : `Due by mileage`
          : `Due on ${formatDateTime(dueDate.toISOString())} or at ${dueOdometerKm.toLocaleString()} km`,
        sourceLineTitle: latestLine.title || "Oil Change",
        sourceLineNotes: latestLine.notes || latestLine.customerDescription || "",
      });
    });

    return reminders.sort((a, b) => Number(b.isDue) - Number(a.isDue) || b.serviceDate.localeCompare(a.serviceDate));
  }, [latestVehicleOdometerByKey, repairOrders]);

  const releaseFollowUpReminders = useMemo(() => {
    const reminders: ReleaseFollowUpReminder[] = [];
    const latestReleaseByRoId = new Map<string, ReleaseRecord>();

    releaseRecords.forEach((row) => {
      const existing = latestReleaseByRoId.get(row.roId);
      if (!existing || row.createdAt > existing.createdAt) {
        latestReleaseByRoId.set(row.roId, row);
      }
    });

    latestReleaseByRoId.forEach((release) => {
      const ro = repairOrders.find((row) => row.id === release.roId);
      if (!ro || ro.status !== "Released") return;

      const vehicleKey = normalizeVehicleKey(ro.plateNumber, ro.conductionNumber);
      if (!vehicleKey) return;

      const releaseDate = release.createdAt || ro.updatedAt || ro.createdAt;
      const dueDate = addDaysToDate(releaseDate, 3);
      if (Number.isNaN(dueDate.getTime())) return;

      const hasNewerJob = repairOrders.some(
        (candidate) =>
          candidate.id !== ro.id &&
          normalizeVehicleKey(candidate.plateNumber, candidate.conductionNumber) === vehicleKey &&
          candidate.createdAt > releaseDate
      );
      if (hasNewerJob) return;

      const isDue = Date.now() >= dueDate.getTime();

      reminders.push({
        vehicleKey,
        roId: ro.id,
        roNumber: ro.roNumber,
        releaseNumber: release.releaseNumber,
        customerName: ro.accountLabel || ro.customerName || "Customer",
        vehicleLabel: [ro.make, ro.model, ro.year].filter(Boolean).join(" ") || ro.plateNumber || ro.conductionNumber || "Vehicle",
        plateNumber: ro.plateNumber || "",
        conductionNumber: ro.conductionNumber || "",
        releaseDate,
        dueDate: dueDate.toISOString(),
        isDue,
        dueReason: isDue
          ? "Due now"
          : `Available on ${formatDateTime(dueDate.toISOString())}`,
      });
    });

    return reminders.sort((a, b) => Number(b.isDue) - Number(a.isDue) || b.releaseDate.localeCompare(a.releaseDate));
  }, [repairOrders, releaseRecords]);

  const [selectedOilReminderVehicleKey, setSelectedOilReminderVehicleKey] = useState("");
  const [selectedFollowUpVehicleKey, setSelectedFollowUpVehicleKey] = useState("");

  const activeOilChangeReminder = useMemo(
    () => {
      if (selectedOilReminderVehicleKey) {
        return oilChangeReminders.find((reminder) => reminder.vehicleKey === selectedOilReminderVehicleKey) ?? oilChangeReminders[0] ?? null;
      }
      if (selectedRO) {
        return oilChangeReminders.find((reminder) => reminder.roId === selectedRO.id) ?? oilChangeReminders[0] ?? null;
      }
      return oilChangeReminders[0] ?? null;
    },
    [oilChangeReminders, selectedOilReminderVehicleKey, selectedRO]
  );

  const activeReleaseFollowUpReminder = useMemo(
    () => {
      if (selectedFollowUpVehicleKey) {
        return releaseFollowUpReminders.find((reminder) => reminder.vehicleKey === selectedFollowUpVehicleKey) ?? releaseFollowUpReminders[0] ?? null;
      }
      if (selectedRO) {
        return releaseFollowUpReminders.find((reminder) => reminder.roId === selectedRO.id) ?? releaseFollowUpReminders[0] ?? null;
      }
      return releaseFollowUpReminders[0] ?? null;
    },
    [releaseFollowUpReminders, selectedFollowUpVehicleKey, selectedRO]
  );

  const activeApprovalLinkToken = useMemo(
    () => (selectedRO ? getLatestActiveApprovalLinkForRo(approvalLinkTokens, selectedRO.id) : null),
    [approvalLinkTokens, selectedRO]
  );

  const selectedROInspection = useMemo(
    () =>
      selectedRO
        ? inspectionRecords.find((row) => row.id === selectedRO.inspectionId) ??
          inspectionRecords.find((row) => row.intakeId === selectedRO.intakeId) ??
          null
        : null,
    [inspectionRecords, selectedRO]
  );

  const findingRecommendations = useMemo<FindingToRORecommendation[]>(() => {
    if (!selectedROInspection || !selectedRO) return [];
    const mappedSourceIds = new Set(
      selectedRO.workLines
        .map((line) => line.recommendationSource || "")
        .filter((value) => value.startsWith("Finding:"))
        .map((value) => value.replace("Finding:", ""))
    );
    return buildFindingToRORecommendations(selectedROInspection).map((item) => {
      const existingDecision = selectedRO.findingRecommendationDecisions.find((entry) => entry.recommendationId === item.id);
      const decision = existingDecision?.decision ?? (mappedSourceIds.has(item.id) ? "Approved" : "Pending");
      const decidedAt = existingDecision?.decidedAt ?? "";
      return {
        ...item,
        decision: toApprovalDecision(decision),
        decidedAt,
      };
    });
  }, [selectedRO, selectedROInspection]);

  const pendingFindingRecommendations = findingRecommendations.filter((item) => item.decision === "Pending");
  const approvedFindingRecommendations = findingRecommendations.filter((item) => item.decision === "Approved");
  const declinedFindingRecommendations = findingRecommendations.filter((item) => item.decision === "Declined");
  const deferredFindingRecommendations = findingRecommendations.filter((item) => item.decision === "Deferred");

  const approvedWorkLines = selectedRO ? selectedRO.workLines.filter((line) => line.approvalDecision === "Approved") : [];
  const declinedWorkLines = selectedRO ? selectedRO.workLines.filter((line) => line.approvalDecision === "Declined") : [];
  const deferredWorkLines = selectedRO ? selectedRO.workLines.filter((line) => line.approvalDecision === "Deferred") : [];
  const pendingWorkLines = selectedRO ? selectedRO.workLines.filter((line) => (line.approvalDecision ?? "Pending") === "Pending") : [];
  const approvedCategorySummary = selectedRO ? buildApprovalCategorySummary(approvedWorkLines) : [];

  const approvedEstimateTotal = approvedWorkLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0);
  const pendingEstimateTotal = pendingWorkLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0);
  const declinedEstimateTotal = declinedWorkLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0);
  const deferredEstimateTotal = deferredWorkLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0);

  const approvalPendingCount = pendingWorkLines.length + pendingFindingRecommendations.length;
  const totalApprovedCount = approvedWorkLines.length + approvedFindingRecommendations.length;
  const totalDeclinedCount = declinedWorkLines.length + declinedFindingRecommendations.length;
  const totalDeferredCount = deferredWorkLines.length + deferredFindingRecommendations.length;
  const canAdvanceToWork = approvalPendingCount === 0 && approvedWorkLines.length > 0;

  const customerApprovalMessage = useMemo(
    () => buildCustomerApprovalMessage(selectedRO),
    [selectedRO]
  );

  const [notificationTemplateKey, setNotificationTemplateKey] = useState<CustomerNotificationTemplateKey>("approval-request");
  const [sendingSmsKey, setSendingSmsKey] = useState<CustomerNotificationTemplateKey | "">("");
  const [smsSendFeedback, setSmsSendFeedback] = useState("");

  const customerNotificationTemplates = useMemo(
    () =>
      buildCustomerNotificationTemplates({
        ro: selectedRO,
        inspection: selectedROInspection,
        approvalRecord: selectedApproval,
        approvalLinkToken: activeApprovalLinkToken,
        oilReminder: activeOilChangeReminder,
        followUpReminder: activeReleaseFollowUpReminder,
        partsRequests: selectedPartsRequests,
        releaseRecord: selectedReleaseRecord,
        backjobRecord: selectedBackjobs[0] ?? null,
      }),
    [activeApprovalLinkToken, activeOilChangeReminder, activeReleaseFollowUpReminder, selectedApproval, selectedBackjobs, selectedPartsRequests, selectedRO, selectedROInspection, selectedReleaseRecord]
  );

  const activeCustomerNotificationTemplate =
    customerNotificationTemplates.find((template) => template.key === notificationTemplateKey) ?? customerNotificationTemplates[0] ?? null;
  const notificationPreviewRoNumber =
    activeCustomerNotificationTemplate?.key === "oil-reminder" && activeOilChangeReminder
      ? activeOilChangeReminder.roNumber
      : activeCustomerNotificationTemplate?.key === "follow-up" && activeReleaseFollowUpReminder
        ? activeReleaseFollowUpReminder.roNumber
      : selectedRO?.roNumber ?? "";
  const notificationPreviewVehicleLabel =
    activeCustomerNotificationTemplate?.key === "oil-reminder" && activeOilChangeReminder
      ? activeOilChangeReminder.vehicleLabel
      : activeCustomerNotificationTemplate?.key === "follow-up" && activeReleaseFollowUpReminder
        ? activeReleaseFollowUpReminder.vehicleLabel
      : [selectedRO?.make, selectedRO?.model, selectedRO?.year].filter(Boolean).join(" ") || selectedRO?.plateNumber || selectedRO?.conductionNumber || "-";
  const notificationPreviewCustomerName =
    activeCustomerNotificationTemplate?.key === "oil-reminder" && activeOilChangeReminder
      ? activeOilChangeReminder.customerName
      : activeCustomerNotificationTemplate?.key === "follow-up" && activeReleaseFollowUpReminder
        ? activeReleaseFollowUpReminder.customerName
      : selectedRO?.accountLabel ?? "";
  const notificationPreviewPhoneNumber = selectedRO?.phone || "";
  const activeCustomerNotificationTemplateSendable = useMemo(() => {
    if (!activeCustomerNotificationTemplate || !selectedRO) return false;
    if (!notificationPreviewPhoneNumber.trim()) return false;
    if (activeCustomerNotificationTemplate.key === "approval-request") return !!activeApprovalLinkToken;
    if (activeCustomerNotificationTemplate.key === "oil-reminder") return !!activeOilChangeReminder?.isDue;
    if (activeCustomerNotificationTemplate.key === "follow-up") return !!activeReleaseFollowUpReminder?.isDue;
    return true;
  }, [
    activeApprovalLinkToken,
    activeCustomerNotificationTemplate,
    activeOilChangeReminder,
    activeReleaseFollowUpReminder,
    notificationPreviewPhoneNumber,
    selectedRO,
  ]);

  const activeCustomerNotificationSmsPayload = useMemo<SmsSendPayload | null>(() => {
    if (!selectedRO || !activeCustomerNotificationTemplate || !activeCustomerNotificationTemplateSendable) return null;
    return {
      roId: selectedRO.id,
      roNumber: notificationPreviewRoNumber,
      customerId: "",
      customerName: notificationPreviewCustomerName,
      phoneNumber: notificationPreviewPhoneNumber,
      tokenId: activeApprovalLinkToken?.id ?? "",
      messageType: activeCustomerNotificationTemplate.key,
      messageBody: activeCustomerNotificationTemplate.body,
    };
  }, [
    activeApprovalLinkToken,
    activeCustomerNotificationTemplate,
    activeCustomerNotificationTemplateSendable,
    notificationPreviewCustomerName,
    notificationPreviewPhoneNumber,
    notificationPreviewRoNumber,
    selectedRO,
  ]);
  const smsProviderConfig = getSmsProviderConfig();
  const recentSmsAttempts = useMemo(
    () =>
      (selectedRO
        ? smsApprovalLogs.filter((row) => row.roId === selectedRO.id)
        : smsApprovalLogs
      ).slice(0, 5),
    [smsApprovalLogs, selectedRO]
  );

  const saveSmsProviderSettings = () => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(STORAGE_KEYS.smsProviderMode, smsProviderMode);
      window.localStorage.setItem(STORAGE_KEYS.smsAndroidGatewayUrl, smsAndroidGatewayUrl.trim());
      window.localStorage.setItem(STORAGE_KEYS.smsAndroidGatewayApiKey, smsAndroidGatewayApiKey.trim());
      window.localStorage.setItem(STORAGE_KEYS.smsAndroidSenderDeviceLabel, smsAndroidSenderDeviceLabel.trim());
      window.localStorage.setItem(STORAGE_KEYS.smsTwilioAccountSid, smsTwilioAccountSid.trim());
      window.localStorage.setItem(STORAGE_KEYS.smsTwilioFromNumber, smsTwilioFromNumber.trim());
      setSmsProviderConfigFeedback(
        smsProviderMode === "android"
          ? smsAndroidGatewayUrl.trim()
            ? "Android SMS gateway settings saved."
            : "Android SMS gateway is not configured yet. Save the URL to enable sending."
          : smsProviderMode === "twilio"
            ? smsTwilioAccountSid.trim() && smsTwilioFromNumber.trim()
              ? "Twilio settings saved."
              : "Twilio settings are incomplete."
            : "Simulated SMS mode selected."
      );
    } catch {
      setSmsProviderConfigFeedback("SMS provider settings could not be saved in this browser.");
    }
  };

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

  const roSummary = useMemo(
    () => ({
      total: sortedRepairOrders.length,
      waitingApproval: sortedRepairOrders.filter((row) => row.status === "Waiting Approval").length,
      inProgress: sortedRepairOrders.filter((row) => row.status === "In Progress").length,
      readyRelease: sortedRepairOrders.filter((row) => row.status === "Ready Release").length,
    }),
    [sortedRepairOrders]
  );

  const selectedROEstimateTotal = selectedRO
    ? selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0)
    : 0;

  const selectedROApprovedCount = selectedRO
    ? selectedRO.workLines.filter((line) => line.approvalDecision === "Approved").length
    : 0;

  const selectedROPendingCount = selectedRO
    ? selectedRO.workLines.filter((line) => (line.approvalDecision ?? "Pending") === "Pending").length
    : 0;

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
      findingRecommendationDecisions: [],
      encodedBy: currentUser.fullName,
      updatedBy: "",
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { roNumber: _rn, createdAt: _ca, encodedBy: _eb, ...safePatch } = patch as RepairOrderRecord;
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === id
          ? { ...row, ...safePatch, updatedAt: new Date().toISOString(), updatedBy: currentUser.fullName }
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
          updatedBy: currentUser.fullName,
          workLines: row.workLines.map((line) => {
            if (line.id !== lineId) return line;

            const approvalState = line.approvalDecision ?? "Pending";
            const isLockedByApproval = approvalState === "Approved";
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

            if (field === "status" && approvalState !== "Approved" && value !== "Pending") {
              return {
                ...line,
                status: "Pending",
              };
            }

            if (field === "status" && value === "Completed" && line.status === "Waiting Parts") {
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
              updatedBy: currentUser.fullName,
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
              updatedBy: currentUser.fullName,
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

  const setFindingRecommendationDecision = (recommendation: FindingToRORecommendation, decision: "Approved" | "Declined" | "Deferred") => {
    if (!selectedRO) return;
    const now = new Date().toISOString();
    const existingLine = selectedRO.workLines.find(
      (line) => line.sourceRecommendationId === recommendation.id || line.recommendationSource === `Finding:${recommendation.id}`
    );

    setRepairOrders((prev) =>
      prev.map((row) => {
        if (row.id !== selectedRO.id) return row;

        const nextDecisions: FindingRecommendationDecision[] = [
          ...row.findingRecommendationDecisions.filter((item) => item.recommendationId !== recommendation.id),
          {
            recommendationId: recommendation.id,
            title: recommendation.title,
            category: recommendation.category,
            decision,
            decidedAt: now,
            note: recommendation.note,
          },
        ];

        let nextWorkLines = row.workLines;
        if (decision === "Approved" && !existingLine) {
          nextWorkLines = [
            ...row.workLines,
            recalculateWorkLine({
              ...getEmptyWorkLine(),
              id: uid("wl"),
              title: recommendation.workLineTitle,
              category: recommendation.category,
              priority: recommendation.status === "Replace" ? "High" : "Medium",
              status: "Pending",
              notes: [recommendation.note, ...recommendation.photoNotes].filter(Boolean).join(" | "),
              customerDescription: `${recommendation.category}: ${recommendation.workLineTitle}. ${recommendation.note || "Customer-approved recommended work."}`.trim(),
              recommendationSource: `Finding:${recommendation.id}`,
              sourceRecommendationId: recommendation.id,
              approvalDecision: "Approved",
              approvalAt: now,
            }),
          ];
        }

        return {
          ...row,
          status:
            decision === "Approved" && ["Draft", "Waiting Inspection", "Waiting Approval"].includes(row.status)
              ? "Approved / Ready to Work"
              : row.status,
          findingRecommendationDecisions: nextDecisions,
          workLines: nextWorkLines,
          updatedAt: now,
        };
      })
    );

    const approvalRecord: ApprovalRecord = {
      id: uid("apr"),
      approvalNumber: nextDailyNumber("APR"),
      roId: selectedRO.id,
      roNumber: selectedRO.roNumber,
      createdAt: now,
      decidedBy: currentUser.fullName,
      customerName: selectedRO.accountLabel,
      customerContact: selectedRO.phone || selectedRO.email || "-",
      summary: `${decision} finding recommendation: ${recommendation.title}`,
      communicationHook: approvalCommHook.trim() || "SMS / Email placeholder",
      items: [
        {
          workLineId: existingLine?.id || `finding:${recommendation.id}`,
          title: recommendation.workLineTitle,
          decision,
          approvedAt: now,
          note: recommendation.note,
        },
      ],
    };
    setApprovalRecords((prev) => [approvalRecord, ...prev]);
  };

  const setBulkFindingRecommendationDecision = (decision: "Approved" | "Declined" | "Deferred") => {
    pendingFindingRecommendations.forEach((item) => {
      setFindingRecommendationDecision(item, decision);
    });
  };

  const handleROStatusChange = (nextStatus: ROStatus) => {
    if (!selectedRO) return;
    const lockedStatuses: ROStatus[] = [
      "Approved / Ready to Work",
      "In Progress",
      "Waiting Parts",
      "Quality Check",
      "Ready Release",
      "Released",
      "Closed",
    ];

    if (lockedStatuses.includes(nextStatus) && !canAdvanceToWork) {
      setError("RO cannot advance to work until all approvals are decided and at least one work line is approved.");
      return;
    }

    const allowedTransitions: Partial<Record<ROStatus, ROStatus[]>> = {
      "Draft": ["Waiting Inspection", "Approved / Ready to Work"],
      "Waiting Inspection": ["Waiting Approval", "Approved / Ready to Work"],
      "Waiting Approval": ["Approved / Ready to Work"],
      "Approved / Ready to Work": ["In Progress", "Pulled Out"],
      "In Progress": ["Waiting Parts", "Quality Check", "Pulled Out"],
      "Waiting Parts": ["In Progress", "Pulled Out"],
      "Quality Check": ["Ready Release", "In Progress"],
      "Ready Release": ["Released", "Pulled Out"],
      "Released": ["Closed"],
      "Pulled Out": [],
      "Closed": [],
    };
    if (!(allowedTransitions[selectedRO.status] ?? []).includes(nextStatus)) {
      setError(`Cannot transition from "${selectedRO.status}" to "${nextStatus}".`);
      return;
    }

    if (nextStatus === "Quality Check") {
      const approvedLines = selectedRO.workLines.filter(
        (l) => l.approvalDecision !== "Declined" && l.approvalDecision !== "Deferred"
      );
      if (approvedLines.length === 0 || !approvedLines.every((l) => l.status === "Completed")) {
        setError("All approved work lines must be completed before moving to Quality Check.");
        return;
      }
    }

    updateRO(selectedRO.id, {
      status: nextStatus,
      workStartedAt:
        nextStatus === "In Progress" && !selectedRO.workStartedAt
          ? new Date().toISOString()
          : selectedRO.workStartedAt,
    });
    setError("");
  };

  const createBackjob = () => {
    if (!selectedRO || !backjobComplaint.trim()) return;
    const record: BackjobRecord = {
      id: uid("bjb"),
      backjobNumber: nextDailyNumber("BJB"),
      linkedRoId: selectedRO.id,
      linkedRoNumber: selectedRO.roNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      plateNumber: selectedRO.plateNumber || selectedRO.conductionNumber,
      customerLabel: selectedRO.accountLabel,
      originalInvoiceNumber: "",
      comebackInvoiceNumber: "",
      originalPrimaryTechnicianId: selectedRO.primaryTechnicianId || "",
      comebackPrimaryTechnicianId: "",
      supportingTechnicianIds: [],
      complaint: backjobComplaint.trim(),
      findings: "",
      rootCause: backjobRootCause.trim(),
      responsibility: backjobOutcome,
      actionTaken: "",
      resolutionNotes: backjobResolutionNotes.trim(),
      status: "Open",
      createdBy: currentUser.fullName,
    };
    setBackjobRecords((prev) => [record, ...prev]);
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === selectedRO.id ? { ...row, backjobReferenceRoId: record.id, updatedAt: new Date().toISOString(), updatedBy: currentUser.fullName } : row
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
                        {row.intakeNumber}  |  {row.plateNumber || row.conductionNumber || "No Plate"}  |  {row.companyName || row.customerName || "Unknown"}
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

                        <div style={styles.formGroup}>
                          <label style={styles.label}>Customer Description</label>
                          <textarea style={styles.textarea} value={line.customerDescription} onChange={(e) => updateDraftLine(line.id, "customerDescription", e.target.value)} placeholder="Customer-facing explanation for approval preview" />
                        </div>

                        <div style={isCompactLayout ? styles.formStack : styles.formGrid4}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Labor Hours</label>
                            <input style={styles.input} value={line.laborHours} onChange={(e) => updateDraftLine(line.id, "laborHours", e.target.value)} placeholder="e.g. 1.5" />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Labor Rate</label>
                            <input style={styles.input} value={line.laborRate} onChange={(e) => updateDraftLine(line.id, "laborRate", e.target.value)} placeholder="PHP per hour" />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Parts Cost</label>
                            <input style={styles.input} value={line.partsCost} onChange={(e) => updateDraftLine(line.id, "partsCost", e.target.value)} placeholder="Internal / base parts cost" />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Markup %</label>
                            <input style={styles.input} value={line.partsMarkupPercent} onChange={(e) => updateDraftLine(line.id, "partsMarkupPercent", e.target.value)} placeholder="e.g. 25" />
                          </div>
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
                          {user.fullName}  |  {user.role}
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
                          <span>{user.fullName}  |  {user.role}</span>
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
                    {row.status === "Ready Release" ? (
                      <div style={{ ...styles.statusOk, marginTop: 4, fontSize: 11, padding: "2px 6px" }}>Ready for Release</div>
                    ) : null}
                    {row.workLines.some((l) => l.status === "Waiting Parts") ? (
                      <div style={{ ...styles.statusWarning, marginTop: 4, fontSize: 11, padding: "2px 6px" }}>
                        Waiting Parts ({row.workLines.filter((l) => l.status === "Waiting Parts").length})
                      </div>
                    ) : null}
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
                  <div style={styles.inlineActions}>
                    <button
                      type="button"
                      style={styles.smallButtonMuted}
                      onClick={() => printTextDocument(`Repair Order ${selectedRO.roNumber}`, buildRepairOrderExportText(selectedRO, users))}
                    >
                      Print RO
                    </button>
                    <button
                      type="button"
                      style={styles.smallButtonSuccess}
                      onClick={() => printCustomerSummary(selectedRO)}
                    >
                      Print Summary
                    </button>
                    <button
                      type="button"
                      style={styles.smallButton}
                      onClick={() => downloadTextFile(`${selectedRO.roNumber}_repair_order.txt`, buildRepairOrderExportText(selectedRO, users))}
                    >
                      Export RO
                    </button>
                    <ROStatusBadge status={selectedRO.status} />
                  </div>
                </div>

                <div style={styles.summaryPanel}>
                  <div style={styles.summaryGrid}>
                    <div><strong>Account:</strong> {selectedRO.accountLabel}</div>
                    <div><strong>Plate:</strong> {selectedRO.plateNumber || "-"}</div>
                    <div><strong>Conduction:</strong> {selectedRO.conductionNumber || "-"}</div>
                    <div><strong>Vehicle:</strong> {[selectedRO.make, selectedRO.model, selectedRO.year].filter(Boolean).join(" ") || "-"}</div>
                    <div><strong>Intake No.:</strong> {selectedRO.intakeNumber || "Manual"}</div>
                    <div><strong>Inspection No.:</strong> {selectedRO.inspectionNumber || "None"}</div>
                    <div><strong>Total Estimate:</strong> {formatCurrency(selectedROEstimateTotal)}</div>
                    <div><strong>Approved Lines:</strong> {selectedROApprovedCount}</div>
                    <div><strong>Pending Lines:</strong> {selectedROPendingCount}</div>
                    <div><strong>Primary Tech:</strong> {selectedRO.primaryTechnicianId ? users.find((user) => user.id === selectedRO.primaryTechnicianId)?.fullName || "Assigned" : "Unassigned"}</div>
                  </div>
                  <div style={styles.concernBanner}>
                    <strong>Concern:</strong> {selectedRO.customerConcern}
                  </div>
                </div>

                {selectedRO.status === "Ready Release" ? (
                  <div style={{ ...styles.statusOk, marginBottom: 8 }}>
                    This RO is ready for release. Proceed to the Release module to complete the handover.
                  </div>
                ) : null}
                {selectedRO.workLines.some((l) => l.status === "Waiting Parts") ? (
                  <div style={{ ...styles.statusWarning, marginBottom: 8 }}>
                    Waiting Parts  -  {selectedRO.workLines.filter((l) => l.status === "Waiting Parts").map((l) => l.title || "Untitled").join(", ")}
                  </div>
                ) : null}

                <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>RO Status</label>
                    <select
                      style={styles.select}
                      value={selectedRO.status}
                      onChange={(e) => handleROStatusChange(e.target.value as ROStatus)}
                    >
                      <option value="Draft">Draft</option>
                      <option value="Waiting Inspection">Waiting Inspection</option>
                      <option value="Waiting Approval">Waiting Approval</option>
                      <option value="Approved / Ready to Work" disabled={!canAdvanceToWork && selectedRO.status !== "Approved / Ready to Work"}>Approved / Ready to Work</option>
                      <option value="In Progress" disabled={!canAdvanceToWork && selectedRO.status !== "In Progress"}>In Progress</option>
                      <option value="Waiting Parts" disabled={!canAdvanceToWork && selectedRO.status !== "Waiting Parts"}>Waiting Parts</option>
                      <option value="Quality Check" disabled={!canAdvanceToWork && selectedRO.status !== "Quality Check"}>Quality Check</option>
                      <option value="Ready Release" disabled={!canAdvanceToWork && selectedRO.status !== "Ready Release"}>Ready Release</option>
                      <option value="Released" disabled={!canAdvanceToWork && selectedRO.status !== "Released"}>Released</option>
                      <option value="Closed" disabled={!canAdvanceToWork && selectedRO.status !== "Closed"}>Closed</option>
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
                          {user.fullName}  |  {user.role}
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
                  <div><strong>Approval Lock:</strong> {canAdvanceToWork ? "Ready to advance" : "Blocked until all decisions are complete"}</div>
                  <div><strong>Approved Line Total:</strong> {formatCurrency(approvedEstimateTotal)}</div>
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

                  <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                    <div style={styles.mobileDataCardHeader}>
                      <div>
                        <div style={styles.sectionTitle}>SMS Provider Settings</div>
                        <div style={styles.formHint}>Choose a provider and store gateway credentials locally for the demo send flow.</div>
                      </div>
                      <span style={smsProviderConfig.isConfigured ? styles.statusOk : styles.statusWarning}>
                        {smsProviderConfig.provider}
                      </span>
                    </div>
                    <div style={styles.formStack}>
                      <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Provider Mode</label>
                          <select style={styles.select} value={smsProviderMode} onChange={(e) => setSmsProviderMode(e.target.value as SmsProviderMode)}>
                            <option value="simulated">Simulated</option>
                            <option value="android">Android SMS Gateway</option>
                            <option value="twilio">Twilio</option>
                          </select>
                        </div>
                        <div style={styles.formGroup}>
                          <label style={styles.label}>Provider State</label>
                          <div style={styles.concernCard}>
                            {smsProviderConfig.provider} {smsProviderConfig.isConfigured ? `(${smsProviderConfig.endpointLabel})` : "(not configured)"}
                          </div>
                        </div>
                      </div>

                      {smsProviderMode === "android" ? (
                        <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Gateway URL</label>
                            <input
                              style={styles.input}
                              value={smsAndroidGatewayUrl}
                              onChange={(e) => setSmsAndroidGatewayUrl(e.target.value)}
                              placeholder="https://gateway.example.com/send"
                            />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>API Key / Auth Token</label>
                            <input
                              style={styles.input}
                              value={smsAndroidGatewayApiKey}
                              onChange={(e) => setSmsAndroidGatewayApiKey(e.target.value)}
                              placeholder="Optional auth token"
                            />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Sender Device Label</label>
                            <input
                              style={styles.input}
                              value={smsAndroidSenderDeviceLabel}
                              onChange={(e) => setSmsAndroidSenderDeviceLabel(e.target.value)}
                              placeholder="Front Desk Android"
                            />
                          </div>
                        </div>
                      ) : smsProviderMode === "twilio" ? (
                        <div style={isCompactLayout ? styles.formStack : styles.formGrid2}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Account SID</label>
                            <input
                              style={styles.input}
                              value={smsTwilioAccountSid}
                              onChange={(e) => setSmsTwilioAccountSid(e.target.value)}
                              placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            />
                          </div>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>From Number</label>
                            <input
                              style={styles.input}
                              value={smsTwilioFromNumber}
                              onChange={(e) => setSmsTwilioFromNumber(e.target.value)}
                              placeholder="+63..."
                            />
                          </div>
                        </div>
                      ) : (
                        <div style={styles.formHint}>Simulated mode keeps the send flow local while the provider integration is being prepared.</div>
                      )}

                      <div style={styles.inlineActions}>
                        <button type="button" style={styles.smallButtonSuccess} onClick={saveSmsProviderSettings}>
                          Save Gateway Settings
                        </button>
                        <button
                          type="button"
                          style={styles.smallButtonMuted}
                          onClick={() => {
                            setSmsProviderMode("simulated");
                            setSmsProviderConfigFeedback("Simulated SMS mode selected.");
                            window.localStorage.setItem(STORAGE_KEYS.smsProviderMode, "simulated");
                          }}
                        >
                          Use Simulated
                        </button>
                      </div>

                      {smsProviderConfigFeedback ? <div style={styles.concernCard}>{smsProviderConfigFeedback}</div> : null}
                    </div>
                  </div>

                  <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                    <div style={styles.mobileDataCardHeader}>
                      <div>
                        <div style={styles.sectionTitle}>SMS Approval Link System</div>
                        <div style={styles.formHint}>Generate a secure customer portal link for this RO. Password login still works, but this link enables one-tap access from text.</div>
                      </div>
                      <div style={styles.inlineActions}>
                        <button type="button" style={styles.smallButtonSuccess} onClick={() => onGenerateSmsApprovalLink(selectedRO)}>
                          {activeApprovalLinkToken ? "Regenerate Customer Link" : "Generate Customer Link"}
                        </button>
                        <button type="button" style={styles.smallButton} onClick={() => onOpenDemoCustomerApprovalLink(selectedRO)}>
                          Open Demo Approval View
                        </button>
                      </div>
                    </div>
                    {autoPortalMessage ? <div style={styles.concernCard}>{autoPortalMessage}</div> : null}
                    <div style={styles.mobileCardList}>
                      {approvalLinkTokens.filter((row) => row.roId === selectedRO.id).slice(0, 3).map((row) => (
                        <div key={row.id} style={styles.mobileDataCard}>
                          <div style={styles.mobileDataCardHeader}>
                            <strong>{row.channel} Link</strong>
                            <span style={row.revokedAt ? styles.statusLocked : isApprovalLinkActive(row) ? styles.statusOk : styles.statusWarning}>
                              {row.revokedAt ? "Revoked" : isApprovalLinkActive(row) ? "Active" : "Expired"}
                            </span>
                          </div>
                          <div style={styles.formHint}>URL: {buildCustomerApprovalLinkUrl(row.token)}</div>
                          <div style={styles.formHint}>Expires: {formatDateTime(row.expiresAt)}  |  Last opened: {row.lastUsedAt ? formatDateTime(row.lastUsedAt) : "Not yet used"}</div>
                          {!row.revokedAt ? (
                            <div style={styles.inlineActions}>
                              <button
                                type="button"
                                style={styles.smallButton}
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(buildCustomerApprovalLinkUrl(row.token));
                                  } catch {
                                    // Clipboard fallback not required for this demo UI.
                                  }
                                }}
                              >
                                Copy Link
                              </button>
                              <button type="button" style={styles.smallButtonDanger} onClick={() => onRevokeApprovalLink(row.id)}>Revoke Link</button>
                            </div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                    <div style={styles.mobileDataCardHeader}>
                      <div>
                        <div style={styles.sectionTitle}>Oil Change Reminders</div>
                        <div style={styles.formHint}>Latest valid oil change per vehicle. Conventional: 6 months or 5,000 km. Fully synthetic: 12 months or 10,000 km.</div>
                      </div>
                      <span style={oilChangeReminders.some((row) => row.isDue) ? styles.statusWarning : styles.statusOk}>
                        {oilChangeReminders.filter((row) => row.isDue).length} Due
                      </span>
                    </div>

                    {oilChangeReminders.length === 0 ? (
                      <div style={styles.emptyState}>No oil change service records were found for this workshop history yet.</div>
                    ) : (
                      <div style={styles.mobileCardList}>
                        {oilChangeReminders.map((reminder) => (
                          <div key={reminder.vehicleKey} style={styles.mobileDataCard}>
                            <div style={styles.mobileDataCardHeader}>
                              <strong>{reminder.vehicleLabel}</strong>
                              <span style={reminder.isDue ? styles.statusWarning : styles.statusOk}>{reminder.isDue ? "Due" : "Not Due Yet"}</span>
                            </div>
                            <div style={styles.mobileDataSecondary}>{reminder.plateNumber || reminder.conductionNumber || "-"}</div>
                            <div style={styles.mobileDataSecondary}>Customer: {reminder.customerName}</div>
                            <div style={styles.mobileMetaRow}>
                              <span>Last oil change</span>
                              <strong>{formatDateTime(reminder.serviceDate)}</strong>
                            </div>
                            <div style={styles.mobileMetaRow}>
                              <span>Service odometer</span>
                              <strong>{reminder.serviceOdometerKm || "-"}</strong>
                            </div>
                            <div style={styles.mobileMetaRow}>
                              <span>Current odometer</span>
                              <strong>{reminder.currentOdometerKm || "-"}</strong>
                            </div>
                            <div style={styles.mobileMetaRow}>
                              <span>Due threshold</span>
                              <strong>{reminder.oilType === "Fully Synthetic" ? "12 months / 10,000 km" : "6 months / 5,000 km"}</strong>
                            </div>
                            <div style={styles.formHint}>{reminder.dueReason}</div>
                            <div style={styles.inlineActions}>
                              <button
                                type="button"
                                style={styles.smallButton}
                                onClick={() => {
                                  setNotificationTemplateKey("oil-reminder");
                                  setSelectedOilReminderVehicleKey(reminder.vehicleKey);
                                }}
                              >
                                View Template
                              </button>
                              <button
                                type="button"
                                style={styles.smallButtonSuccess}
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(buildOilChangeReminderMessage(reminder));
                                  } catch {
                                    // Clipboard fallback not required for this demo UI.
                                  }
                                }}
                              >
                                Copy Reminder
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                    <div style={styles.mobileDataCardHeader}>
                      <div>
                        <div style={styles.sectionTitle}>Release Follow-Up Reminders</div>
                        <div style={styles.formHint}>Triggers 3 days after release if the RO is still released and no newer job has been opened for the same vehicle.</div>
                      </div>
                      <span style={releaseFollowUpReminders.some((row) => row.isDue) ? styles.statusWarning : styles.statusOk}>
                        {releaseFollowUpReminders.filter((row) => row.isDue).length} Due
                      </span>
                    </div>

                    {releaseFollowUpReminders.length === 0 ? (
                      <div style={styles.emptyState}>No post-release follow-ups are due yet.</div>
                    ) : (
                      <div style={styles.mobileCardList}>
                        {releaseFollowUpReminders.map((reminder) => (
                          <div key={reminder.vehicleKey} style={styles.mobileDataCard}>
                            <div style={styles.mobileDataCardHeader}>
                              <strong>Follow-up (3 days after release)</strong>
                              <span style={reminder.isDue ? styles.statusWarning : styles.statusOk}>{reminder.isDue ? "Due" : "Not Due Yet"}</span>
                            </div>
                            <div style={styles.mobileDataSecondary}>RO: {reminder.roNumber}  |  Release: {reminder.releaseNumber}</div>
                            <div style={styles.mobileDataSecondary}>{reminder.vehicleLabel} {reminder.plateNumber || reminder.conductionNumber ? `(${reminder.plateNumber || reminder.conductionNumber})` : ""}</div>
                            <div style={styles.mobileMetaRow}>
                              <span>Released</span>
                              <strong>{formatDateTime(reminder.releaseDate)}</strong>
                            </div>
                            <div style={styles.mobileMetaRow}>
                              <span>Follow-up due</span>
                              <strong>{formatDateTime(reminder.dueDate)}</strong>
                            </div>
                            <div style={styles.formHint}>{reminder.dueReason}</div>
                            <div style={styles.inlineActions}>
                              <button
                                type="button"
                                style={styles.smallButton}
                                onClick={() => {
                                  setNotificationTemplateKey("follow-up");
                                  setSelectedFollowUpVehicleKey(reminder.vehicleKey);
                                }}
                              >
                                View Template
                              </button>
                              <button
                                type="button"
                                style={reminder.isDue ? styles.smallButtonSuccess : styles.smallButtonMuted}
                                onClick={async () => {
                                  if (!reminder.isDue) return;
                                  try {
                                    await navigator.clipboard.writeText(buildReleaseFollowUpMessage(reminder));
                                  } catch {
                                    // Clipboard fallback not required for this demo UI.
                                  }
                                }}
                              >
                                Copy Message
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                    <div style={styles.mobileDataCardHeader}>
                      <div>
                        <div style={styles.sectionTitle}>Customer Notification Templates</div>
                        <div style={styles.formHint}>Preview and copy SMS-ready text generated from the live RO, inspection, parts, release, and pull-out records.</div>
                      </div>
                      <div style={styles.inlineActions}>
                        <button type="button" style={notificationTemplateKey === "approval-request" ? styles.smallButtonSuccess : styles.smallButtonMuted} onClick={() => setNotificationTemplateKey("approval-request")}>
                          Approval Request
                        </button>
                        <button type="button" style={notificationTemplateKey === "waiting-parts" ? styles.smallButtonSuccess : styles.smallButtonMuted} onClick={() => setNotificationTemplateKey("waiting-parts")}>
                          Waiting Parts
                        </button>
                        <button type="button" style={notificationTemplateKey === "ready-release" ? styles.smallButtonSuccess : styles.smallButtonMuted} onClick={() => setNotificationTemplateKey("ready-release")}>
                          Ready Release
                        </button>
                        <button type="button" style={notificationTemplateKey === "pull-out-notice" ? styles.smallButtonSuccess : styles.smallButtonMuted} onClick={() => setNotificationTemplateKey("pull-out-notice")}>
                          Pull-Out Notice
                        </button>
                        <button type="button" style={notificationTemplateKey === "oil-reminder" ? styles.smallButtonSuccess : styles.smallButtonMuted} onClick={() => setNotificationTemplateKey("oil-reminder")}>
                          Oil Reminder
                        </button>
                        <button type="button" style={notificationTemplateKey === "follow-up" ? styles.smallButtonSuccess : styles.smallButtonMuted} onClick={() => setNotificationTemplateKey("follow-up")}>
                          Follow-Up
                        </button>
                      </div>
                    </div>

                    {activeCustomerNotificationTemplate ? (
                      <div style={styles.formStack}>
                        <div style={styles.formHint}>{activeCustomerNotificationTemplate.subtitle}</div>
                        <div style={styles.summaryGrid}>
                          <div><strong>Template:</strong> {activeCustomerNotificationTemplate.title}</div>
                          <div><strong>RO:</strong> {notificationPreviewRoNumber}</div>
                          <div><strong>Vehicle:</strong> {notificationPreviewVehicleLabel}</div>
                          <div><strong>Customer:</strong> {notificationPreviewCustomerName}</div>
                        </div>
                        <textarea
                          style={{ ...styles.textarea, minHeight: 260, fontFamily: "monospace" }}
                          readOnly
                          value={activeCustomerNotificationTemplate.body}
                        />
                        <div style={styles.inlineActions}>
                          <button
                            type="button"
                            style={styles.smallButton}
                            onClick={async () => {
                              try {
                                await navigator.clipboard.writeText(activeCustomerNotificationTemplate.body);
                              } catch {
                                // Clipboard fallback not required for this demo UI.
                              }
                            }}
                          >
                            Copy Template
                          </button>
                          <button
                            type="button"
                            style={activeCustomerNotificationTemplateSendable ? styles.smallButtonSuccess : styles.smallButtonMuted}
                            disabled={!activeCustomerNotificationTemplateSendable || sendingSmsKey === activeCustomerNotificationTemplate.key}
                            onClick={async () => {
                              if (!activeCustomerNotificationSmsPayload) return;
                              setSendingSmsKey(activeCustomerNotificationTemplate.key);
                              setSmsSendFeedback("");
                              try {
                                const result = await onSendSmsTemplate(activeCustomerNotificationSmsPayload);
                                setSmsSendFeedback(`${result.provider}  |  ${result.detail}`);
                              } catch {
                                setSmsSendFeedback("SMS send failed unexpectedly.");
                              } finally {
                                setSendingSmsKey("");
                              }
                            }}
                          >
                            {sendingSmsKey === activeCustomerNotificationTemplate.key ? "Sending..." : "Send SMS"}
                          </button>
                        </div>
                        <div style={styles.formHint}>
                          SMS provider: {smsProviderConfig.provider}{" "}
                          {smsProviderConfig.isConfigured
                            ? `(${smsProviderConfig.endpointLabel})`
                            : smsProviderConfig.provider === "Simulated"
                              ? "(simulated placeholder)"
                              : "(not configured)"}.
                          {!activeCustomerNotificationTemplateSendable
                            ? " This template is not ready to send yet."
                            : smsProviderConfig.provider === "Android SMS Gateway" && !smsProviderConfig.isConfigured
                              ? " Android gateway sends will fail safely until the gateway URL is saved."
                              : " Ready to send from the current live record."}
                        </div>
                        {smsSendFeedback ? <div style={styles.concernCard}>{smsSendFeedback}</div> : null}
                      </div>
                    ) : (
                      <div style={styles.emptyState}>Select a repair order to preview customer notification templates.</div>
                    )}
                  </div>

                  <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                    <div style={styles.mobileDataCardHeader}>
                      <div>
                        <div style={styles.sectionTitle}>SMS Attempt Log</div>
                        <div style={styles.formHint}>Pending, sent, and failed attempts are stored locally so the send flow can be verified without a backend.</div>
                      </div>
                      <span style={recentSmsAttempts.some((row) => (row.status ?? "Sent") === "Failed") ? styles.statusWarning : styles.statusOk}>
                        {recentSmsAttempts.length} Recent
                      </span>
                    </div>
                    {recentSmsAttempts.length === 0 ? (
                      <div style={styles.emptyState}>No SMS attempts have been logged for this repair order yet.</div>
                    ) : (
                      <div style={styles.mobileCardList}>
                        {recentSmsAttempts.map((row) => (
                          <div key={row.id} style={styles.mobileDataCard}>
                            <div style={styles.mobileDataCardHeader}>
                              <strong>{row.messageType}</strong>
                              <span style={row.status === "Failed" ? styles.statusWarning : row.status === "Pending" ? styles.statusNeutral : styles.statusOk}>
                                {row.status ?? "Sent"}
                              </span>
                            </div>
                            <div style={styles.mobileDataSecondary}>{row.customerName || selectedRO.accountLabel}</div>
                            <div style={styles.mobileMetaRow}>
                              <span>Phone</span>
                              <strong>{row.phoneNumber || row.sentTo || "-"}</strong>
                            </div>
                            <div style={styles.mobileMetaRow}>
                              <span>Provider</span>
                              <strong>{row.provider || "Simulated"}</strong>
                            </div>
                            <div style={styles.mobileMetaRow}>
                              <span>Time</span>
                              <strong>{formatDateTime(row.createdAt)}</strong>
                            </div>
                            <div style={styles.formHint}>{row.message}</div>
                            {row.providerResponse ? <div style={styles.formHint}>Provider response: {row.providerResponse}</div> : null}
                            {row.errorMessage ? <div style={styles.errorBox}>{row.errorMessage}</div> : null}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div style={styles.summaryGrid}>
                    <div>
                      <strong>Approved</strong>
                      <div>{totalApprovedCount}</div>
                    </div>
                    <div>
                      <strong>Declined</strong>
                      <div>{totalDeclinedCount}</div>
                    </div>
                    <div>
                      <strong>Deferred</strong>
                      <div>{totalDeferredCount}</div>
                    </div>
                    <div>
                      <strong>Pending</strong>
                      <div>{approvalPendingCount}</div>
                    </div>
                    <div>
                      <strong>Approved Total</strong>
                      <div>{formatCurrency(approvedEstimateTotal)}</div>
                    </div>
                    <div>
                      <strong>Pending Total</strong>
                      <div>{formatCurrency(pendingEstimateTotal)}</div>
                    </div>
                    <div>
                      <strong>Deferred Total</strong>
                      <div>{formatCurrency(deferredEstimateTotal)}</div>
                    </div>
                    <div>
                      <strong>Declined Total</strong>
                      <div>{formatCurrency(declinedEstimateTotal)}</div>
                    </div>
                  </div>

                  {(approvedWorkLines.length > 0 || declinedWorkLines.length > 0 || deferredWorkLines.length > 0) ? (
                    <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                      <div style={styles.sectionTitle}>Approval Summary</div>
                      <div style={{ ...styles.summaryGrid, marginBottom: 10 }}>
                        <div><strong style={{ color: "#15803d" }}>Approved</strong><div>{approvedWorkLines.length} line{approvedWorkLines.length !== 1 ? "s" : ""}  |  {formatCurrency(approvedEstimateTotal)}</div></div>
                        <div><strong style={{ color: "#b45309" }}>Deferred</strong><div>{deferredWorkLines.length} line{deferredWorkLines.length !== 1 ? "s" : ""}  |  {formatCurrency(deferredEstimateTotal)}</div></div>
                        <div><strong style={{ color: "#b91c1c" }}>Declined</strong><div>{declinedWorkLines.length} line{declinedWorkLines.length !== 1 ? "s" : ""}  |  {formatCurrency(declinedEstimateTotal)}</div></div>
                        <div><strong>Pending</strong><div>{pendingWorkLines.length} line{pendingWorkLines.length !== 1 ? "s" : ""}  |  {formatCurrency(pendingEstimateTotal)}</div></div>
                      </div>

                      {approvedWorkLines.length > 0 ? (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ ...styles.formHint, fontWeight: 600, color: "#15803d", marginBottom: 4 }}>Approved Work Lines</div>
                          {approvedWorkLines.map((line) => (
                            <div key={`sum_approved_${line.id}`} style={{ ...styles.mobileDataCard, borderLeft: "3px solid #15803d", marginBottom: 4 }}>
                              <div style={styles.mobileDataCardHeader}>
                                <strong>{line.title || "Untitled"}</strong>
                                <span>{formatCurrency(parseMoneyInput(line.totalEstimate))}</span>
                              </div>
                              <div style={styles.mobileDataSecondary}>{line.category || "General"}  |  {line.priority} priority  |  {line.status}</div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {deferredWorkLines.length > 0 ? (
                        <div style={{ marginBottom: 10 }}>
                          <div style={{ ...styles.formHint, fontWeight: 600, color: "#b45309", marginBottom: 4 }}>Deferred Items</div>
                          {deferredWorkLines.map((line) => (
                            <div key={`sum_deferred_${line.id}`} style={{ ...styles.mobileDataCard, borderLeft: "3px solid #b45309", marginBottom: 4 }}>
                              <div style={styles.mobileDataCardHeader}>
                                <strong>{line.title || "Untitled"}</strong>
                                <span>{formatCurrency(parseMoneyInput(line.totalEstimate))}</span>
                              </div>
                              <div style={styles.mobileDataSecondary}>{line.category || "General"}  |  {line.priority} priority</div>
                              {line.notes ? <div style={styles.formHint}>{line.notes}</div> : null}
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {declinedWorkLines.length > 0 ? (
                        <div>
                          <div style={{ ...styles.formHint, fontWeight: 600, color: "#b91c1c", marginBottom: 4 }}>Declined Items</div>
                          {declinedWorkLines.map((line) => (
                            <div key={`sum_declined_${line.id}`} style={{ ...styles.mobileDataCard, borderLeft: "3px solid #b91c1c", marginBottom: 4 }}>
                              <div style={styles.mobileDataCardHeader}>
                                <strong>{line.title || "Untitled"}</strong>
                                <span>{formatCurrency(parseMoneyInput(line.totalEstimate))}</span>
                              </div>
                              <div style={styles.mobileDataSecondary}>{line.category || "General"}  |  {line.priority} priority</div>
                              {line.notes ? <div style={styles.formHint}>{line.notes}</div> : null}
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  ) : null}

                  <div style={{ ...styles.inlineActions, marginTop: 12, flexWrap: "wrap" }}>
                    <button type="button" style={styles.smallButtonSuccess} onClick={() => setBulkLineDecision("Approved")} disabled={pendingWorkLines.length === 0}>
                      Approve All Pending Lines
                    </button>
                    <button type="button" style={styles.smallButton} onClick={() => setBulkLineDecision("Deferred")} disabled={pendingWorkLines.length === 0}>
                      Defer All Pending Lines
                    </button>
                    <button type="button" style={styles.smallButtonDanger} onClick={() => setBulkLineDecision("Declined")} disabled={pendingWorkLines.length === 0}>
                      Decline All Pending Lines
                    </button>
                  </div>

                  {!canAdvanceToWork ? (
                    <div style={{ ...styles.errorBox, marginTop: 12 }}>
                      RO progression is locked. Decide all pending work lines and findings before moving this job into work. At least one work line must be approved.
                    </div>
                  ) : (
                    <div style={{ ...styles.statusOk, marginTop: 12 }}>
                      Approval complete. This RO can now move into work.
                    </div>
                  )}

                  {findingRecommendations.length ? (
                    <div style={{ ...styles.sectionCardMuted, marginTop: 12 }}>
                      <div style={styles.mobileDataCardHeader}>
                        <div>
                          <div style={styles.sectionTitle}>Inspection Findings Waiting for RO Mapping</div>
                          <div style={styles.formHint}>Approving a finding inserts a new RO work line immediately. Declined findings stay out of the RO. Deferred findings stay visible for follow-up.</div>
                        </div>
                        <span style={styles.statusInfo}>{findingRecommendations.length} finding recommendations</span>
                      </div>
                      <div style={{ ...styles.inlineActions, marginTop: 12, flexWrap: "wrap" }}>
                        <button type="button" style={styles.smallButtonSuccess} onClick={() => setBulkFindingRecommendationDecision("Approved")} disabled={pendingFindingRecommendations.length === 0}>
                          Approve All Pending Findings
                        </button>
                        <button type="button" style={styles.smallButton} onClick={() => setBulkFindingRecommendationDecision("Deferred")} disabled={pendingFindingRecommendations.length === 0}>
                          Defer All Pending Findings
                        </button>
                        <button type="button" style={styles.smallButtonDanger} onClick={() => setBulkFindingRecommendationDecision("Declined")} disabled={pendingFindingRecommendations.length === 0}>
                          Decline All Pending Findings
                        </button>
                      </div>
                      <div style={styles.mobileCardList}>
                        {findingRecommendations.map((item) => (
                          <div key={`finding_map_${item.id}`} style={{ ...styles.mobileDataCard, border: "1px solid rgba(59, 130, 246, 0.16)" }}>
                            <div style={styles.mobileDataCardHeader}>
                              <strong>{item.workLineTitle}</strong>
                              <span style={getApprovalDecisionStyle(toApprovalDecision(item.decision))}>
                                {item.decision}
                              </span>
                            </div>
                            <div style={styles.mobileDataSecondary}>
                              {item.category}  |  Source finding: {item.title}
                            </div>
                            {item.note ? <div style={styles.concernCard}>{item.note}</div> : null}
                            {item.photoNotes.length ? <div style={styles.formHint}>Photo notes: {item.photoNotes.join("  |  ")}</div> : null}
                            {item.decidedAt ? <div style={styles.formHint}>Decision Time: {formatDateTime(item.decidedAt)}</div> : null}
                            <div style={styles.inlineActions}>
                              <button type="button" style={styles.smallButtonSuccess} onClick={() => setFindingRecommendationDecision(item, "Approved")} disabled={item.decision === "Approved"}>
                                Approve to RO
                              </button>
                              <button type="button" style={styles.smallButtonMuted} onClick={() => setFindingRecommendationDecision(item, "Deferred")} disabled={item.decision === "Deferred"}>
                                Defer
                              </button>
                              <button type="button" style={styles.smallButtonDanger} onClick={() => setFindingRecommendationDecision(item, "Declined")} disabled={item.decision === "Declined"}>
                                Decline
                              </button>
                            </div>
                            {item.decision === "Approved" ? (
                              <div style={styles.formHint}>This finding is already mapped into the RO work lines.</div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

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
                                {line.category || "General"}  |  {formatCurrency(parseMoneyInput(line.totalEstimate))}
                              </div>
                              <div style={styles.concernCard}>{getCustomerFriendlyLineDescription(line)}</div>
                              {line.notes ? <div style={styles.formHint}>Tech notes: {line.notes}</div> : null}
                              <div style={styles.inlineActions}>
                                <button type="button" style={styles.smallButtonSuccess} onClick={() => setLineDecision("Approved", line.id)}>Approve Work</button>
                                <button type="button" style={styles.smallButtonMuted} onClick={() => setLineDecision("Deferred", line.id)}>Decide Later</button>
                                <button type="button" style={styles.smallButtonDanger} onClick={() => setLineDecision("Declined", line.id)}>Decline Work</button>
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
                              {line.category || "General"}  |  {formatCurrency(parseMoneyInput(line.totalEstimate))}
                            </div>
                            {line.recommendationSource ? (
                              <div style={styles.formHint}>Source: {line.recommendationSource}</div>
                            ) : null}
                            {approvedAt ? <div style={styles.formHint}>Decision Time: {formatDateTime(approvedAt)}</div> : null}
                            {line.notes ? <div style={styles.concernCard}>{line.notes}</div> : null}
                            <div style={styles.inlineActions}>
                              <button type="button" style={styles.smallButtonSuccess} onClick={() => setLineDecision("Approved", line.id)}>Approve Work</button>
                              <button type="button" style={styles.smallButtonMuted} onClick={() => setLineDecision("Deferred", line.id)}>Decide Later</button>
                              <button type="button" style={styles.smallButtonDanger} onClick={() => setLineDecision("Declined", line.id)}>Decline Work</button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {selectedApproval ? (
                    <div style={styles.formHint}>
                      Last approval record: {selectedApproval.approvalNumber}  |  {formatDateTime(selectedApproval.createdAt)}  |  Deferred: {selectedRO.deferredLineTitles.length ? selectedRO.deferredLineTitles.join(", ") : "None"}  |  Hook: {selectedApproval.communicationHook}
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
                            <span style={getApprovalDecisionStyle(line.approvalDecision ?? "Pending")}>{line.approvalDecision ?? "Pending"}</span>
                            <WorkLineStatusBadge status={line.status} />
                            <button type="button" style={styles.smallButtonMuted} onClick={() => removeROWorkLine(selectedRO.id, line.id)} disabled={line.approvalDecision === "Approved"}>
                              Remove
                            </button>
                          </div>
                        </div>

                        <div style={styles.formStack}>
                          <div style={styles.formGroup}>
                            <label style={styles.label}>Title</label>
                            <input style={styles.input} value={line.title} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "title", e.target.value)} disabled={line.approvalDecision === "Approved"} />
                          </div>

                          <div style={isCompactLayout ? styles.formStack : styles.formGrid3}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Category</label>
                              <input style={styles.input} value={line.category} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "category", e.target.value)} disabled={line.approvalDecision === "Approved"} />
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
                              <select style={styles.select} value={line.status} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "status", e.target.value)} disabled={(line.approvalDecision ?? "Pending") !== "Approved"}>
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
                              <input style={styles.input} value={line.serviceEstimate} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "serviceEstimate", e.target.value)} disabled={line.approvalDecision === "Approved"} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Parts Estimate</label>
                              <input style={styles.input} value={line.partsEstimate} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "partsEstimate", e.target.value)} disabled={line.approvalDecision === "Approved"} />
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

                          <div style={styles.formGroup}>
                            <label style={styles.label}>Customer Description</label>
                            <textarea style={styles.textarea} value={line.customerDescription} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "customerDescription", e.target.value)} disabled={line.approvalDecision === "Approved"} />
                          </div>

                          <div style={isCompactLayout ? styles.formStack : styles.formGrid4}>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Labor Hours</label>
                              <input style={styles.input} value={line.laborHours} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "laborHours", e.target.value)} disabled={line.approvalDecision === "Approved"} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Labor Rate</label>
                              <input style={styles.input} value={line.laborRate} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "laborRate", e.target.value)} disabled={line.approvalDecision === "Approved"} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Parts Cost</label>
                              <input style={styles.input} value={line.partsCost} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "partsCost", e.target.value)} disabled={line.approvalDecision === "Approved"} />
                            </div>
                            <div style={styles.formGroup}>
                              <label style={styles.label}>Markup %</label>
                              <input style={styles.input} value={line.partsMarkupPercent} onChange={(e) => updateROWorkLine(selectedRO.id, line.id, "partsMarkupPercent", e.target.value)} disabled={line.approvalDecision === "Approved"} />
                            </div>
                          </div>

                          {line.recommendationSource ? <div style={styles.formHint}>Source: {line.recommendationSource}</div> : null}
                          <div style={styles.formHint}>Labor: {formatCurrency(getWorkLinePricing(line).laborAmount)}  |  Parts: {formatCurrency(getWorkLinePricing(line).partsAmount)}  |  Total: {formatCurrency(getWorkLinePricing(line).totalAmount)}</div>
                          {(line.approvalDecision ?? "Pending") !== "Approved" ? (
                            <div style={styles.formHint}>Execution status is locked until this line is approved.</div>
                          ) : (
                            <div style={styles.formHint}>Approved lines are locked for pricing/title edits and ready for execution tracking.</div>
                          )}
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

function ShopFloorPage({
  currentUser,
  users,
  repairOrders,
  setRepairOrders,
  workLogs,
  setWorkLogs,
  isCompactLayout,
}: {
  currentUser: SessionUser;
  users: UserAccount[];
  repairOrders: RepairOrderRecord[];
  setRepairOrders: React.Dispatch<React.SetStateAction<RepairOrderRecord[]>>;
  workLogs: WorkLog[];
  setWorkLogs: React.Dispatch<React.SetStateAction<WorkLog[]>>;
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { roNumber: _rn, createdAt: _ca, encodedBy: _eb, ...safePatch } = patch as RepairOrderRecord;
    setRepairOrders((prev) =>
      prev.map((row) =>
        row.id === roId
          ? {
              ...row,
              ...safePatch,
              updatedAt: new Date().toISOString(),
              updatedBy: currentUser.fullName,
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

  const roWorkLogs = useMemo(
    () => workLogs.filter((row) => row.roId === selectedRO?.id),
    [selectedRO?.id, workLogs]
  );

  const activeRoWorkLogs = useMemo(
    () => roWorkLogs.filter((row) => !row.endedAt),
    [roWorkLogs]
  );

  const startWorkLog = (workLineId: string, technicianId: string) => {
    if (!selectedRO || !technicianId) return;
    const hasActive = workLogs.some(
      (row) => row.roId === selectedRO.id && row.workLineId === workLineId && row.technicianId === technicianId && !row.endedAt
    );
    if (hasActive) return;
    const now = new Date().toISOString();
    setWorkLogs((prev) => [
      {
        id: uid("wlog"),
        roId: selectedRO.id,
        workLineId,
        technicianId,
        startedAt: now,
        endedAt: undefined,
        totalMinutes: 0,
        note: "",
      },
      ...prev,
    ]);
    if (!selectedRO.workStartedAt) {
      updateRO(selectedRO.id, {
        workStartedAt: now,
        status: selectedRO.status === "Approved / Ready to Work" ? "In Progress" : selectedRO.status,
      });
    }
  };

  const stopWorkLog = (logId: string) => {
    setWorkLogs((prev) =>
      prev.map((row) => {
        if (row.id !== logId || row.endedAt) return row;
        const endedAt = new Date().toISOString();
        const totalMinutes = Math.max(0, Math.floor((new Date(endedAt).getTime() - new Date(row.startedAt).getTime()) / 60000));
        return { ...row, endedAt, totalMinutes };
      })
    );
  };

  const lineMinutesMap = useMemo(() => {
    const map = new Map<string, number>();
    roWorkLogs.forEach((log) => {
      map.set(log.workLineId, (map.get(log.workLineId) ?? 0) + getWorkLogMinutes(log));
    });
    return map;
  }, [roWorkLogs]);

  const techMinutesMap = useMemo(() => {
    const map = new Map<string, number>();
    roWorkLogs.forEach((log) => {
      map.set(log.technicianId, (map.get(log.technicianId) ?? 0) + getWorkLogMinutes(log));
    });
    return map;
  }, [roWorkLogs]);

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


  const myActiveJobsCount = sortedRepairOrders.filter(
    (row) =>
      ["Approved / Ready to Work", "In Progress", "Waiting Parts", "Quality Check"].includes(row.status) &&
      (row.primaryTechnicianId === currentUser.id || row.supportTechnicianIds.includes(currentUser.id))
  ).length;

  const selectedROEstimateTotal = selectedRO
    ? selectedRO.workLines.reduce((sum, line) => sum + parseMoneyInput(line.totalEstimate), 0)
    : 0;

  const selectedROCompletedLines = selectedRO
    ? selectedRO.workLines.filter((line) => line.status === "Completed").length
    : 0;

  const technicianBoard = useMemo(() => {
    const techUsers = users.filter(
      (user) =>
        user.active &&
        ["Chief Technician", "Senior Mechanic", "General Mechanic", "OJT"].includes(user.role)
    );

    return techUsers
      .map((user) => {
        const assignedJobs = sortedRepairOrders.filter(
          (row) => row.primaryTechnicianId === user.id || row.supportTechnicianIds.includes(user.id)
        );
        const liveLogs = workLogs.filter((log) => log.technicianId === user.id && !log.endedAt);
        const bookedMinutes = workLogs
          .filter((log) => log.technicianId === user.id)
          .reduce((sum, log) => sum + getWorkLogMinutes(log), 0);
        const completedJobs = assignedJobs.filter((row) =>
          ["Ready Release", "Released", "Closed"].includes(row.status)
        ).length;
        const laborProduced = assignedJobs.reduce(
          (sum, ro) =>
            sum +
            ro.workLines.reduce(
              (lineSum, line) => lineSum + parseMoneyInput(line.serviceEstimate),
              0
            ),
          0
        );
        const efficiency = bookedMinutes > 0 ? Math.round((laborProduced / bookedMinutes) * 60) : 0;

        return {
          user,
          assignedJobs,
          liveLogs,
          bookedMinutes,
          completedJobs,
          laborProduced,
          efficiency,
        };
      })
      .sort(
        (a, b) =>
          b.liveLogs.length - a.liveLogs.length ||
          b.assignedJobs.length - a.assignedJobs.length ||
          b.bookedMinutes - a.bookedMinutes
      );
  }, [sortedRepairOrders, users, workLogs]);

  const myLiveLogs = useMemo(
    () => workLogs.filter((log) => log.technicianId === currentUser.id && !log.endedAt),
    [currentUser.id, workLogs]
  );

  const updateWorkLineStatus = (workLineId: string, status: WorkLineStatus) => {
    if (!selectedRO) return;
    const now = new Date().toISOString();

    setRepairOrders((prev) =>
      prev.map((row) => {
        if (row.id !== selectedRO.id) return row;

        const targetLine = row.workLines.find((l) => l.id === workLineId);
        if (!targetLine) return row;

        if (targetLine.approvalDecision !== "Approved" && status !== "Pending") return row;

        if (targetLine.status === "Waiting Parts" && status === "Completed") return row;

        const nextWorkLines = row.workLines.map((line) =>
          line.id === workLineId ? { ...line, status, completedAt: status === "Completed" ? now : line.completedAt } : line
        );

        const approvedLines = nextWorkLines.filter(
          (l) => l.approvalDecision !== "Declined" && l.approvalDecision !== "Deferred"
        );
        const allApprovedCompleted = approvedLines.length > 0 && approvedLines.every((l) => l.status === "Completed");
        const hasWaitingParts = nextWorkLines.some((line) => line.status === "Waiting Parts");
        const hasInProgress = nextWorkLines.some((line) => line.status === "In Progress");

        let nextStatus = row.status;
        if (allApprovedCompleted && !["Released", "Closed"].includes(row.status)) {
          nextStatus = "Quality Check";
        } else if (hasWaitingParts && row.status !== "Quality Check") {
          nextStatus = "Waiting Parts";
        } else if (hasInProgress && !["Quality Check", "Ready Release", "Released", "Closed"].includes(row.status)) {
          nextStatus = "In Progress";
        }

        return {
          ...row,
          workLines: nextWorkLines,
          status: nextStatus,
          updatedAt: now,
          updatedBy: currentUser.fullName,
          workStartedAt: row.workStartedAt || now,
        };
      })
    );
  };

  const stopActiveLogsForLine = (workLineId: string) => {
    setWorkLogs((prev) =>
      prev.map((row) => {
        if (row.workLineId !== workLineId || !selectedRO || row.roId !== selectedRO.id || row.endedAt) return row;
        const endedAt = new Date().toISOString();
        const totalMinutes = Math.max(
          0,
          Math.floor((new Date(endedAt).getTime() - new Date(row.startedAt).getTime()) / 60000)
        );
        return { ...row, endedAt, totalMinutes };
      })
    );
  };

  const markWorkLineComplete = (workLineId: string) => {
    stopActiveLogsForLine(workLineId);
    updateWorkLineStatus(workLineId, "Completed");
  };

  return (
    <div style={styles.pageContent}>
      <div style={styles.grid}>
        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title="Shop Floor Job Feed"
            subtitle="Newest to oldest operational board with technician assignment, live timers, and no fixed bay layout"
            right={
              <div style={styles.inlineActions}>
                <span style={styles.statusInfo}>{visibleRepairOrders.length} visible jobs</span>
                <span style={canManageShopFloor ? styles.statusOk : styles.statusNeutral}>
                  {canManageShopFloor ? "Manage Allowed" : "View Only"}
                </span>
              </div>
            }
          >
            <div style={styles.heroText}>
              This board uses repair orders as the live job source. It does not use fixed bays. Jobs stay visible from
              draft through closed so management and staff can see the full queue, reassign technicians quickly, and
              move vehicles cleanly from approval to release.
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
        <div style={{ ...styles.gridItem, gridColumn: getResponsiveSpan(3, isCompactLayout) }}>
          <div style={styles.statCard}>
            <div style={styles.statLabel}>My Active Jobs</div>
            <div style={styles.statValue}>{myActiveJobsCount}</div>
            <div style={styles.statNote}>Jobs assigned to {currentUser.fullName.split(" ")[0]}</div>
          </div>
        </div>

        <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
          <Card
            title="Technician Board"
            subtitle="Live workload, active timers, booked hours, and efficiency base for each technician"
            right={<span style={styles.statusInfo}>{technicianBoard.length} technicians tracked</span>}
          >
            {technicianBoard.length === 0 ? (
              <div style={styles.emptyState}>No active technicians found.</div>
            ) : (
              <div style={styles.mobileCardList}>
                {technicianBoard.map(({ user, assignedJobs, liveLogs, bookedMinutes, completedJobs, laborProduced, efficiency }) => (
                  <div key={user.id} style={styles.mobileDataCard}>
                    <div style={styles.mobileDataCardHeader}>
                      <strong>{user.fullName}</strong>
                      <RoleBadge role={user.role} />
                    </div>
                    <div style={styles.mobileMetaRow}>
                      <span>Assigned Jobs</span>
                      <strong>{assignedJobs.length}</strong>
                    </div>
                    <div style={styles.mobileMetaRow}>
                      <span>Live Timers</span>
                      <strong>{liveLogs.length}</strong>
                    </div>
                    <div style={styles.mobileMetaRow}>
                      <span>Booked Time</span>
                      <strong>{formatMinutesAsHours(bookedMinutes)}</strong>
                    </div>
                    <div style={styles.mobileMetaRow}>
                      <span>Completed Jobs</span>
                      <strong>{completedJobs}</strong>
                    </div>
                    <div style={styles.mobileMetaRow}>
                      <span>Labor Produced</span>
                      <strong>{formatCurrency(laborProduced)}</strong>
                    </div>
                    <div style={styles.mobileMetaRow}>
                      <span>Efficiency</span>
                      <strong>{efficiency}%</strong>
                    </div>
                    <div style={styles.formHint}>
                      {assignedJobs.length
                        ? assignedJobs
                            .slice(0, 3)
                            .map((job) => `${job.roNumber}  |  ${job.status}`)
                            .join("  |  ")
                        : "No assigned jobs."}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
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
                          {row.plateNumber || row.conductionNumber || "No plate yet"}  |  {row.make} {row.model}
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
                        {row.accountLabel}  |  {row.make} {row.model}
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
            right={selectedRO ? <ROStatusBadge status={selectedRO.status} /> : undefined}
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
                    <div>
                      <strong>Primary Tech</strong>
                      <div>{selectedRO.primaryTechnicianId ? getUserName(selectedRO.primaryTechnicianId) : "Unassigned"}</div>
                    </div>
                    <div>
                      <strong>Support Team</strong>
                      <div>{selectedRO.supportTechnicianIds.length ? selectedRO.supportTechnicianIds.map(getUserName).join(", ") : "None"}</div>
                    </div>
                    <div>
                      <strong>Completed Lines</strong>
                      <div>{selectedROCompletedLines} / {selectedRO.workLines.length}</div>
                    </div>
                    <div>
                      <strong>Total Estimate</strong>
                      <div>{formatCurrency(selectedROEstimateTotal)}</div>
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
                              {user.fullName}  -  {user.role}
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
                                {user.fullName}  -  {user.role}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ ...styles.sectionCard, marginBottom: 12 }}>
                  <div style={styles.mobileDataCardHeader}>
                    <div>
                      <div style={styles.sectionTitle}>Technician Work Logs</div>
                      <div style={styles.formHint}>Start and stop technician timers per work line. These logs feed the dashboard productivity view.</div>
                    </div>
                    <span style={styles.statusInfo}>{roWorkLogs.length} logs  |  {activeRoWorkLogs.length} live</span>
                  </div>
                  <div style={{ ...styles.mobileCardList, marginTop: 12 }}>
                    {selectedRO.workLines.length === 0 ? (
                      <div style={styles.emptyState}>No work lines available yet for technician logging.</div>
                    ) : (
                      selectedRO.workLines.map((line) => {
                        const activeLineLogs = roWorkLogs.filter((log) => log.workLineId === line.id && !log.endedAt);
                        const suggestedTechId = selectedRO.primaryTechnicianId || currentUser.id;
                        return (
                          <div key={`techlog_${line.id}`} style={styles.mobileDataCard}>
                            <div style={styles.mobileDataCardHeader}>
                              <strong>{line.title || "Untitled Work Line"}</strong>
                              <span style={getWorkLineStatusStyle(line.status)}>{line.status}</span>
                            </div>
                            <div style={styles.mobileDataSecondary}>{line.category}  |  Logged Time: {formatMinutesAsHours(lineMinutesMap.get(line.id) ?? 0)}</div>
                            {activeLineLogs.length ? (
                              <div style={styles.formHint}>Live: {activeLineLogs.map((log) => `${getUserName(log.technicianId)} (${formatElapsedTime(log.startedAt)})`).join("  |  ")}</div>
                            ) : (
                              <div style={styles.formHint}>No active timer on this work line.</div>
                            )}
                            <div style={styles.inlineActions}>
                              <button type="button" style={styles.smallButtonSuccess} onClick={() => startWorkLog(line.id, suggestedTechId)}>
                                Start Primary Timer
                              </button>
                              {activeLineLogs
                                .filter((log) => canManageShopFloor || log.technicianId === currentUser.id)
                                .map((log) => (
                                  <button key={log.id} type="button" style={styles.smallButtonDanger} onClick={() => stopWorkLog(log.id)}>
                                    Stop {getUserName(log.technicianId)}
                                  </button>
                                ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  {roWorkLogs.length ? (
                    <div style={{ ...styles.tableWrap, marginTop: 12 }}>
                      <table style={styles.table}>
                        <thead>
                          <tr>
                            <th style={styles.th}>Technician</th>
                            <th style={styles.th}>Work Line</th>
                            <th style={styles.th}>Started</th>
                            <th style={styles.th}>Ended</th>
                            <th style={styles.th}>Hours</th>
                          </tr>
                        </thead>
                        <tbody>
                          {roWorkLogs.slice(0, 12).map((log) => {
                            const line = selectedRO.workLines.find((row) => row.id === log.workLineId);
                            return (
                              <tr key={log.id}>
                                <td style={styles.td}>{getUserName(log.technicianId)}</td>
                                <td style={styles.td}>{line?.title || "Work Line"}</td>
                                <td style={styles.td}>{formatDateTime(log.startedAt)}</td>
                                <td style={styles.td}>{log.endedAt ? formatDateTime(log.endedAt) : "Live"}</td>
                                <td style={styles.td}>{formatMinutesAsHours(getWorkLogMinutes(log))}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                  {Array.from(techMinutesMap.entries()).length ? (
                    <div style={{ ...styles.inlineActions, marginTop: 12, flexWrap: "wrap" }}>
                      {Array.from(techMinutesMap.entries()).map(([techId, minutes]) => (
                        <span key={techId} style={styles.statusNeutral}>{getUserName(techId)}  |  {formatMinutesAsHours(minutes)}</span>
                      ))}
                    </div>
                  ) : null}
                </div>

                {myLiveLogs.length ? (
                  <div style={styles.sectionCard}>
                    <div style={styles.mobileDataCardHeader}>
                      <div>
                        <div style={styles.sectionTitle}>My Live Timers</div>
                        <div style={styles.formHint}>Quick stop controls for the signed-in technician.</div>
                      </div>
                      <span style={styles.statusWarning}>{myLiveLogs.length} running</span>
                    </div>
                    <div style={styles.mobileCardList}>
                      {myLiveLogs.map((log) => {
                        const ro = repairOrders.find((row) => row.id === log.roId);
                        const line = ro?.workLines.find((row) => row.id === log.workLineId);
                        return (
                          <div key={log.id} style={styles.mobileDataCard}>
                            <div style={styles.mobileDataCardHeader}>
                              <strong>{line?.title || "Work Line"}</strong>
                              <span style={styles.statusInfo}>{formatElapsedTime(log.startedAt)}</span>
                            </div>
                            <div style={styles.mobileDataSecondary}>
                              {ro?.roNumber || "-"}  |  {ro?.plateNumber || ro?.conductionNumber || "-"}
                            </div>
                            <div style={styles.inlineActions}>
                              <button type="button" style={styles.smallButtonDanger} onClick={() => stopWorkLog(log.id)}>
                                Stop My Timer
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                <div style={styles.sectionCard}>
                  <div style={styles.sectionTitle}>Work Summary</div>
                  <div style={styles.mobileCardList}>
                    {selectedRO.workLines.map((line) => {
                      const activeLineLogs = roWorkLogs.filter((log) => log.workLineId === line.id && !log.endedAt);
                      const lineAssignedTechId = line.assignedTechnicianId || selectedRO.primaryTechnicianId || currentUser.id;
                      return (
                        <div key={line.id} style={styles.mobileDataCard}>
                          <div style={styles.mobileDataCardHeader}>
                            <strong>{line.title || "Untitled Work Line"}</strong>
                            <span style={getWorkLineStatusStyle(line.status)}>{line.status}</span>
                          </div>
                          <div style={styles.mobileDataSecondary}>
                            {line.category}  |  Priority {line.priority}
                          </div>
                          <div style={styles.mobileMetaRow}>
                            <span>Assigned Tech</span>
                            <strong>{lineAssignedTechId ? getUserName(lineAssignedTechId) : "Unassigned"}</strong>
                          </div>
                          <div style={styles.mobileMetaRow}>
                            <span>Logged Time</span>
                            <strong>{formatMinutesAsHours(lineMinutesMap.get(line.id) ?? 0)}</strong>
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
                          {activeLineLogs.length ? (
                            <div style={styles.formHint}>
                              Live timer: {activeLineLogs.map((log) => `${getUserName(log.technicianId)} (${formatElapsedTime(log.startedAt)})`).join("  |  ")}
                            </div>
                          ) : null}
                          <div style={styles.inlineActions}>
                            <button
                              type="button"
                              style={styles.smallButton}
                              onClick={() => {
                                updateWorkLineStatus(line.id, "In Progress");
                                startWorkLog(line.id, lineAssignedTechId);
                              }}
                            >
                              Start Line
                            </button>
                            <button
                              type="button"
                              style={styles.smallButtonMuted}
                              onClick={() => updateWorkLineStatus(line.id, "Waiting Parts")}
                            >
                              Waiting Parts
                            </button>
                            <button
                              type="button"
                              style={styles.smallButtonSuccess}
                              onClick={() => markWorkLineComplete(line.id)}
                            >
                              Mark Complete
                            </button>
                          </div>
                        </div>
                      );
                    })}
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

  const [bookings, setBookings] = useState<BookingRecord[]>(() =>
    readLocalStorage<BookingRecord[]>(STORAGE_KEYS.bookings, [])
  );
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
    readLocalStorage<PartsRequestRecord[]>(STORAGE_KEYS.partsRequests, []).map(migratePartsRequestRecord)
  );

  const [approvalRecords, setApprovalRecords] = useState<ApprovalRecord[]>(() =>
    readLocalStorage<ApprovalRecord[]>(STORAGE_KEYS.approvalRecords, [])
  );

  const [backjobRecords, setBackjobRecords] = useState<BackjobRecord[]>(() =>
    readLocalStorage<BackjobRecord[]>(STORAGE_KEYS.backjobRecords, []).map(migrateBackjobRecord)
  );

  const [invoiceRecords, setInvoiceRecords] = useState<InvoiceRecord[]>(() =>
    readLocalStorage<InvoiceRecord[]>(STORAGE_KEYS.invoiceRecords, []).map(migrateInvoiceRecord)
  );

  const [paymentRecords, setPaymentRecords] = useState<PaymentRecord[]>(() =>
    readLocalStorage<PaymentRecord[]>(STORAGE_KEYS.paymentRecords, []).map(migratePaymentRecord)
  );

  const [workLogs, setWorkLogs] = useState<WorkLog[]>(() =>
    readLocalStorage<WorkLog[]>(STORAGE_KEYS.workLogs, [])
  );

  const [customerAccounts, setCustomerAccounts] = useState<CustomerAccount[]>(() =>
    readLocalStorage<CustomerAccount[]>(STORAGE_KEYS.customerAccounts, [])
  );

  const [customerSession, setCustomerSession] = useState<CustomerAccount | null>(() =>
    readLocalStorage<CustomerAccount | null>(STORAGE_KEYS.customerSession, null)
  );
  const [customerPortalMode, setCustomerPortalMode] = useState<"real" | "demo">("real");
  const [customerPortalLaunchView, setCustomerPortalLaunchView] = useState<CustomerPortalView>("dashboard");
  const [customerPortalSharedRoId, setCustomerPortalSharedRoId] = useState("");
  const [customerApprovalLinkError, setCustomerApprovalLinkError] = useState("");
  const [pendingDemoCustomerPortal, setPendingDemoCustomerPortal] = useState(false);
  const [supplierSession, setSupplierSession] = useState<SupplierSession | null>(null);

  const [approvalLinkTokens, setApprovalLinkTokens] = useState<ApprovalLinkToken[]>(() =>
    readLocalStorage<ApprovalLinkToken[]>(STORAGE_KEYS.approvalLinkTokens, [])
  );

  const [smsApprovalLogs, setSmsApprovalLogs] = useState<SmsApprovalDispatchLog[]>(() =>
    readLocalStorage<SmsApprovalDispatchLog[]>(STORAGE_KEYS.smsApprovalLogs, [])
  );

  const [autoPortalMessage, setAutoPortalMessage] = useState("");

  const [loginAudience, setLoginAudience] = useState<LoginAudience>("staff");

  const [customerLoginForm, setCustomerLoginForm] = useState<CustomerLoginForm>({
    identifier: "",
    password: "",
  });
  const [supplierLoginForm, setSupplierLoginForm] = useState<SupplierLoginForm>({
    supplierName: "",
  });

  const [customerLoginError, setCustomerLoginError] = useState("");
  const [supplierLoginError, setSupplierLoginError] = useState("");
  const [publicBookingForm, setPublicBookingForm] = useState<BookingForm>(() => ({
    ...getDefaultBookingForm("Book Service"),
    requestedDate: new Date().toISOString().slice(0, 10),
  }));
  const [publicBookingError, setPublicBookingError] = useState("");

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
    writeLocalStorage(STORAGE_KEYS.bookings, bookings);
  }, [bookings]);

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
    writeLocalStorage(STORAGE_KEYS.workLogs, workLogs);
  }, [workLogs]);

  useEffect(() => {
    setCustomerAccounts((prev) => buildCustomerAccountsFromRecords(prev, intakeRecords, repairOrders));
  }, [intakeRecords, repairOrders]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.customerAccounts, customerAccounts);
  }, [customerAccounts]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.customerSession, customerSession);
  }, [customerSession]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.approvalLinkTokens, approvalLinkTokens);
  }, [approvalLinkTokens]);

  useEffect(() => {
    writeLocalStorage(STORAGE_KEYS.smsApprovalLogs, smsApprovalLogs);
  }, [smsApprovalLogs]);

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

  useEffect(() => {
    if (!customerSession) return;
    const fresh = customerAccounts.find((account) => account.id === customerSession.id);
    if (!fresh) {
      setCustomerSession(null);
      setCustomerPortalMode("real");
      setCustomerPortalLaunchView("dashboard");
      setCustomerPortalSharedRoId("");
      setCustomerApprovalLinkError("");
      return;
    }
    if (JSON.stringify(fresh) !== JSON.stringify(customerSession)) {
      setCustomerSession(fresh);
    }
  }, [customerAccounts, customerSession]);

  useEffect(() => {
    if (!pendingDemoCustomerPortal) return;
    const demoCustomer =
      customerAccounts.find((account) => account.email.toLowerCase() === "miguel.santos@example.com") ??
      customerAccounts.find((account) => account.fullName === "Miguel Santos") ??
      customerAccounts.find((account) => sanitizePhone(account.phone) === "09171234567") ??
      null;

    if (!demoCustomer) return;

    setCustomerSession(demoCustomer);
    setCustomerPortalMode("demo");
    setPendingDemoCustomerPortal(false);
  }, [customerAccounts, pendingDemoCustomerPortal]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const url = new URL(window.location.href);
    const isCustomerApprovalPath = url.pathname.toLowerCase().includes("/customer-view");
    const portal = url.searchParams.get("portal");
    const tokenValue = url.searchParams.get("token");
    if (!isCustomerApprovalPath && portal !== "customer") return;
    if (!tokenValue) {
      setCustomerApprovalLinkError("Invalid or expired link");
      return;
    }

    const tokenRecord = approvalLinkTokens.find((row) => row.token === tokenValue);
    if (!tokenRecord || !isApprovalLinkActive(tokenRecord)) {
      setCustomerSession(null);
      setCustomerPortalMode("real");
      setCustomerPortalLaunchView("dashboard");
      setCustomerPortalSharedRoId("");
      setCustomerApprovalLinkError("Invalid or expired link");
      return;
    }
    const tokenRo = repairOrders.find((ro) => ro.id === tokenRecord.roId);
    if (!tokenRo) {
      setCustomerSession(null);
      setCustomerPortalMode("real");
      setCustomerPortalLaunchView("dashboard");
      setCustomerPortalSharedRoId("");
      setCustomerApprovalLinkError("Invalid or expired link");
      return;
    }
    const customer = customerAccounts.find((row) => row.id === tokenRecord.customerId);
    if (!customer) {
      setCustomerSession(null);
      setCustomerPortalMode("real");
      setCustomerPortalLaunchView("dashboard");
      setCustomerPortalSharedRoId("");
      setCustomerApprovalLinkError("Invalid or expired link");
      return;
    }

    setCustomerSession(customer);
    setCustomerPortalMode("demo");
    setCustomerPortalLaunchView("approvals");
    setCustomerPortalSharedRoId(tokenRo.id);
    setCustomerApprovalLinkError("");
    setLoginAudience("customer");
    setCustomerLoginError("");
    setApprovalLinkTokens((prev) =>
      prev.map((row) => (row.id === tokenRecord.id ? { ...row, lastUsedAt: new Date().toISOString() } : row))
    );
    url.searchParams.delete("portal");
    url.searchParams.delete("token");
    window.history.replaceState({}, "", url.pathname + (url.searchParams.toString() ? `?${url.searchParams.toString()}` : ""));
  }, [approvalLinkTokens, customerAccounts, repairOrders]);

  const allowedNav = useMemo(() => {
    if (!currentUser) return [];
    return getAllowedNav(currentUser.role, roleDefinitions);
  }, [currentUser, roleDefinitions]);

  const currentNavItem = useMemo(() => {
    return NAV_ITEMS.find((item) => item.key === currentView) ?? NAV_ITEMS[0];
  }, [currentView]);

  const completeStaffLogin = (found: UserAccount) => {
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
    setCustomerSession(null);
    setCustomerPortalMode("real");
    setCustomerPortalLaunchView("dashboard");
    setCustomerPortalSharedRoId("");
  };

  const loadSimulatedData = () => {
    const now = new Date();
    const iso = (hoursAgo: number) => new Date(now.getTime() - hoursAgo * 60 * 60 * 1000).toISOString();

    const defaultUsers = getDefaultUsers();
    const adminUser = defaultUsers.find((user) => user.role === "Admin") ?? defaultUsers[0];
    const advisorUser = defaultUsers.find((user) => user.role === "Service Advisor") ?? defaultUsers[0];
    const chiefUser = defaultUsers.find((user) => user.role === "Chief Technician") ?? defaultUsers[0];
    const seniorUser = defaultUsers.find((user) => user.role === "Senior Mechanic") ?? defaultUsers[0];
    const mechanicUser = defaultUsers.find((user) => user.role === "General Mechanic") ?? defaultUsers[0];
    const officeUser = defaultUsers.find((user) => user.role === "Office Staff") ?? defaultUsers[0];

    const intake1Id = uid("intake");
    const intake2Id = uid("intake");
    const inspection1Id = uid("insp");
    const inspection2Id = uid("insp");
    const ro1Id = uid("ro");
    const ro2Id = uid("ro");
    const workLine1Id = uid("wl");
    const workLine2Id = uid("wl");
    const workLine3Id = uid("wl");
    const workLine4Id = uid("wl");
    const approval1Id = uid("apr");
    const qc1Id = uid("qc");
    const release1Id = uid("rel");
    const parts1Id = uid("pr");
    const invoice1Id = uid("inv");
    const payment1Id = uid("pay");
    const backjob1Id = uid("bj");
    const backjob2Id = uid("bj");
    const customer1Id = uid("cust");
    const customer2Id = uid("cust");
    const customer3Id = uid("cust");
    const token1Id = uid("tok");
    const booking1Id = uid("book");
    const booking2Id = uid("book");
    const booking3Id = uid("book");

    const intakeRecordsSeed: IntakeRecord[] = [
      {
        id: intake1Id,
        intakeNumber: nextDailyNumber("INT"),
        createdAt: iso(30),
        updatedAt: iso(28),
        customerName: "Miguel Santos",
        companyName: "",
        accountType: "Personal",
        phone: "09171234567",
        email: "miguel.santos@example.com",
        plateNumber: "NEX-2451",
        conductionNumber: "",
        make: "Toyota",
        model: "Fortuner",
        year: "2021",
        color: "Gray",
        odometerKm: "58210",
        fuelLevel: "1/2",
        assignedAdvisor: advisorUser.fullName,
        concern: "Front suspension noise and uneven tire wear.",
        notes: "Customer requested full underchassis check.",
        status: "Converted to RO",
        encodedBy: advisorUser.fullName,
      },
      {
        id: intake2Id,
        intakeNumber: nextDailyNumber("INT"),
        createdAt: iso(18),
        updatedAt: iso(12),
        customerName: "Andrea Lim",
        companyName: "Prime Movers Logistics",
        accountType: "Company / Fleet",
        phone: "09179876543",
        email: "fleet@primemovers.example.com",
        plateNumber: "ABJ-9087",
        conductionNumber: "",
        make: "Mitsubishi",
        model: "Montero Sport",
        year: "2023",
        color: "White",
        odometerKm: "22145",
        fuelLevel: "3/4",
        assignedAdvisor: advisorUser.fullName,
        concern: "A/C weak cooling and PMS due.",
        notes: "Fleet vehicle priority service.",
        status: "Converted to RO",
        encodedBy: advisorUser.fullName,
      },
    ];

    const inspection1: InspectionRecord = {
      ...getDefaultInspectionForm(),
      id: inspection1Id,
      inspectionNumber: nextDailyNumber("INSP"),
      intakeId: intake1Id,
      intakeNumber: intakeRecordsSeed[0].intakeNumber,
      createdAt: iso(27),
      updatedAt: iso(24),
      startedBy: chiefUser.fullName,
      status: "Completed",
      accountLabel: "Miguel Santos",
      plateNumber: "NEX-2451",
      conductionNumber: "",
      make: "Toyota",
      model: "Fortuner",
      year: "2021",
      color: "Gray",
      odometerKm: "58210",
      concern: "Front suspension noise and uneven tire wear.",
      enableSuspensionCheck: true,
      enableAlignmentCheck: true,
      frontShockState: "Needs Replacement",
      frontLowerControlArmState: "Needs Attention",
      frontLeftTireState: "Needs Attention",
      frontRightTireState: "Needs Attention",
      steeringFeelNotes: "Pulling slightly to the right during road test.",
      suspensionRoadTestNotes: "Knocking noise over uneven road.",
      recommendedWork: "Replace front shocks, inspect control arm bushings, perform alignment.",
      recommendationLines: [
        "Replace front shock absorbers",
        "Inspect / service lower control arm bushings",
        "Wheel alignment",
      ],
    };

    const inspection2: InspectionRecord = {
      ...getDefaultInspectionForm(),
      id: inspection2Id,
      inspectionNumber: nextDailyNumber("INSP"),
      intakeId: intake2Id,
      intakeNumber: intakeRecordsSeed[1].intakeNumber,
      createdAt: iso(11),
      updatedAt: iso(8),
      startedBy: seniorUser.fullName,
      status: "Completed",
      accountLabel: "Prime Movers Logistics",
      plateNumber: "ABJ-9087",
      conductionNumber: "",
      make: "Mitsubishi",
      model: "Montero Sport",
      year: "2023",
      color: "White",
      odometerKm: "22145",
      concern: "A/C weak cooling and PMS due.",
      enableAcCheck: true,
      enableUnderHood: true,
      acCoolingPerformanceState: "Needs Attention",
      acCabinFilterState: "Needs Replacement",
      acNotes: "Cabin filter dirty; vent temperature higher than expected.",
      engineOilCondition: "Needs Attention",
      recommendedWork: "Basic PMS, cabin filter replacement, A/C performance service.",
      recommendationLines: [
        "Basic PMS package",
        "Replace cabin air filter",
        "A/C performance inspection and service",
      ],
    };

    const repairOrdersSeed: RepairOrderRecord[] = [
      {
        id: ro1Id,
        roNumber: nextDailyNumber("RO"),
        createdAt: iso(25),
        updatedAt: iso(1),
        workStartedAt: iso(6),
        sourceType: "Intake",
        intakeId: intake1Id,
        inspectionId: inspection1Id,
        intakeNumber: intakeRecordsSeed[0].intakeNumber,
        inspectionNumber: inspection1.inspectionNumber,
        customerName: "Miguel Santos",
        companyName: "",
        accountType: "Personal",
        accountLabel: "Miguel Santos",
        phone: "09171234567",
        email: "miguel.santos@example.com",
        plateNumber: "NEX-2451",
        conductionNumber: "",
        make: "Toyota",
        model: "Fortuner",
        year: "2021",
        color: "Gray",
        odometerKm: "58210",
        customerConcern: "Front suspension noise and uneven tire wear.",
        advisorName: advisorUser.fullName,
        status: "In Progress",
        primaryTechnicianId: chiefUser.id,
        supportTechnicianIds: [mechanicUser.id],
        workLines: [
          {
            ...recalculateWorkLine({
              ...getEmptyWorkLine(),
              id: workLine1Id,
              title: "Replace front shock absorbers",
              category: "Suspension",
              priority: "High",
              status: "In Progress",
              laborHours: "2.5",
              laborRate: "950",
              partsCost: "6200",
              partsMarkupPercent: "20",
              notes: "Use matched pair replacement.",
              assignedTechnicianId: chiefUser.id,
              timerStatus: "Running",
              timerStartedAt: iso(2),
              accumulatedMinutes: 90,
              approvalDecision: "Approved",
              approvalAt: iso(20),
            }),
          },
          {
            ...recalculateWorkLine({
              ...getEmptyWorkLine(),
              id: workLine2Id,
              title: "Wheel alignment",
              category: "Alignment",
              priority: "Medium",
              status: "Pending",
              laborHours: "1",
              laborRate: "850",
              partsCost: "0",
              partsMarkupPercent: "0",
              notes: "Perform after suspension work completion.",
              assignedTechnicianId: mechanicUser.id,
              timerStatus: "Idle",
              timerStartedAt: "",
              accumulatedMinutes: 0,
              approvalDecision: "Approved",
              approvalAt: iso(20),
            }),
          },
        ],
        latestApprovalRecordId: approval1Id,
        deferredLineTitles: [],
        backjobReferenceRoId: "",
        findingRecommendationDecisions: [],
        encodedBy: advisorUser.fullName,
      },
      {
        id: ro2Id,
        roNumber: nextDailyNumber("RO"),
        createdAt: iso(10),
        updatedAt: iso(3),
        workStartedAt: iso(7),
        sourceType: "Intake",
        intakeId: intake2Id,
        inspectionId: inspection2Id,
        intakeNumber: intakeRecordsSeed[1].intakeNumber,
        inspectionNumber: inspection2.inspectionNumber,
        customerName: "Andrea Lim",
        companyName: "Prime Movers Logistics",
        accountType: "Company / Fleet",
        accountLabel: "Prime Movers Logistics",
        phone: "09179876543",
        email: "fleet@primemovers.example.com",
        plateNumber: "ABJ-9087",
        conductionNumber: "",
        make: "Mitsubishi",
        model: "Montero Sport",
        year: "2023",
        color: "White",
        odometerKm: "22145",
        customerConcern: "A/C weak cooling and PMS due.",
        advisorName: advisorUser.fullName,
        status: "Ready Release",
        primaryTechnicianId: seniorUser.id,
        supportTechnicianIds: [mechanicUser.id],
        workLines: [
          {
            ...recalculateWorkLine({
              ...getEmptyWorkLine(),
              id: workLine3Id,
              title: "Basic PMS package",
              category: "Preventive Maintenance",
              priority: "High",
              status: "Completed",
              laborHours: "1.5",
              laborRate: "900",
              partsCost: "4995",
              partsMarkupPercent: "0",
              notes: "Promo package applied.",
              assignedTechnicianId: seniorUser.id,
              timerStatus: "Completed",
              timerStartedAt: "",
              accumulatedMinutes: 95,
              completedAt: iso(5),
              approvalDecision: "Approved",
              approvalAt: iso(9),
            }),
          },
          {
            ...recalculateWorkLine({
              ...getEmptyWorkLine(),
              id: workLine4Id,
              title: "Replace cabin air filter",
              category: "Air Conditioning",
              priority: "Medium",
              status: "Completed",
              laborHours: "0.5",
              laborRate: "900",
              partsCost: "650",
              partsMarkupPercent: "15",
              notes: "Restored airflow after replacement.",
              assignedTechnicianId: mechanicUser.id,
              timerStatus: "Completed",
              timerStartedAt: "",
              accumulatedMinutes: 35,
              completedAt: iso(6),
              approvalDecision: "Approved",
              approvalAt: iso(9),
            }),
          },
        ],
        latestApprovalRecordId: "",
        deferredLineTitles: [],
        backjobReferenceRoId: "",
        findingRecommendationDecisions: [],
        encodedBy: officeUser.fullName,
      },
    ];

    const approvalRecordsSeed: ApprovalRecord[] = [
      {
        id: approval1Id,
        approvalNumber: nextDailyNumber("APP"),
        roId: ro1Id,
        roNumber: repairOrdersSeed[0].roNumber,
        createdAt: iso(20),
        decidedBy: advisorUser.fullName,
        customerName: "Miguel Santos",
        customerContact: "09171234567",
        summary: "Customer approved main suspension repair items.",
        communicationHook: "SMS",
        items: [
          { workLineId: workLine1Id, title: "Replace front shock absorbers", decision: "Approved", approvedAt: iso(20), note: "Approved by customer" },
          { workLineId: workLine2Id, title: "Wheel alignment", decision: "Approved", approvedAt: iso(20), note: "Approved by customer" },
        ],
      },
    ];

    const partsRequestsSeed: PartsRequestRecord[] = [
      {
        id: parts1Id,
        requestNumber: nextDailyNumber("PR"),
        roId: ro1Id,
        roNumber: repairOrdersSeed[0].roNumber,
        createdAt: iso(19),
        updatedAt: iso(4),
        requestedBy: chiefUser.fullName,
        status: "Ordered",
        partName: "Front shock absorber set",
        partNumber: "FSA-FTN-2021",
        quantity: "2",
        urgency: "High",
        notes: "Needed before alignment.",
        customerSellingPrice: "7440",
        selectedBidId: "bid_demo_1",
        plateNumber: "NEX-2451",
        vehicleLabel: "Toyota Fortuner 2021",
        accountLabel: "Miguel Santos",
        workshopPhotos: [],
        returnRecords: [],
        bids: [
          {
            id: "bid_demo_1",
            supplierName: "Northeast Parts Supply",
            brand: "KYB",
            quantity: "2",
            unitCost: "3100",
            totalCost: "6200",
            deliveryTime: "Same day",
            warrantyNote: "6 months supplier warranty",
            condition: "Brand New",
            notes: "Preferred supplier",
            createdAt: iso(18),
            productPhotos: [],
            invoiceFileName: "",
            shippingLabelFileName: "",
            trackingNumber: "",
            courierName: "",
            shippingNotes: "",
          },
        ],
      },
    ];

    const qcRecordsSeed: QCRecord[] = [
      {
        id: qc1Id,
        qcNumber: nextDailyNumber("QC"),
        roId: ro2Id,
        roNumber: repairOrdersSeed[1].roNumber,
        createdAt: iso(4),
        qcBy: chiefUser.fullName,
        result: "Passed",
        allApprovedWorkCompleted: true,
        noLeaksOrWarningLights: true,
        roadTestDone: true,
        cleanlinessCheck: true,
        noNewDamage: true,
        toolsRemoved: true,
        notes: "Ready for customer release.",
      },
    ];

    const releaseRecordsSeed: ReleaseRecord[] = [
      {
        id: release1Id,
        releaseNumber: nextDailyNumber("REL"),
        roId: ro2Id,
        roNumber: repairOrdersSeed[1].roNumber,
        createdAt: iso(2),
        releasedBy: officeUser.fullName,
        finalServiceAmount: "1800",
        finalPartsAmount: "5642.50",
        finalTotalAmount: "7442.50",
        releaseSummary: "Released after PMS and A/C refresh.",
        documentsReady: true,
        paymentSettled: true,
        noNewDamage: true,
        cleanVehicle: true,
        toolsRemoved: true,
      },
    ];

    const invoiceRecordsSeed: InvoiceRecord[] = [
      {
        id: invoice1Id,
        invoiceNumber: nextDailyNumber("INV"),
        roId: ro2Id,
        roNumber: repairOrdersSeed[1].roNumber,
        createdAt: iso(3),
        updatedAt: iso(2),
        createdBy: officeUser.fullName,
        laborSubtotal: "1800",
        partsSubtotal: "5642.50",
        discountAmount: "0",
        totalAmount: "7442.50",
        status: "Finalized",
        paymentStatus: "Paid",
        chargeAccountApproved: false,
        notes: "Demo paid invoice.",
      },
    ];

    const paymentRecordsSeed: PaymentRecord[] = [
      {
        id: payment1Id,
        paymentNumber: nextDailyNumber("PAY"),
        invoiceId: invoice1Id,
        roId: ro2Id,
        roNumber: repairOrdersSeed[1].roNumber,
        createdAt: iso(2),
        receivedBy: officeUser.fullName,
        amount: "7442.50",
        method: "GCash",
        referenceNumber: "GCASH-DEMO-2026",
        notes: "Demo payment",
      },
    ];

    const backjobRecordsSeed: BackjobRecord[] = [
      {
        id: backjob1Id,
        backjobNumber: nextDailyNumber("BJ"),
        linkedRoId: ro2Id,
        linkedRoNumber: repairOrdersSeed[1].roNumber,
        createdAt: iso(1.5),
        updatedAt: iso(0.5),
        plateNumber: "ABJ-9087",
        customerLabel: "Prime Movers Logistics",
        originalInvoiceNumber: invoiceRecordsSeed[0].invoiceNumber,
        comebackInvoiceNumber: nextDailyNumber("INV"),
        originalPrimaryTechnicianId: seniorUser.id,
        comebackPrimaryTechnicianId: mechanicUser.id,
        supportingTechnicianIds: [mechanicUser.id],
        complaint: "Customer reported a faint A/C odor after the release inspection.",
        findings: "Cabin filter contamination returned quickly and the evaporator housing needed cleaning.",
        rootCause: "Heavy dust buildup in the HVAC box and an overdue filter change interval.",
        responsibility: "Goodwill",
        actionTaken: "Replaced the cabin filter, cleaned the evaporator housing, and performed odor treatment.",
        resolutionNotes: "Vehicle was released after a monitored road test and cooler vent temperature.",
        status: "Closed",
        createdBy: officeUser.fullName,
      },
      {
        id: backjob2Id,
        backjobNumber: nextDailyNumber("BJ"),
        linkedRoId: ro1Id,
        linkedRoNumber: repairOrdersSeed[0].roNumber,
        createdAt: iso(0.8),
        updatedAt: iso(0.2),
        plateNumber: "NEX-2451",
        customerLabel: "Miguel Santos",
        originalInvoiceNumber: nextDailyNumber("INV"),
        comebackInvoiceNumber: nextDailyNumber("INV"),
        originalPrimaryTechnicianId: chiefUser.id,
        comebackPrimaryTechnicianId: chiefUser.id,
        supportingTechnicianIds: [mechanicUser.id],
        complaint: "Customer asked for a recheck after hearing a light clunk on rough roads.",
        findings: "Stabilizer link play and alignment drift were still present under load.",
        rootCause: "Wear on the suspension linkage remained after the first visit.",
        responsibility: "Warranty",
        actionTaken: "Scheduled repeat suspension work and alignment verification.",
        resolutionNotes: "Open comeback case for follow-up after parts arrival.",
        status: "In Progress",
        createdBy: advisorUser.fullName,
      },
    ];

    const workLogsSeed: WorkLog[] = [
      { id: uid("wlog"), roId: ro2Id, workLineId: workLine3Id, technicianId: seniorUser.id, startedAt: iso(7), endedAt: iso(5), totalMinutes: 95, note: "Completed basic PMS package" },
      { id: uid("wlog"), roId: ro2Id, workLineId: workLine4Id, technicianId: mechanicUser.id, startedAt: iso(6.5), endedAt: iso(6), totalMinutes: 35, note: "Replaced cabin air filter" },
    ];

    const bookingsSeed: BookingRecord[] = [
      {
        id: booking1Id,
        bookingNumber: nextDailyNumber("BKG"),
        createdAt: iso(5),
        updatedAt: iso(4),
        requestedDate: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        requestedTime: "09:00",
        customerName: "Miguel Santos",
        companyName: "",
        accountType: "Personal",
        phone: "09171234567",
        email: "miguel.santos@example.com",
        plateNumber: "NEX-2451",
        conductionNumber: "",
        make: "Toyota",
        model: "Fortuner",
        year: "2021",
        serviceType: "Backjob / Comeback",
        serviceDetail: "Same issue unresolved",
        concern: "Recheck suspension noise after shock replacement.",
        notes: "Customer requested morning slot.",
        status: "Confirmed",
        source: "Staff",
        createdBy: advisorUser.fullName,
        linkedCustomerId: customer1Id,
      },
      {
        id: booking2Id,
        bookingNumber: nextDailyNumber("BKG"),
        createdAt: iso(2),
        updatedAt: iso(1),
        requestedDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        requestedTime: "13:30",
        customerName: "Andrea Lim",
        companyName: "Prime Movers Logistics",
        accountType: "Company / Fleet",
        phone: "09179876543",
        email: "fleet@primemovers.example.com",
        plateNumber: "ABJ-9087",
        conductionNumber: "",
        make: "Mitsubishi",
        model: "Montero Sport",
        year: "2023",
        serviceType: "Preventive Maintenance",
        serviceDetail: "General maintenance check",
        concern: "Fleet PMS booking and A/C follow-up.",
        notes: "Priority fleet booking.",
        status: "New",
        source: "Customer Portal",
        createdBy: "Andrea Lim",
        linkedCustomerId: customer2Id,
      },
      {
        id: booking3Id,
        bookingNumber: nextDailyNumber("BKG"),
        createdAt: iso(1),
        updatedAt: iso(1),
        requestedDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        requestedTime: "10:30",
        customerName: "Carlos Reyes",
        companyName: "",
        accountType: "Personal",
        phone: "09175551234",
        email: "carlos.reyes@example.com",
        plateNumber: "CRX-5501",
        conductionNumber: "",
        make: "Honda",
        model: "Civic",
        year: "2019",
        serviceType: "Underchassis Check",
        serviceDetail: "Visual underchassis check",
        concern: "Pre-trip inspection and brake check.",
        notes: "Public booking landing page demo entry.",
        status: "Confirmed",
        source: "Customer Portal",
        createdBy: "Book Service",
        linkedCustomerId: customer3Id,
      },
    ];

    const customerAccountsSeed: CustomerAccount[] = [
      {
        id: customer1Id,
        fullName: "Miguel Santos",
        phone: "09171234567",
        email: "miguel.santos@example.com",
        password: "4567",
        linkedPlateNumbers: ["NEX-2451", "NEX-7788"],
        linkedRoIds: [ro1Id],
        createdAt: iso(30),
        updatedAt: iso(1),
      },
      {
        id: customer2Id,
        fullName: "Andrea Lim",
        phone: "09179876543",
        email: "fleet@primemovers.example.com",
        password: "6543",
        linkedPlateNumbers: ["ABJ-9087"],
        linkedRoIds: [ro2Id],
        createdAt: iso(18),
        updatedAt: iso(2),
      },
      {
        id: customer3Id,
        fullName: "Carlos Reyes",
        phone: "09175551234",
        email: "carlos.reyes@example.com",
        password: "1234",
        linkedPlateNumbers: ["CRX-5501"],
        linkedRoIds: [],
        createdAt: iso(12),
        updatedAt: iso(1),
      },
    ];

    const approvalLinkTokensSeed: ApprovalLinkToken[] = [
      {
        id: token1Id,
        roId: ro1Id,
        customerId: customer1Id,
        token: createSecurePortalToken(),
        createdAt: iso(20),
        expiresAt: getPortalTokenExpiry(),
        lastUsedAt: "",
        revokedAt: "",
        channel: "SMS",
      },
    ];

    const smsApprovalLogsSeed: SmsApprovalDispatchLog[] = [
      {
        id: uid("sms"),
        roId: ro1Id,
        roNumber: repairOrdersSeed[0].roNumber,
        customerId: customer1Id,
        customerName: "Miguel Santos",
        phoneNumber: "09171234567",
        tokenId: token1Id,
        sentTo: "09171234567",
        messageType: "approval-request",
        message: `Demo approval link for ${repairOrdersSeed[0].roNumber}: ${buildCustomerApprovalLinkUrl(approvalLinkTokensSeed[0].token)}`,
        status: "Sent",
        provider: "Simulated",
        createdAt: iso(20),
      },
    ];

    setUsers(defaultUsers);
    setRoleDefinitions(getDefaultRoleDefinitions());
    setIntakeRecords(intakeRecordsSeed);
    setInspectionRecords([inspection1, inspection2]);
    setRepairOrders(repairOrdersSeed);
    setApprovalRecords(approvalRecordsSeed);
    setPartsRequests(partsRequestsSeed);
    setQcRecords(qcRecordsSeed);
    setReleaseRecords(releaseRecordsSeed);
    setInvoiceRecords(invoiceRecordsSeed);
    setPaymentRecords(paymentRecordsSeed);
    setWorkLogs(workLogsSeed);
    setBookings(bookingsSeed);
    setBackjobRecords(backjobRecordsSeed);
    setCustomerAccounts(customerAccountsSeed);
    setApprovalLinkTokens(approvalLinkTokensSeed);
    setSmsApprovalLogs(smsApprovalLogsSeed);
    setCurrentView("dashboard");
    setLoginError("");
    setCustomerLoginError("");
    setSupplierLoginError("");
    setPublicBookingError("");
    setCustomerSession(null);
    setCustomerPortalMode("real");
    setPendingDemoCustomerPortal(false);
  };

  const openDemoCustomerPortal = () => {
    loadSimulatedData();
    setLoginError("");
    setCustomerLoginError("");
    setCustomerApprovalLinkError("");
    setCustomerPortalMode("demo");
    setCustomerPortalLaunchView("dashboard");
    setCustomerPortalSharedRoId("");
    setPendingDemoCustomerPortal(true);
    setLoginAudience("customer");
  };

  const openDemoCustomerApprovalLink = (ro: RepairOrderRecord) => {
    const customer =
      customerAccounts.find((account) => Array.isArray(account.linkedRoIds) && account.linkedRoIds.includes(ro.id)) ||
      customerAccounts.find((account) => sanitizePhone(account.phone) && sanitizePhone(account.phone) === sanitizePhone(ro.phone || "")) ||
      customerAccounts.find((account) => !!account.email && !!ro.email && account.email.toLowerCase() === ro.email.toLowerCase()) ||
      null;

    if (!customer) {
      setAutoPortalMessage("No customer account is linked to this RO yet.");
      return;
    }

    const createdAt = new Date().toISOString();
    const token: ApprovalLinkToken = {
      id: uid("apt"),
      roId: ro.id,
      customerId: customer.id,
      token: createSecurePortalToken(),
      createdAt,
      expiresAt: getPortalTokenExpiry(72),
      lastUsedAt: "",
      revokedAt: "",
      channel: "Manual",
    };

    const link = buildCustomerPortalUrl(token.token);
    const message = `Demo approval link for RO ${ro.roNumber}: ${link}`;
    setApprovalLinkTokens((prev) => [
      token,
      ...prev.map((row) => (row.roId === ro.id && !row.revokedAt ? { ...row, revokedAt: createdAt } : row)),
    ]);
    setSmsApprovalLogs((prev) => [
      {
        id: uid("sms"),
        roId: ro.id,
        roNumber: ro.roNumber,
        customerId: customer.id,
        customerName: customer.fullName,
        phoneNumber: customer.phone || "",
        tokenId: token.id,
        sentTo: customer.phone || customer.email || "",
        messageType: "approval-request",
        message,
        status: "Sent",
        provider: "Simulated",
        createdAt,
      },
      ...prev,
    ]);
    setCustomerSession(customer);
    setCustomerPortalMode("demo");
    setCustomerPortalLaunchView("approvals");
    setCustomerPortalSharedRoId(ro.id);
    setCustomerApprovalLinkError("");
    setPendingDemoCustomerPortal(false);
    setLoginAudience("customer");
    setCustomerLoginError("");
    setAutoPortalMessage(message);
  };

  const quickStaffLogin = (username: string) => {
    const found = users.find((user) => user.active && user.username.toLowerCase() === username.toLowerCase());
    if (!found) {
      setLoginError("Demo user not found.");
      return;
    }
    setLoginForm({ username: found.username, password: found.password });
    completeStaffLogin(found);
  };

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
    setCustomerPortalMode("real");
    setCustomerPortalLaunchView("dashboard");
    setCustomerPortalSharedRoId("");
    setCustomerApprovalLinkError("");
  };


  const handleCustomerLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = customerLoginForm.identifier.trim().toLowerCase();
    const password = customerLoginForm.password.trim();

    if (!identifier || !password) {
      setCustomerLoginError("Please enter phone/email and password.");
      return;
    }

    const normalizedPhone = sanitizePhone(identifier);
    const found = customerAccounts.find((account) => {
      const phoneMatch = normalizedPhone && sanitizePhone(account.phone) === normalizedPhone;
      const emailMatch = !!account.email && account.email.toLowerCase() === identifier;
      return (phoneMatch || emailMatch) && account.password === password;
    });

    if (!found) {
      setCustomerLoginError("Invalid customer portal credentials.");
      return;
    }

    setCustomerSession(found);
    setCustomerLoginForm({ identifier: "", password: "" });
    setCustomerLoginError("");
    setCustomerPortalMode("real");
    setCustomerPortalLaunchView("dashboard");
    setCustomerPortalSharedRoId("");
    setCustomerApprovalLinkError("");
    setPendingDemoCustomerPortal(false);
  };

  const handleCustomerLogout = () => {
    setCustomerSession(null);
    setCustomerPortalMode("real");
    setCustomerPortalLaunchView("dashboard");
    setCustomerPortalSharedRoId("");
    setCustomerApprovalLinkError("");
    setPendingDemoCustomerPortal(false);
    setCustomerLoginError("");
  };

  const handleSupplierLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const supplierName = supplierLoginForm.supplierName.trim();
    if (!supplierName) {
      setSupplierLoginError("Please enter your supplier name.");
      return;
    }
    setSupplierSession({ supplierName });
    setSupplierLoginForm({ supplierName: "" });
    setSupplierLoginError("");
  };

  const handlePublicBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const customerName = publicBookingForm.customerName.trim();
    const concern = publicBookingForm.concern.trim();
    if (!customerName || !publicBookingForm.phone.trim() || !publicBookingForm.requestedDate || !publicBookingForm.requestedTime || !concern) {
      setPublicBookingError("Name, phone, preferred date, preferred time, and concern are required.");
      return;
    }
    const now = new Date().toISOString();
    const newBooking: BookingRecord = {
      id: uid("book"),
      bookingNumber: nextDailyNumber("BKG"),
      createdAt: now,
      updatedAt: now,
      requestedDate: publicBookingForm.requestedDate,
      requestedTime: publicBookingForm.requestedTime,
      customerName,
      companyName: publicBookingForm.companyName.trim(),
      accountType: publicBookingForm.companyName.trim() ? "Company / Fleet" : "Personal",
      phone: publicBookingForm.phone.trim(),
      email: publicBookingForm.email.trim(),
      plateNumber: publicBookingForm.plateNumber.trim().toUpperCase(),
      conductionNumber: publicBookingForm.conductionNumber.trim().toUpperCase(),
      make: publicBookingForm.make.trim(),
      model: publicBookingForm.model.trim(),
      year: publicBookingForm.year.trim(),
      serviceType: publicBookingForm.serviceType,
      serviceDetail: publicBookingForm.serviceDetail,
      concern,
      notes: publicBookingForm.notes.trim(),
      status: "New",
      source: "Customer Portal",
      createdBy: "Book Service",
    };
    setBookings((prev) => [newBooking, ...prev]);
    setPublicBookingForm({
      ...getDefaultBookingForm("Book Service"),
      requestedDate: publicBookingForm.requestedDate,
      requestedTime: publicBookingForm.requestedTime,
    });
    setPublicBookingError("");
    setLoginAudience("booking");
  };

  const handleSupplierLogout = () => {
    setSupplierSession(null);
    setSupplierLoginError("");
  };

  const generateSmsApprovalLink = (ro: RepairOrderRecord) => {
    const customer = customerAccounts.find((account) => Array.isArray(account.linkedRoIds) && account.linkedRoIds.includes(ro.id)) ||
      customerAccounts.find((account) => sanitizePhone(account.phone) && sanitizePhone(account.phone) === sanitizePhone(ro.phone || "")) ||
      customerAccounts.find((account) => !!account.email && !!ro.email && account.email.toLowerCase() === ro.email.toLowerCase()) ||
      null;

    if (!customer) {
      setAutoPortalMessage("No customer account is linked to this RO yet.");
      return;
    }

    const createdAt = new Date().toISOString();
    const token: ApprovalLinkToken = {
      id: uid("apt"),
      roId: ro.id,
      customerId: customer.id,
      token: createSecurePortalToken(),
      createdAt,
      expiresAt: getPortalTokenExpiry(72),
      lastUsedAt: "",
      revokedAt: "",
      channel: "SMS",
    };

    const link = buildCustomerPortalUrl(token.token);
    const message = `Northeast Car Care Centre: Review and approve RO ${ro.roNumber} here ${link}`;
    setApprovalLinkTokens((prev) => [
      token,
      ...prev.map((row) => (row.roId === ro.id && !row.revokedAt ? { ...row, revokedAt: createdAt } : row)),
    ]);
    setSmsApprovalLogs((prev) => [
      {
        id: uid("sms"),
        roId: ro.id,
        roNumber: ro.roNumber,
        customerId: customer.id,
        customerName: customer.fullName,
        phoneNumber: customer.phone || "",
        tokenId: token.id,
        sentTo: customer.phone || customer.email || "",
        messageType: "approval-request",
        message,
        status: "Sent",
        provider: "Simulated",
        createdAt,
      },
      ...prev,
    ]);
    setAutoPortalMessage(message);
  };

  const sendSmsTemplate = async (payload: SmsSendPayload): Promise<SmsSendResult> => {
    const createdAt = new Date().toISOString();
    const logId = uid("sms");
    const provider = getSmsProviderConfig();

    setSmsApprovalLogs((prev) => [
      {
        id: logId,
        roId: payload.roId,
        roNumber: payload.roNumber,
        customerId: payload.customerId,
        customerName: payload.customerName,
        phoneNumber: payload.phoneNumber,
        tokenId: payload.tokenId,
        sentTo: payload.phoneNumber,
        messageType: payload.messageType,
        message: payload.messageBody,
        status: "Pending",
        provider: provider.provider,
        createdAt,
      },
      ...prev,
    ]);

    const result = await dispatchSmsTemplateMessage(payload);
    setSmsApprovalLogs((prev) =>
      prev.map((row) =>
        row.id === logId
          ? {
              ...row,
              status: result.status,
              provider: result.provider,
              providerResponse: result.providerResponse,
              errorMessage: result.errorMessage,
            }
          : row
      )
    );

    return result;
  };

  const revokeApprovalLink = (tokenId: string) => {
    setApprovalLinkTokens((prev) =>
      prev.map((row) => (row.id === tokenId ? { ...row, revokedAt: new Date().toISOString() } : row))
    );
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
    setCustomerAccounts([]);
    setCustomerSession(null);
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
    localStorage.removeItem(STORAGE_KEYS.customerAccounts);
    localStorage.removeItem(STORAGE_KEYS.customerSession);
    localStorage.removeItem(STORAGE_KEYS.approvalLinkTokens);
    localStorage.removeItem(STORAGE_KEYS.smsApprovalLogs);
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
            workLogs={workLogs}
            partsRequests={partsRequests}
            isCompactLayout={isMobile}
          />
        );
      case "bookings":
        return (
          <BookingsPage
            currentUser={currentUser}
            bookings={bookings}
            setBookings={setBookings}
            intakeRecords={intakeRecords}
            setIntakeRecords={setIntakeRecords}
            inspectionRecords={inspectionRecords}
            setInspectionRecords={setInspectionRecords}
            isCompactLayout={isMobile}
          />
        );
      case "intake":
        return (
          <IntakePage
            currentUser={currentUser}
            intakeRecords={intakeRecords}
            setIntakeRecords={setIntakeRecords}
            inspectionRecords={inspectionRecords}
            setInspectionRecords={setInspectionRecords}
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
            partsRequests={partsRequests}
            releaseRecords={releaseRecords}
            approvalLinkTokens={approvalLinkTokens}
            autoPortalMessage={autoPortalMessage}
            smsApprovalLogs={smsApprovalLogs}
            onGenerateSmsApprovalLink={generateSmsApprovalLink}
            onOpenDemoCustomerApprovalLink={openDemoCustomerApprovalLink}
            onSendSmsTemplate={sendSmsTemplate}
            onRevokeApprovalLink={revokeApprovalLink}
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
            workLogs={workLogs}
            setWorkLogs={setWorkLogs}
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
      case "backjobs":
        return (
          <BackjobPage
            currentUser={currentUser}
            users={users}
            repairOrders={repairOrders}
            invoiceRecords={invoiceRecords}
            backjobRecords={backjobRecords}
            setBackjobRecords={setBackjobRecords}
            isCompactLayout={isMobile}
          />
        );
      case "history":
        return (
          <HistoryPage
            currentUser={currentUser}
            intakeRecords={intakeRecords}
            inspectionRecords={inspectionRecords}
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
            workLogs={workLogs}
            partsRequests={partsRequests}
            isCompactLayout={isMobile}
          />
        );
    }
  };

  if (customerApprovalLinkError) {
    return (
      <>
        <style>{globalCss}</style>
        <div style={styles.appShell}>
          <div style={styles.mainArea}>
            <div style={styles.pageContent}>
              <div style={styles.grid}>
                <div style={{ ...styles.gridItem, gridColumn: "span 12" }}>
                  <Card title="Customer View" subtitle="Shared approval link">
                    <div style={styles.errorBox}>{customerApprovalLinkError}</div>
                    <div style={styles.formHint}>
                      This shared link is invalid or expired. Please request a fresh customer approval link from the shop.
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (customerSession) {
    return (
      <CustomerPortalErrorBoundary onReset={handleCustomerLogout}>
        <CustomerPortalPage
          customer={customerSession}
          repairOrders={repairOrders}
          setRepairOrders={setRepairOrders}
          approvalLinkTokens={approvalLinkTokens}
          intakeRecords={intakeRecords}
          inspectionRecords={inspectionRecords}
          qcRecords={qcRecords}
          releaseRecords={releaseRecords}
          approvalRecords={approvalRecords}
          backjobRecords={backjobRecords}
          invoiceRecords={invoiceRecords}
          paymentRecords={paymentRecords}
          bookings={bookings}
          setBookings={setBookings}
          customerAccounts={customerAccounts}
          setCustomerAccounts={setCustomerAccounts}
          setCustomerSession={setCustomerSession}
          onLogout={handleCustomerLogout}
          isCompactLayout={isMobile}
          isDemoMode={customerPortalMode === "demo"}
          portalLaunchView={customerPortalLaunchView}
          sharedLinkRoId={customerPortalSharedRoId}
          sharedLinkMode={!!customerPortalSharedRoId}
        />
      </CustomerPortalErrorBoundary>
    );
  }

  if (supplierSession) {
    return (
      <SupplierPortalPage
        supplier={supplierSession}
        partsRequests={partsRequests}
        setPartsRequests={setPartsRequests}
        onLogout={handleSupplierLogout}
        isCompactLayout={isMobile}
      />
    );
  }

  if (!currentUser) {
    return (
      <>
        <style>{globalCss}</style>
        <LoginScreen
          audience={loginAudience}
          setAudience={setLoginAudience}
          staffForm={loginForm}
          setStaffForm={setLoginForm}
          staffError={loginError}
          onStaffSubmit={handleLogin}
          customerForm={customerLoginForm}
          setCustomerForm={setCustomerLoginForm}
          customerError={customerLoginError}
          onCustomerSubmit={handleCustomerLogin}
          supplierForm={supplierLoginForm}
          setSupplierForm={setSupplierLoginForm}
          supplierError={supplierLoginError}
          onSupplierSubmit={handleSupplierLogin}
          publicBookingForm={publicBookingForm}
          setPublicBookingForm={setPublicBookingForm}
          publicBookingError={publicBookingError}
          onPublicBookingSubmit={handlePublicBookingSubmit}
          onQuickStaffLogin={quickStaffLogin}
          onLoadDemoData={loadSimulatedData}
          onOpenDemoCustomerPortal={openDemoCustomerPortal}
        />
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
                  â˜°
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
    padding: 18,
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
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.06)",
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
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 16,
    padding: 14,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
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
    justifyContent: "space-between",
    gap: 10,
    border: "1px solid rgba(148, 163, 184, 0.18)",
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
    border: "1px solid rgba(148, 163, 184, 0.18)",
    borderRadius: 16,
    background: "#ffffff",
  },

  table: {
    minWidth: 900,
    width: "100%",
  },

  th: {
    textAlign: "left",
    padding: "13px 12px",
    borderBottom: "1px solid rgba(226, 232, 240, 0.95)",
    background: "#f8fafc",
    color: "#475569",
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 0.2,
    whiteSpace: "nowrap",
  },

  td: {
    padding: "13px 12px",
    borderBottom: "1px solid rgba(226, 232, 240, 0.9)",
    color: "#111827",
    fontSize: 13,
    verticalAlign: "top",
    lineHeight: 1.5,
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
    maxWidth: 520,
    background: "rgba(255,255,255,0.97)",
    borderRadius: 24,
    padding: 26,
    border: "1px solid rgba(255,255,255,0.72)",
    boxShadow: "0 24px 70px rgba(2, 8, 23, 0.24)",
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

  buttonDisabled: {
    opacity: 0.55,
    cursor: "not-allowed",
  },

  inlineActions: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "center",
  },

  inlineActionsColumn: {
    display: "grid",
    gap: 8,
  },

  demoBox: {
    marginTop: 20,
    paddingTop: 16,
    borderTop: "1px solid rgba(148, 163, 184, 0.28)",
  },

  demoTitle: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 10,
  },

  demoGrid: {
    display: "grid",
    gap: 8,
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.55,
  },

  updateNoteBox: {
    background: "linear-gradient(180deg, #f8fafc 0%, #eff6ff 100%)",
    border: "1px solid rgba(37, 99, 235, 0.16)",
    borderRadius: 16,
    padding: 14,
    marginTop: 18,
  },

  updateNoteTitle: {
    fontSize: 13,
    fontWeight: 800,
    color: "#0f172a",
    marginBottom: 6,
  },

  updateNoteText: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.55,
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


  inspectionActionBanner: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    padding: 14,
    borderRadius: 16,
    border: "1px solid rgba(29,78,216,0.16)",
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(239,246,255,0.98) 100%)",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
    position: "sticky",
    top: 12,
    zIndex: 4,
  },

  inspectionActionSummary: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    flex: 1,
  },

  inspectionSummaryPill: {
    minWidth: 118,
    display: "grid",
    gap: 4,
    padding: "10px 12px",
    borderRadius: 14,
    background: "#ffffff",
    border: "1px solid #dbeafe",
    color: "#1e3a8a",
    fontSize: 12,
  },

  pillWrap: {
    display: "flex",
    flexWrap: "wrap",
    gap: 8,
  },

  pillButton: {
    border: "1px solid #bfdbfe",
    borderRadius: 999,
    padding: "8px 12px",
    background: "#eff6ff",
    color: "#1d4ed8",
    fontWeight: 700,
    cursor: "pointer",
  },

  statusNeutral: {
    display: "inline-flex",
    alignItems: "center",
    borderRadius: 999,
    padding: "6px 10px",
    background: "#e2e8f0",
    color: "#475569",
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },

  portalTabActive: {
    background: "#1d4ed8",
    color: "#ffffff",
    borderColor: "#1d4ed8",
    boxShadow: "0 10px 24px rgba(29, 78, 216, 0.22)",
  },

  textareaLarge: {
    width: "100%",
    minHeight: 140,
    border: "1px solid rgba(37, 99, 235, 0.22)",
    borderRadius: 14,
    padding: "12px 14px",
    background: "#ffffff",
    outline: "none",
    color: "#0f172a",
    lineHeight: 1.5,
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

  sectionCard: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,250,252,0.98) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: 18,
    padding: 16,
    boxShadow: "0 6px 22px rgba(15, 23, 42, 0.06)",
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

  formHint: {
    fontSize: 12,
    color: "#64748b",
    lineHeight: 1.5,
  },

  summaryGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: 10,
    marginBottom: 12,
  },

  concernBanner: {
    borderRadius: 14,
    padding: "12px 14px",
    background: "#fff7ed",
    border: "1px solid #fed7aa",
    color: "#9a3412",
    fontSize: 13,
    lineHeight: 1.5,
    marginBottom: 12,
  },

  queueStack: {
    display: "grid",
    gap: 10,
  },

  queueCard: {
    width: "100%",
    textAlign: "left",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    borderRadius: 16,
    padding: 14,
    cursor: "pointer",
    boxShadow: "0 4px 16px rgba(15, 23, 42, 0.05)",
  },

  queueCardActive: {
    border: "1px solid #1d4ed8",
    boxShadow: "0 0 0 3px rgba(29, 78, 216, 0.12)",
  },

  queueCardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },

  queueLine: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
  },

  queueLineMuted: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
  },

  mobileCardList: {
    display: "grid",
    gap: 12,
  },

  mobileDataCard: {
    border: "1px solid rgba(148, 163, 184, 0.22)",
    background: "#ffffff",
    borderRadius: 18,
    padding: 14,
    boxShadow: "0 6px 18px rgba(15, 23, 42, 0.05)",
  },

  mobileDataCardSelected: {
    border: "1px solid #1d4ed8",
    boxShadow: "0 0 0 3px rgba(29, 78, 216, 0.12)",
  },

  mobileDataCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
    flexWrap: "wrap",
  },

  mobileDataPrimary: {
    fontSize: 14,
    fontWeight: 800,
    color: "#0f172a",
  },

  mobileDataSecondary: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 1.5,
  },

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

  mobileActionStack: {
    display: "grid",
    gap: 8,
    marginTop: 12,
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

  stickyActionBar: {
    position: "sticky",
    bottom: 0,
    display: "grid",
    gap: 8,
    padding: 12,
    background: "rgba(255,255,255,0.96)",
    borderTop: "1px solid rgba(148, 163, 184, 0.2)",
    borderRadius: 16,
    boxShadow: "0 -8px 24px rgba(15, 23, 42, 0.08)",
  },

  actionButtonWide: {
    width: "100%",
    justifyContent: "center",
  },

  toggleGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 10,
  },

  checkboxTile: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(148, 163, 184, 0.22)",
    background: "#ffffff",
    color: "#334155",
    fontSize: 13,
    fontWeight: 700,
  },

  tablePrimary: {
    fontSize: 13,
    fontWeight: 800,
    color: "#0f172a",
  },

  tableSecondary: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 1.4,
  },

  concernCell: {
    maxWidth: 260,
    whiteSpace: "normal",
    lineHeight: 1.5,
    color: "#334155",
  },

  concernCard: {
    marginTop: 10,
    padding: "10px 12px",
    borderRadius: 12,
    background: "#f8fafc",
    border: "1px solid rgba(148, 163, 184, 0.2)",
    fontSize: 13,
    color: "#334155",
    lineHeight: 1.5,
  },

  registrySummary: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },

  logoutButtonCompact: {
    border: "none",
    background: "#dc2626",
    color: "#fff",
    borderRadius: 10,
    padding: "9px 12px",
    fontWeight: 700,
    cursor: "pointer",
  },

  statNote: {
    fontSize: 12,
    color: "#94a3b8",
    marginTop: 8,
  },

  summaryBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    padding: "12px 14px",
    borderRadius: 14,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  summaryPanel: {
    padding: 14,
    borderRadius: 16,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  summaryTile: {
    padding: 12,
    borderRadius: 14,
    background: "#ffffff",
    border: "1px solid #e2e8f0",
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
    lineHeight: 1.4,
  },

  detailPanel: {
    padding: 16,
    borderRadius: 18,
    background: "#ffffff",
    border: "1px solid #dbe4f0",
    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
  },

  detailBanner: {
    padding: 14,
    borderRadius: 16,
    background: "#eff6ff",
    border: "1px solid #bfdbfe",
  },

  detailGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: 12,
  },

  filterBar: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) auto auto",
    gap: 10,
    alignItems: "end",
  },

  twoColumnForm: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 14,
  },

  threeColumnForm: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 14,
  },

  formGrid4: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 14,
  },

  checkboxList: {
    display: "grid",
    gap: 10,
    padding: 12,
    borderRadius: 14,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  checkboxCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    borderRadius: 12,
    background: "#ffffff",
    border: "1px solid #dbe4f0",
    fontWeight: 600,
    color: "#334155",
  },

  mobileCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    background: "#ffffff",
    padding: 14,
    boxShadow: "0 4px 14px rgba(15, 23, 42, 0.04)",
  },

  mobileCardHeader: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 8,
  },

  mobileCardTitle: {
    fontSize: 15,
    fontWeight: 800,
    color: "#0f172a",
  },

  mobileCardSubtitle: {
    fontSize: 12,
    color: "#64748b",
    marginTop: 4,
  },

  mobileCardMeta: {
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.6,
  },

  mobileCardNote: {
    marginTop: 8,
    fontSize: 13,
    color: "#475569",
    lineHeight: 1.6,
    padding: "10px 12px",
    borderRadius: 12,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },

  mobileDataCardButton: {
    width: "100%",
    border: "1px solid #dbe4f0",
    borderRadius: 16,
    background: "#ffffff",
    padding: 12,
    textAlign: "left",
    cursor: "pointer",
    transition: "all 0.15s ease",
  },

  mobileDataCardButtonActive: {
    borderColor: "#93c5fd",
    background: "#eff6ff",
    boxShadow: "0 0 0 1px #bfdbfe inset",
  },


  partsMediaGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
    gap: 10,
  },

  partsMediaCard: {
    border: "1px solid rgba(148, 163, 184, 0.22)",
    borderRadius: 14,
    padding: 10,
    background: "#ffffff",
  },

  partsMediaImage: {
    width: "100%",
    height: 110,
    objectFit: "cover",
    borderRadius: 10,
    border: "1px solid rgba(148, 163, 184, 0.2)",
    marginBottom: 8,
  },
};
