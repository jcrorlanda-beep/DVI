import type { BackjobRecord, QCRecord, RepairOrderRecord, UserAccount } from "../shared/types";

export type TechnicianEfficiencyScoreRow = {
  technicianId: string;
  technicianName: string;
  completedWork: number;
  backjobCount: number;
  qcPassRate: number;
  recentActivity: number;
  score: number;
};

export function buildTechnicianEfficiencyScores(args: {
  users: UserAccount[];
  repairOrders: RepairOrderRecord[];
  qcRecords: QCRecord[];
  backjobRecords: BackjobRecord[];
  nowIso?: string;
}): TechnicianEfficiencyScoreRow[] {
  const now = new Date(args.nowIso ?? new Date().toISOString()).getTime();
  return args.users
    .filter((user) => user.active && ["Chief Technician", "Senior Mechanic", "General Mechanic", "OJT"].includes(user.role))
    .map((user) => {
      const assignedRos = args.repairOrders.filter((ro) => ro.primaryTechnicianId === user.id || ro.workLines.some((line) => line.assignedTechnicianId === user.id));
      const completedWork = assignedRos.reduce(
        (sum, ro) => sum + ro.workLines.filter((line) => (line.assignedTechnicianId === user.id || ro.primaryTechnicianId === user.id) && (line.status === "Completed" || ["Ready Release", "Released", "Closed"].includes(ro.status))).length,
        0
      );
      const techQc = args.qcRecords.filter((qc) => assignedRos.some((ro) => ro.id === qc.roId));
      const passedQc = techQc.filter((qc) => qc.result === "Passed").length;
      const qcPassRate = techQc.length ? Math.round((passedQc / techQc.length) * 100) : 100;
      const backjobCount = args.backjobRecords.filter((bj) => bj.originalPrimaryTechnicianId === user.id || bj.comebackPrimaryTechnicianId === user.id || bj.supportingTechnicianIds.includes(user.id)).length;
      const recentActivity = assignedRos.filter((ro) => {
        const time = new Date(ro.updatedAt || ro.createdAt).getTime();
        return !Number.isNaN(time) && now - time <= 30 * 86400000;
      }).length;
      const outputScore = Math.min(45, completedWork * 4);
      const qcScore = Math.round(qcPassRate * 0.3);
      const activityScore = Math.min(15, recentActivity * 3);
      const reworkPenalty = Math.min(30, backjobCount * 8);
      return {
        technicianId: user.id,
        technicianName: user.fullName,
        completedWork,
        backjobCount,
        qcPassRate,
        recentActivity,
        score: Math.max(0, Math.min(100, outputScore + qcScore + activityScore - reworkPenalty)),
      };
    })
    .sort((a, b) => b.score - a.score || b.completedWork - a.completedWork);
}
