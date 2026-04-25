// Shared TypeScript types extracted from App.tsx

export type IntakeRecord = {
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
  updatedBy?: string;
};

export type RepairOrderRecord = {
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
  findingRecommendationDecisions: FindingRecommendationDecision[];
  encodedBy: string;
  updatedBy?: string;
  pullOutReason?: string;
  pulledOutAt?: string;
  pulledOutBy?: string;
};

export type QCRecord = {
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
  updatedAt?: string;
  updatedBy?: string;
};

export type ReleaseRecord = {
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
  updatedAt?: string;
  updatedBy?: string;
};

export type ApprovalRecord = {
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

export type BackjobRecord = {
  id: string;
  backjobNumber: string;
  linkedRoId: string;
  linkedRoNumber: string;
  createdAt: string;
  updatedAt: string;
  plateNumber: string;
  customerLabel: string;
  originalInvoiceNumber: string;
  comebackInvoiceNumber: string;
  originalPrimaryTechnicianId: string;
  comebackPrimaryTechnicianId: string;
  supportingTechnicianIds: string[];
  complaint: string;
  findings: string;
  rootCause: string;
  responsibility: BackjobOutcome;
  actionTaken: string;
  resolutionNotes: string;
  status: "Open" | "In Progress" | "Monitoring" | "Closed";
  createdBy: string;
  updatedBy?: string;
};

export type InvoiceRecord = {
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
  updatedBy?: string;
};

export type PaymentRecord = {
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

export type WorkLog = {
  id: string;
  roId: string;
  workLineId: string;
  technicianId: string;
  startedAt: string;
  endedAt?: string;
  totalMinutes: number;
  note: string;
};

export type UserRole =
  | "Admin"
  | "Service Advisor"
  | "Chief Technician"
  | "Senior Mechanic"
  | "General Mechanic"
  | "Office Staff"
  | "Reception"
  | "OJT";

export type Permission =
  | "dashboard.view"
  | "bookings.view"
  | "intake.view"
  | "inspection.view"
  | "repairOrders.view"
  | "shopFloor.view"
  | "qualityControl.view"
  | "release.view"
  | "parts.view"
  | "backjobs.view"
  | "history.view"
  | "users.view"
  | "users.manage"
  | "roles.view"
  | "roles.manage"
  | "settings.view";

export type ViewKey =
  | "dashboard"
  | "bookings"
  | "intake"
  | "inspection"
  | "repairOrders"
  | "shopFloor"
  | "qualityControl"
  | "release"
  | "parts"
  | "backjobs"
  | "history"
  | "users"
  | "roles"
  | "settings";

export type RoleDefinition = {
  role: UserRole;
  permissions: Permission[];
};

export type UserAccount = {
  id: string;
  username: string;
  password: string;
  fullName: string;
  role: UserRole;
  active: boolean;
  createdAt: string;
};

export type SessionUser = Omit<UserAccount, "password">;

export type NavItem = {
  key: ViewKey;
  label: string;
  icon: string;
  permission: Permission;
};

export type MaintenanceIntervalRuleRecord = {
  id: string;
  serviceKey: string;
  title: string;
  category: string;
  kmInterval: string;
  timeIntervalValue: string;
  timeIntervalUnit: "Days" | "Months" | "";
  active: boolean;
  adminNote: string;
  make: string;
  model: string;
  yearFrom: string;
  yearTo: string;
  createdAt: string;
  updatedAt: string;
};

export type ServicePricingCatalogRecord = {
  id: string;
  serviceKey: string;
  title: string;
  category: string;
  basePrice: string;
  active: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
};

// --- MISSING BASE TYPES ---

export type VehicleAccountType = "Personal" | "Company / Fleet";

export type IntakeStatus = "Draft" | "Waiting Inspection" | "Converted to RO" | "Cancelled";

export type RepairOrderSourceType = "Intake" | "Manual";

export type ROStatus =
  | "Draft"
  | "Waiting Inspection"
  | "Waiting Approval"
  | "Approved / Ready to Work"
  | "In Progress"
  | "Waiting Parts"
  | "Quality Check"
  | "Ready Release"
  | "Released"
  | "Pulled Out"
  | "Closed";

export type ApprovalDecision = "Pending" | "Approved" | "Declined" | "Deferred";

export type WorkLineStatus = "Pending" | "In Progress" | "Waiting Parts" | "Completed";

export type WorkLinePriority = "Low" | "Medium" | "High";

export type RepairOrderWorkLine = {
  id: string;
  title: string;
  category: string;
  priority: WorkLinePriority;
  status: WorkLineStatus;
  serviceKey?: string;
  serviceEstimate: string;
  partsEstimate: string;
  totalEstimate: string;
  notes: string;
  customerDescription: string;
  laborHours: string;
  laborRate: string;
  partsCost: string;
  partsMarkupPercent: string;
  estimateUploadName?: string;
  recommendationSource?: string;
  sourceRecommendationId?: string;
  approvalDecision?: ApprovalDecision;
  approvalAt?: string;
  assignedTechnicianId?: string;
  timerStatus?: "Idle" | "Running" | "Paused" | "Completed";
  timerStartedAt?: string;
  accumulatedMinutes?: number;
  completedAt?: string;
};

export type VehicleServiceHistoryRecord = {
  id: string;
  vehicleKey: string;
  plateNumber: string;
  roId: string;
  roNumber: string;
  serviceKey: string;
  title: string;
  category: string;
  completedAt: string;
  odometerAtCompletion: string;
  sourceWorkLineId: string;
  sourceType: "WorkLine" | "Recommendation";
  historyOrigin?: "Writeback" | "Seeded / Demo";
  createdAt: string;
  updatedAt: string;
};

export type FindingRecommendationDecision = {
  recommendationId: string;
  title: string;
  category: string;
  decision: ApprovalDecision;
  decidedAt: string;
  note: string;
};

export type QCResult = "Passed" | "Failed";

export type ApprovalWorkItem = {
  workLineId: string;
  title: string;
  decision: ApprovalDecision;
  approvedAt: string;
  note: string;
};

export type BackjobOutcome = "Customer Pay" | "Internal" | "Warranty" | "Goodwill";

export type InvoiceStatus = "Draft" | "Finalized" | "Voided";

export type PaymentStatus = "Unpaid" | "Partial" | "Paid";

export type PaymentMethod = "Cash" | "GCash" | "Bank Transfer" | "Card" | "Charge Account / Fleet";


export type InspectionStatus = "In Progress" | "Completed";

export type InspectionCheckValue =
  | "Good"
  | "Monitor"
  | "Needs Attention"
  | "Needs Replacement"
  | "Not Checked";

export type WarningLightState = "Off" | "On" | "Not Checked";

export type RearSuspensionType = "Coil Spring" | "Leaf Spring" | "Other";

export type InspectionEvidenceType = "Photo" | "Video";

export type InspectionEvidenceRecord = {
  id: string;
  type: InspectionEvidenceType;
  section: string;
  itemLabel: string;
  fileName: string;
  previewDataUrl: string;
  addedAt: string;
  mobileOptimized: boolean;
};

export type FindingStatus = "OK" | "Monitor" | "Replace";

export type CategoryAdditionalFinding = {
  id: string;
  title: string;
  note: string;
  status: FindingStatus;
  photoNotes: string[];
};

export type InspectionRecord = {
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

export type ApprovalLinkToken = {
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

export type PartsRequestStatus =
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

export type PartsRequestUrgency = "Low" | "Medium" | "High";

export type SupplierBidCondition = "Brand New" | "OEM" | "Replacement" | "Surplus";
export type PartsMediaOwner = "Workshop" | "Supplier" | "Return";
export type PartsReturnResponseStatus = "Requested" | "Approved" | "Rejected" | "Replacement in Process" | "Refund in Process";

export type PartsMediaRecord = {
  id: string;
  owner: PartsMediaOwner;
  kind: string;
  fileName: string;
  previewDataUrl: string;
  addedAt: string;
  note: string;
  uploadedBy: string;
};

export type SupplierBid = {
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

export type PartsReturnRecord = {
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

export type PartsRequestRecord = {
  id: string;
  requestNumber: string;
  roId: string;
  roNumber: string;
  workLineId?: string;
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
  updatedBy?: string;
  workshopPhotos: PartsMediaRecord[];
  bids: SupplierBid[];
  returnRecords: PartsReturnRecord[];
};

// --- REPORT OUTPUT TYPES ---

export type TechnicianProductivityRow = {
  technicianId: string;
  technicianName: string;
  jobCount: number;
  laborProduced: number;
  loggedMinutes: number;
  loggedHours: number;
};

export type AdvisorSalesRow = {
  advisorName: string;
  roCount: number;
  totalInvoiced: number;
  laborSubtotal: number;
  partsSubtotal: number;
};

export type RepeatCustomerRow = {
  key: string;
  plateNumber: string;
  accountLabel: string;
  visitCount: number;
  lastVisitDate: string;
};

export type QCPassFailSummary = {
  total: number;
  passed: number;
  failed: number;
  passRatePct: number;
  byQCOfficer: { qcBy: string; total: number; passed: number; failed: number }[];
};

export type WaitingPartsAgingRow = {
  roId: string;
  roNumber: string;
  plateNumber: string;
  accountLabel: string;
  daysWaiting: number;
  blockedWorkLineTitles: string[];
};

export type BackjobRateSummary = {
  totalROs: number;
  backjobCount: number;
  backjobRatePct: number;
  byResponsibility: { responsibility: string; count: number }[];
};
