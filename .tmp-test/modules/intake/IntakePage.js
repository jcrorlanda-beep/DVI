import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { useEffect, useMemo, useState } from "react";
import { formatDateTime, getResponsiveSpan } from "../shared/helpers";
// --- local helpers ---
const STORAGE_KEY_INTAKE_DRAFT = "dvi_phase17i_intake_draft_v1";
const STORAGE_KEY_COUNTERS = "dvi_phase2_counters_v1";
function uid(prefix) {
    return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
function todayStamp(date = new Date()) {
    const yyyy = date.getFullYear().toString();
    const mm = `${date.getMonth() + 1}`.padStart(2, "0");
    const dd = `${date.getDate()}`.padStart(2, "0");
    return `${yyyy}${mm}${dd}`;
}
function readLocalStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw)
            return fallback;
        return JSON.parse(raw);
    }
    catch {
        return fallback;
    }
}
function writeLocalStorage(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
}
function nextDailyNumber(prefix) {
    const stamp = todayStamp();
    const counters = readLocalStorage(STORAGE_KEY_COUNTERS, {});
    const key = `${prefix}_${stamp}`;
    const next = (counters[key] ?? 0) + 1;
    counters[key] = next;
    writeLocalStorage(STORAGE_KEY_COUNTERS, counters);
    return `${prefix}-${stamp}-${String(next).padStart(3, "0")}`;
}
function hasNonEmptyValues(value) {
    if (value == null)
        return false;
    if (typeof value === "string")
        return value.trim().length > 0;
    if (typeof value === "number" || typeof value === "boolean")
        return true;
    if (Array.isArray(value))
        return value.some((item) => hasNonEmptyValues(item));
    if (typeof value === "object")
        return Object.values(value).some((item) => hasNonEmptyValues(item));
    return false;
}
function useDraftAutosave(key, value, enabled = true) {
    const [draftState, setDraftState] = useState("Saved");
    useEffect(() => {
        if (!enabled)
            return;
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
function parseRecommendationLines(input) {
    return input
        .split(/\n|,/)
        .map((item) => item.trim())
        .filter(Boolean);
}
function getDefaultIntakeForm(currentUserName) {
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
function getDefaultInspectionForm() {
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
function Card({ title, subtitle, right, children, }) {
    return (_jsxs("div", { style: styles.card, children: [_jsxs("div", { style: styles.cardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.cardTitle, children: title }), subtitle ? _jsx("div", { style: styles.cardSubtitle, children: subtitle }) : null] }), right ? _jsx("div", { children: right }) : null] }), children] }));
}
function StatusBadge({ status }) {
    const map = {
        Draft: styles.statusNeutral,
        "Waiting Inspection": styles.statusInfo,
        "Converted to RO": styles.statusOk,
        Cancelled: styles.statusLocked,
    };
    return _jsx("span", { style: map[status], children: status });
}
// --- component ---
function IntakePage({ currentUser, intakeRecords, setIntakeRecords, inspectionRecords, setInspectionRecords, isCompactLayout, }) {
    const [form, setForm] = useState(() => {
        const defaultForm = getDefaultIntakeForm(currentUser.fullName);
        const savedDraft = readLocalStorage(STORAGE_KEY_INTAKE_DRAFT, null);
        return savedDraft ? { ...defaultForm, ...savedDraft, assignedAdvisor: savedDraft.assignedAdvisor || currentUser.fullName } : defaultForm;
    });
    const [search, setSearch] = useState("");
    const [error, setError] = useState("");
    const [showDraftRestore, setShowDraftRestore] = useState(() => hasNonEmptyValues(readLocalStorage(STORAGE_KEY_INTAKE_DRAFT, null)));
    const intakeDraft = useDraftAutosave(STORAGE_KEY_INTAKE_DRAFT, form, true);
    useEffect(() => {
        setForm((prev) => ({
            ...prev,
            assignedAdvisor: prev.assignedAdvisor || currentUser.fullName,
        }));
    }, [currentUser.fullName]);
    const filteredRecords = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term)
            return intakeRecords;
        return intakeRecords.filter((row) => [
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
            .includes(term));
    }, [intakeRecords, search]);
    const vehicleHistoryMatches = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term)
            return [];
        return intakeRecords.filter((row) => row.plateNumber.toLowerCase() === term || row.conductionNumber.toLowerCase() === term).slice(0, 8);
    }, [intakeRecords, search]);
    const customerHistoryMatches = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term)
            return [];
        return intakeRecords.filter((row) => [row.customerName, row.companyName].join(" ").toLowerCase().includes(term)).slice(0, 8);
    }, [intakeRecords, search]);
    const resetForm = () => {
        setForm(getDefaultIntakeForm(currentUser.fullName));
        setError("");
        intakeDraft.clearDraft();
        setShowDraftRestore(false);
    };
    const loadHistoryIntoForm = (row) => {
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
    const handleSubmit = (e) => {
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
        if (plateNumber &&
            intakeRecords.some((row) => row.plateNumber === plateNumber && row.status !== "Cancelled")) {
            setError("This plate number already has an active intake record.");
            return;
        }
        const now = new Date().toISOString();
        const newRecord = {
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
            const draftInspection = {
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
    const updateStatus = (id, status) => {
        setIntakeRecords((prev) => prev.map((row) => row.id === id ? { ...row, status, updatedAt: new Date().toISOString() } : row));
    };
    return (_jsx("div", { style: styles.pageContent, children: _jsxs("div", { style: styles.grid, children: [_jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(5, isCompactLayout) }, children: _jsx(Card, { title: "New Intake", subtitle: "Plate-based intake with support for company and fleet accounts", right: _jsx("span", { style: styles.statusInfo, children: "Reception Ready" }), children: _jsxs("form", { onSubmit: handleSubmit, style: styles.formStack, children: [showDraftRestore ? (_jsxs("div", { style: styles.sectionCardMuted, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsxs("div", { children: [_jsx("div", { style: styles.sectionTitle, children: "Draft Recovery" }), _jsx("div", { style: styles.formHint, children: "An intake draft was restored automatically from your last unfinished work." })] }), _jsx("span", { style: styles.statusWarning, children: "Recovered" })] }), _jsxs("div", { style: styles.inlineActions, children: [_jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => setShowDraftRestore(false), children: "Keep Draft" }), _jsx("button", { type: "button", style: styles.smallButtonDanger, onClick: resetForm, children: "Discard Draft" })] })] })) : null, _jsxs("div", { style: styles.quickAccessRow, children: [_jsx("span", { children: "Draft Status" }), _jsx("strong", { children: intakeDraft.draftState })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Account Type" }), _jsxs("select", { style: styles.select, value: form.accountType, onChange: (e) => setForm((prev) => ({
                                                        ...prev,
                                                        accountType: e.target.value,
                                                    })), children: [_jsx("option", { value: "Personal", children: "Personal" }), _jsx("option", { value: "Company / Fleet", children: "Company / Fleet" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Status" }), _jsxs("select", { style: styles.select, value: form.status, onChange: (e) => setForm((prev) => ({ ...prev, status: e.target.value })), children: [_jsx("option", { value: "Draft", children: "Draft" }), _jsx("option", { value: "Waiting Inspection", children: "Waiting Inspection" }), _jsx("option", { value: "Cancelled", children: "Cancelled" })] })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: form.accountType === "Company / Fleet" ? "Company / Fleet Name" : "Customer Name" }), _jsx("input", { style: styles.input, value: form.accountType === "Company / Fleet" ? form.companyName : form.customerName, onChange: (e) => setForm((prev) => prev.accountType === "Company / Fleet"
                                                ? { ...prev, companyName: e.target.value }
                                                : { ...prev, customerName: e.target.value }), placeholder: form.accountType === "Company / Fleet"
                                                ? "Enter company or fleet account name"
                                                : "Enter customer name" })] }), form.accountType === "Company / Fleet" ? (_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Driver / Contact Person" }), _jsx("input", { style: styles.input, value: form.customerName, onChange: (e) => setForm((prev) => ({ ...prev, customerName: e.target.value })), placeholder: "Optional driver or contact person" })] })) : null, _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Phone" }), _jsx("input", { style: styles.input, value: form.phone, onChange: (e) => setForm((prev) => ({ ...prev, phone: e.target.value })), placeholder: "Enter phone number" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Email" }), _jsx("input", { style: styles.input, value: form.email, onChange: (e) => setForm((prev) => ({ ...prev, email: e.target.value })), placeholder: "Optional email" })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid2, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Plate Number" }), _jsx("input", { style: styles.input, value: form.plateNumber, onChange: (e) => setForm((prev) => ({ ...prev, plateNumber: e.target.value.toUpperCase() })), placeholder: "Primary vehicle identifier" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Conduction Number" }), _jsx("input", { style: styles.input, value: form.conductionNumber, onChange: (e) => setForm((prev) => ({ ...prev, conductionNumber: e.target.value.toUpperCase() })), placeholder: "Use when plate is not yet available" })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Make" }), _jsx("input", { style: styles.input, value: form.make, onChange: (e) => setForm((prev) => ({ ...prev, make: e.target.value })), placeholder: "e.g. Toyota" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Model" }), _jsx("input", { style: styles.input, value: form.model, onChange: (e) => setForm((prev) => ({ ...prev, model: e.target.value })), placeholder: "e.g. Hilux" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Year" }), _jsx("input", { style: styles.input, value: form.year, onChange: (e) => setForm((prev) => ({ ...prev, year: e.target.value })), placeholder: "e.g. 2022" })] })] }), _jsxs("div", { style: isCompactLayout ? styles.formStack : styles.formGrid3, children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Color" }), _jsx("input", { style: styles.input, value: form.color, onChange: (e) => setForm((prev) => ({ ...prev, color: e.target.value })), placeholder: "Optional" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Odometer (km)" }), _jsx("input", { style: styles.input, value: form.odometerKm, onChange: (e) => setForm((prev) => ({ ...prev, odometerKm: e.target.value })), placeholder: "Reception can encode" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Fuel Level" }), _jsx("input", { style: styles.input, value: form.fuelLevel, onChange: (e) => setForm((prev) => ({ ...prev, fuelLevel: e.target.value })), placeholder: "Optional" })] })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Assigned Service Advisor" }), _jsx("input", { style: styles.input, value: form.assignedAdvisor, onChange: (e) => setForm((prev) => ({ ...prev, assignedAdvisor: e.target.value })), placeholder: "Assigned advisor" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Customer Concern" }), _jsx("textarea", { style: styles.textarea, value: form.concern, onChange: (e) => setForm((prev) => ({ ...prev, concern: e.target.value })), placeholder: "Main complaint or requested work" })] }), _jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Internal Notes" }), _jsx("textarea", { style: styles.textarea, value: form.notes, onChange: (e) => setForm((prev) => ({ ...prev, notes: e.target.value })), placeholder: "Optional notes" })] }), error ? _jsx("div", { style: styles.errorBox, children: error }) : null, _jsxs("div", { style: {
                                        ...(isCompactLayout ? styles.stickyActionBar : styles.inlineActions),
                                        ...(isCompactLayout ? {} : styles.inlineActions),
                                    }, children: [_jsx("button", { type: "submit", style: { ...styles.primaryButton, ...(isCompactLayout ? styles.actionButtonWide : {}) }, children: "Save Intake" }), _jsx("button", { type: "button", style: { ...styles.secondaryButton, ...(isCompactLayout ? styles.actionButtonWide : {}) }, onClick: resetForm, children: "Reset" })] })] }) }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: getResponsiveSpan(7, isCompactLayout) }, children: _jsxs(Card, { title: "Customer / Vehicle History Lookup", subtitle: "Search by plate, conduction, customer, company, phone, or email, then load prior details into intake", right: _jsxs("span", { style: styles.statusInfo, children: [vehicleHistoryMatches.length + customerHistoryMatches.length, " match(es)"] }), children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "History Search" }), _jsx("input", { style: styles.input, value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search by plate, conduction, name, company, phone, or email" })] }), !search.trim() ? (_jsx("div", { style: styles.formHint, children: "Start typing to pull customer and vehicle history into the intake form." })) : (_jsx("div", { style: styles.mobileCardList, children: [...vehicleHistoryMatches, ...customerHistoryMatches.filter((row) => !vehicleHistoryMatches.some((match) => match.id === row.id))]
                                    .slice(0, 8)
                                    .map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.intakeNumber }), _jsx(StatusBadge, { status: row.status })] }), _jsx("div", { style: styles.mobileDataPrimary, children: row.plateNumber || row.conductionNumber || "-" }), _jsx("div", { style: styles.mobileDataSecondary, children: row.companyName || row.customerName || "-" }), _jsx("div", { style: styles.mobileDataSecondary, children: [row.make, row.model, row.year].filter(Boolean).join(" ") || "-" }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Phone / Email" }), _jsx("strong", { children: row.phone || row.email || "-" })] }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Latest Concern" }), _jsx("strong", { children: row.concern || "-" })] }), _jsx("div", { style: styles.inlineActions, children: _jsx("button", { type: "button", style: styles.smallButton, onClick: () => loadHistoryIntoForm(row), children: "Load Into Intake" }) })] }, row.id))) }))] }) }), _jsx("div", { style: { ...styles.gridItem, gridColumn: "span 12" }, children: _jsxs(Card, { title: "Intake Registry", subtitle: "Newest to oldest, searchable by plate, conduction, customer, company, or concern", right: _jsx("div", { style: styles.registrySummary, children: _jsxs("span", { style: styles.statusNeutral, children: [filteredRecords.length, " shown"] }) }), children: [_jsxs("div", { style: styles.formGroup, children: [_jsx("label", { style: styles.label, children: "Search" }), _jsx("input", { style: styles.input, value: search, onChange: (e) => setSearch(e.target.value), placeholder: "Search plate, conduction, customer, company, phone, make, model" })] }), filteredRecords.length === 0 ? (_jsx("div", { style: styles.emptyState, children: "No intake records found." })) : isCompactLayout ? (_jsx("div", { style: styles.mobileCardList, children: filteredRecords.map((row) => (_jsxs("div", { style: styles.mobileDataCard, children: [_jsxs("div", { style: styles.mobileDataCardHeader, children: [_jsx("strong", { children: row.intakeNumber }), _jsx(StatusBadge, { status: row.status })] }), _jsx("div", { style: styles.mobileDataPrimary, children: row.plateNumber || row.conductionNumber || "-" }), _jsx("div", { style: styles.mobileDataSecondary, children: row.companyName || row.customerName || "-" }), _jsx("div", { style: styles.mobileDataSecondary, children: [row.make, row.model, row.year, row.color].filter(Boolean).join(" • ") || "-" }), _jsxs("div", { style: styles.mobileDataSecondary, children: ["Odometer: ", row.odometerKm || "-", " km"] }), _jsx("div", { style: styles.concernCard, children: row.concern }), _jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Created" }), _jsx("strong", { children: formatDateTime(row.createdAt) })] }), row.encodedBy ? (_jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Encoded by" }), _jsx("strong", { children: row.encodedBy })] })) : null, row.updatedBy ? (_jsxs("div", { style: styles.mobileMetaRow, children: [_jsx("span", { children: "Last updated by" }), _jsx("strong", { children: row.updatedBy })] })) : null, _jsxs("div", { style: styles.mobileActionStack, children: [_jsx("button", { type: "button", style: styles.smallButton, onClick: () => updateStatus(row.id, "Waiting Inspection"), children: "Waiting Inspection" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => updateStatus(row.id, "Draft"), children: "Set Draft" }), _jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => updateStatus(row.id, "Converted to RO"), children: "Converted to RO" })] })] }, row.id))) })) : (_jsx("div", { style: styles.tableWrap, children: _jsxs("table", { style: styles.table, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: styles.th, children: "Intake No." }), _jsx("th", { style: styles.th, children: "Plate / Conduction" }), _jsx("th", { style: styles.th, children: "Customer / Company" }), _jsx("th", { style: styles.th, children: "Vehicle" }), _jsx("th", { style: styles.th, children: "Odometer" }), _jsx("th", { style: styles.th, children: "Concern" }), _jsx("th", { style: styles.th, children: "Status" }), _jsx("th", { style: styles.th, children: "Quick Action" })] }) }), _jsx("tbody", { children: filteredRecords.map((row) => (_jsxs("tr", { children: [_jsxs("td", { style: styles.td, children: [_jsx("div", { style: styles.tablePrimary, children: row.intakeNumber }), _jsx("div", { style: styles.tableSecondary, children: formatDateTime(row.createdAt) }), row.encodedBy ? _jsx("div", { style: styles.tableSecondary, children: row.encodedBy }) : null] }), _jsxs("td", { style: styles.td, children: [_jsx("div", { style: styles.tablePrimary, children: row.plateNumber || "-" }), _jsx("div", { style: styles.tableSecondary, children: row.conductionNumber || "No conduction #" })] }), _jsxs("td", { style: styles.td, children: [_jsx("div", { style: styles.tablePrimary, children: row.companyName || row.customerName || "-" }), _jsx("div", { style: styles.tableSecondary, children: row.customerName && row.companyName ? row.customerName : row.phone || "No phone" })] }), _jsxs("td", { style: styles.td, children: [_jsx("div", { style: styles.tablePrimary, children: `${row.make} ${row.model}`.trim() }), _jsx("div", { style: styles.tableSecondary, children: [row.year, row.color].filter(Boolean).join(" • ") || "-" })] }), _jsx("td", { style: styles.td, children: row.odometerKm || "-" }), _jsx("td", { style: styles.td, children: _jsx("div", { style: styles.concernCell, children: row.concern }) }), _jsx("td", { style: styles.td, children: _jsx(StatusBadge, { status: row.status }) }), _jsx("td", { style: styles.td, children: _jsxs("div", { style: styles.inlineActionsColumn, children: [_jsx("button", { type: "button", style: styles.smallButton, onClick: () => updateStatus(row.id, "Waiting Inspection"), children: "Waiting Inspection" }), _jsx("button", { type: "button", style: styles.smallButtonMuted, onClick: () => updateStatus(row.id, "Draft"), children: "Set Draft" }), _jsx("button", { type: "button", style: styles.smallButtonSuccess, onClick: () => updateStatus(row.id, "Converted to RO"), children: "Converted to RO" })] }) })] }, row.id))) })] }) }))] }) })] }) }));
}
export default IntakePage;
const styles = {
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
    formStack: { display: "flex", flexDirection: "column", gap: 12 },
    formGroup: { display: "flex", flexDirection: "column", gap: 4 },
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
        boxSizing: "border-box",
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
        boxSizing: "border-box",
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
        resize: "vertical",
        boxSizing: "border-box",
    },
    sectionCardMuted: {
        background: "rgba(241,245,249,0.8)",
        border: "1px solid rgba(148,163,184,0.2)",
        borderRadius: 10,
        padding: 12,
        display: "flex",
        flexDirection: "column",
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
    inlineActions: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
    inlineActionsColumn: { display: "flex", flexDirection: "column", gap: 6 },
    stickyActionBar: {
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
        position: "sticky",
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
        textAlign: "center",
        color: "#94a3b8",
        fontSize: 14,
        padding: "32px 0",
    },
    mobileCardList: { display: "flex", flexDirection: "column", gap: 12 },
    mobileDataCard: {
        background: "#f8fafc",
        border: "1px solid rgba(148,163,184,0.2)",
        borderRadius: 12,
        padding: 14,
        display: "flex",
        flexDirection: "column",
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
    mobileActionStack: { display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 },
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
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
    th: {
        padding: "10px 12px",
        textAlign: "left",
        fontWeight: 700,
        color: "#374151",
        borderBottom: "2px solid rgba(148,163,184,0.2)",
        whiteSpace: "nowrap",
        background: "#f8fafc",
    },
    td: {
        padding: "10px 12px",
        borderBottom: "1px solid rgba(148,163,184,0.12)",
        verticalAlign: "top",
    },
    tablePrimary: { fontWeight: 700, color: "#0f172a", fontSize: 13 },
    tableSecondary: { fontSize: 12, color: "#64748b", marginTop: 2 },
    concernCell: {
        fontSize: 13,
        color: "#374151",
        maxWidth: 220,
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
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
        whiteSpace: "nowrap",
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
        whiteSpace: "nowrap",
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
        whiteSpace: "nowrap",
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
        whiteSpace: "nowrap",
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
        whiteSpace: "nowrap",
    },
};
