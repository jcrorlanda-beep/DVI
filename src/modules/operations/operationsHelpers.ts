import type { RepairOrderRecord, UserAccount, WorkLog } from "../shared/types";

export type BayStatus = "Available" | "Occupied" | "Waiting Parts" | "QC" | "Cleaning / Release Prep";

export type BayAssignmentRecord = {
  bayId: string;
  bayName: string;
  roId: string;
  assignedAt: string;
};

export type TechnicianScheduleRow = {
  technicianId: string;
  technicianName: string;
  role: string;
  status: "Available" | "Busy" | "Off Duty";
  workloadCount: number;
  assignedJobs: RepairOrderRecord[];
};

export const DEFAULT_BAYS = ["Bay 1", "Bay 2", "Bay 3", "Alignment", "QC / Release"];

export function getVehicleLabel(ro: RepairOrderRecord) {
  return [ro.year, ro.make, ro.model].filter(Boolean).join(" ") || ro.plateNumber || ro.conductionNumber || "Vehicle";
}

export function getBayStatus(ro?: RepairOrderRecord): BayStatus {
  if (!ro) return "Available";
  if (ro.status === "Waiting Parts") return "Waiting Parts";
  if (ro.status === "Quality Check") return "QC";
  if (ro.status === "Ready Release") return "Cleaning / Release Prep";
  return "Occupied";
}

export function buildTechnicianScheduleRows(args: {
  users: UserAccount[];
  repairOrders: RepairOrderRecord[];
  workLogs: WorkLog[];
  date: string;
}): TechnicianScheduleRow[] {
  const technicians = args.users.filter((user) => user.active && ["Chief Technician", "Senior Mechanic", "General Mechanic", "OJT"].includes(user.role));
  return technicians.map((user) => {
    const assignedJobs = args.repairOrders.filter((ro) => ro.primaryTechnicianId === user.id || ro.supportTechnicianIds.includes(user.id));
    const activeLogs = args.workLogs.filter((log) => log.technicianId === user.id && !log.endedAt);
    return {
      technicianId: user.id,
      technicianName: user.fullName,
      role: user.role,
      status: activeLogs.length ? "Busy" : assignedJobs.length ? "Busy" : "Available",
      workloadCount: assignedJobs.filter((ro) => !["Released", "Closed"].includes(ro.status)).length,
      assignedJobs,
    };
  });
}

export function buildCapacitySummary(args: {
  users: UserAccount[];
  repairOrders: RepairOrderRecord[];
  workLogs: WorkLog[];
}) {
  const activeTechnicians = args.users.filter((user) => user.active && ["Chief Technician", "Senior Mechanic", "General Mechanic", "OJT"].includes(user.role)).length;
  const activeJobs = args.repairOrders.filter((ro) => !["Released", "Closed"].includes(ro.status)).length;
  const waitingParts = args.repairOrders.filter((ro) => ro.status === "Waiting Parts").length;
  const waitingQc = args.repairOrders.filter((ro) => ro.status === "Quality Check").length;
  const readyRelease = args.repairOrders.filter((ro) => ro.status === "Ready Release").length;
  const activeTimers = args.workLogs.filter((log) => !log.endedAt).length;
  const estimatedWorkload = activeJobs + activeTimers;
  return {
    activeJobs,
    availableTechnicianCapacity: activeTechnicians,
    waitingParts,
    waitingQc,
    readyRelease,
    estimatedWorkload,
    overloaded: activeTechnicians > 0 ? estimatedWorkload > activeTechnicians * 2 : activeJobs > 0,
  };
}

export function getShopBoardLane(status: RepairOrderRecord["status"]) {
  if (status === "Waiting Inspection") return "Waiting Inspection";
  if (status === "Waiting Approval") return "Waiting Approval";
  if (status === "Approved / Ready to Work") return "Approved / Ready";
  if (status === "In Progress") return "In Progress";
  if (status === "Waiting Parts") return "Waiting Parts";
  if (status === "Quality Check") return "QC";
  if (status === "Ready Release") return "Ready Release";
  return "";
}
