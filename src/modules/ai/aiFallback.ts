import { getAiSafetyReviewReminder, getAiVoiceProfile, type AiOutputMode } from "./aiSafety";

export type AiAction = 
  | "customerInspectionReport"
  | "qcSummary"
  | "backJobExplanation"
  | "smsUpdate"
  | "estimateExplanation"
  | "maintenanceDueReport"
  | "fixGrammar"
  | "Explain Finding"
  | "explainFinding"
  | "summarizeInspection"
  | "followUpMessage"
  | "releaseSummary"
  | "Approval Request"
  | "Waiting Parts Update"
  | "Release Ready Notice"
  | "Pull-Out Notice"
  | "Overdue Maintenance Reminder"
  | "Due Soon Maintenance Reminder"
  | "Post-Service Follow-Up"
  | "Backjob / Recheck Update"
  | "Fix Grammar"
  | "Explain to Customer"
  | "Explain Inspection Finding"
  | "Customer Inspection Report"
  | "SMS Update"
  | "QC Summary"
  | "Summarize Inspection"
  | "Draft Follow-Up Message"
  | "Draft Release Summary";

export type AiInput = {
  sourceText: string;
  contextLabel?: string;
  customerName?: string;
  vehicleLabel?: string;
  roNumber?: string;
  moduleLabel?: string;
  outputMode?: AiOutputMode;
};

export function normalizeAiAction(action: AiAction | "Generate Customer Explanation"): AiAction {
  switch (action) {
    case "Generate Customer Explanation":
    case "Explain Inspection Finding":
    case "Explain to Customer":
    case "Explain Finding":
      return "explainFinding";
    case "Customer Inspection Report":
      return "customerInspectionReport";
    case "Fix Grammar":
      return "fixGrammar";
    case "Summarize Inspection":
      return "summarizeInspection";
    case "Draft Follow-Up Message":
      return "followUpMessage";
    case "Draft Release Summary":
      return "releaseSummary";
    case "SMS Update":
      return "smsUpdate";
    case "QC Summary":
      return "qcSummary";
    case "maintenanceDueReport":
      return "maintenanceDueReport";
    default:
      return action as AiAction;
  }
}

function normalizeText(text: string) {
  return text.replace(/\r\n/g, "\n").replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}

function withSafetyReminder(lines: string[]) {
  return [...lines, "", getAiSafetyReviewReminder()].join("\n");
}

function buildStandardFallback(lines: string[]) {
  return withSafetyReminder(lines);
}

function buildShortFallback(lines: string[]) {
  return lines.join(" ").replace(/\s+/g, " ").trim();
}

function buildDetailedFallback(lines: string[]) {
  return withSafetyReminder(lines);
}

function buildDetailedSections(summary: string, findings: string[], action: string, priority: string[]) {
  return [
    "Summary",
    summary,
    "",
    "Findings",
    ...(findings.length ? findings : ["- Review the available source notes."]),
    "",
    "Recommended Action",
    action,
    "",
    "Priority / Next Step",
    ...(priority.length ? priority : ["- Review and confirm next steps with the advisor."]),
  ];
}

export function getFallbackDraft(action: AiAction | "Generate Customer Explanation", input: AiInput, options?: { outputMode?: AiOutputMode }): string {
  const normalizedAction = normalizeAiAction(action);
  const sourceText = normalizeText(input.sourceText);
  const customerName = input.customerName?.trim() || "Customer";
  const vehicleLabel = input.vehicleLabel?.trim() || "vehicle";
  const roNumber = input.roNumber?.trim() || "RO";
  const contextLabel = input.contextLabel?.trim() || "service update";
  const outputMode = options?.outputMode || input.outputMode || "Standard";

  switch (normalizedAction) {
    case "fixGrammar":
      return sourceText || withSafetyReminder(["No source text was available for grammar cleanup."]);
    case "explainFinding":
      if (outputMode === "Short") {
        return buildShortFallback([
          `Hi ${customerName},`,
          `The inspection note for ${vehicleLabel} (${roNumber}) means:`,
          sourceText || "No inspection notes were available.",
        ]);
      }
      if (outputMode === "Detailed") {
        return buildDetailedFallback([
          getAiVoiceProfile(),
          ...buildDetailedSections(
            `Here is a customer-friendly explanation for ${roNumber} on ${vehicleLabel}.`,
            [sourceText || "- No inspection notes were available."],
            "Explain the finding in simple customer language and keep the meaning unchanged.",
            ["- Review the finding with the customer.", "- Keep the explanation honest and concise."]
          ),
        ]);
      }
      return buildStandardFallback([
        `Hi ${customerName},`,
        "",
        `Here is a simple explanation for ${roNumber} on ${vehicleLabel}:`,
        sourceText || "No inspection notes were available.",
        "",
        "Please review this draft before sending.",
      ]);
    case "customerInspectionReport":
      if (outputMode === "Short") {
        return buildShortFallback([
          `Inspection report for ${roNumber}:`,
          sourceText || "No inspection report was available.",
          "Review the findings and next steps with the customer.",
        ]);
      }
      return buildDetailedFallback([
        "Summary",
        sourceText || "No inspection report was available.",
        "",
        "Findings",
        "- Review the inspection notes and findings.",
        "",
        "Recommended Action",
        "- Review and approve the recommended work if needed.",
        "",
        "Priority",
        "- Prioritize safety and customer concerns first.",
      ]);
    case "qcSummary":
      if (outputMode === "Short") {
        return buildShortFallback([
          `QC summary for ${roNumber || vehicleLabel}:`,
          sourceText || "No QC summary was available.",
        ]);
      }
      return buildDetailedFallback([
        "Summary",
        sourceText || "No QC summary was available.",
        "",
        "Findings",
        "- Review the QC result before release.",
        "",
        "Recommended Action",
        "- Confirm any remaining advisor notes.",
        "",
        "Priority / Next Step",
        "- Release once checks are complete.",
      ]);
    case "backJobExplanation":
      if (outputMode === "Short") {
        return buildShortFallback([
          `Backjob update for ${vehicleLabel} (${roNumber}):`,
          sourceText || "No backjob explanation was available.",
        ]);
      }
      return buildDetailedFallback([
        "Summary",
        sourceText || "No backjob explanation was available.",
        "",
        "Findings",
        "- Review the earlier repair and current findings.",
        "",
        "Recommended Action",
        "- Determine the next corrective step.",
        "",
        "Priority / Next Step",
        "- Keep the explanation clear and customer-friendly.",
      ]);
    case "smsUpdate":
      return outputMode === "Short" ? (sourceText || "Short customer update not available.") : (sourceText || buildStandardFallback(["Short customer update not available."]));
    case "estimateExplanation":
      if (outputMode === "Short") {
        return buildShortFallback([
          "Why this work is recommended:",
          sourceText || "No estimate explanation was available.",
        ]);
      }
      return buildStandardFallback([
        "Why this work is recommended:",
        sourceText || "No estimate explanation was available.",
      ]);
    case "maintenanceDueReport":
      if (outputMode === "Short") {
        return buildShortFallback([
          `Maintenance due report for ${vehicleLabel}:`,
          sourceText || "No maintenance due report was available.",
        ]);
      }
      return buildDetailedFallback([
        "Summary",
        sourceText || "No maintenance due report was available.",
        "",
        "Findings",
        "- Review the latest maintenance history and due items.",
        "",
        "Recommended Action",
        "- Review the due maintenance items with the customer.",
        "",
        "Priority / Next Step",
        "- Prioritize safety and upcoming due services first.",
      ]);
    case "summarizeInspection":
      if (outputMode === "Short") {
        return sourceText || `Inspection summary for ${roNumber} is not available yet.`;
      }
      return sourceText || buildDetailedFallback([`Inspection summary for ${roNumber} is not available yet.`]);
    case "followUpMessage":
      if (outputMode === "Short") {
        return buildShortFallback([
          `Hi ${customerName}, we wanted to follow up on ${roNumber} for ${vehicleLabel}.`,
          `This is a quick ${contextLabel} check-in.`,
        ]);
      }
      return buildStandardFallback([
        `Hi ${customerName},`,
        "",
        `We wanted to follow up on ${roNumber} for ${vehicleLabel}.`,
        `This is a quick ${contextLabel} check-in.`,
        "Please let us know how the visit felt and whether anything still needs attention.",
        "",
        "Thank you.",
      ]);
    case "releaseSummary":
      if (outputMode === "Short") {
        return buildShortFallback([
          `Release summary for ${roNumber} - ${vehicleLabel}.`,
          sourceText || "No release notes were available.",
        ]);
      }
      return buildStandardFallback([
        `Release summary for ${roNumber}`,
        `Vehicle: ${vehicleLabel}`,
        "",
        sourceText || "No release notes were available.",
      ]);
    case "Approval Request":
      if (outputMode === "Short") {
        return buildShortFallback([
          `Hi ${customerName}, your RO ${roNumber} for ${vehicleLabel} is ready for approval.`,
          sourceText || "Please review the inspection summary and recommended work with your advisor.",
        ]);
      }
      return buildStandardFallback([
        `Hi ${customerName},`,
        "",
        `Your RO ${roNumber} for ${vehicleLabel} is ready for approval.`,
        sourceText || "Please review the inspection summary and recommended work with your advisor.",
      ]);
    case "Waiting Parts Update":
      if (outputMode === "Short") {
        return buildShortFallback([
          `Hi ${customerName}, ${vehicleLabel} is waiting for parts on RO ${roNumber}.`,
          sourceText || "We will update you once the parts arrive and work can continue.",
        ]);
      }
      return buildStandardFallback([
        `Hi ${customerName},`,
        "",
        `Your vehicle ${vehicleLabel} is currently waiting for parts for RO ${roNumber}.`,
        sourceText || "We will update you once the parts arrive and work can continue.",
      ]);
    case "Release Ready Notice":
      if (outputMode === "Short") {
        return buildShortFallback([
          `Hi ${customerName}, ${vehicleLabel} is ready for release under RO ${roNumber}.`,
          sourceText || "Please contact us if you need help with pickup or payment.",
        ]);
      }
      return buildStandardFallback([
        `Hi ${customerName},`,
        "",
        `Your vehicle ${vehicleLabel} is ready for release under RO ${roNumber}.`,
        sourceText || "Please contact us if you need help with pickup or payment.",
      ]);
    case "Pull-Out Notice":
      if (outputMode === "Short") {
        return buildShortFallback([
          `Hi ${customerName}, work on RO ${roNumber} for ${vehicleLabel} has been stopped for review.`,
          sourceText || "Please contact your advisor before we continue the job.",
        ]);
      }
      return buildStandardFallback([
        `Hi ${customerName},`,
        "",
        `Work on RO ${roNumber} for ${vehicleLabel} has been stopped for review.`,
        sourceText || "Please contact your advisor before we continue the job.",
      ]);
    case "Overdue Maintenance Reminder":
      if (outputMode === "Short") {
        return buildShortFallback([
          `Hi ${customerName}, ${vehicleLabel} may be due for maintenance.`,
          sourceText || "Please review the current service interval and book at your convenience.",
        ]);
      }
      return buildStandardFallback([
        `Hi ${customerName},`,
        "",
        `Your vehicle ${vehicleLabel} may be due for maintenance.`,
        sourceText || "Please review the current service interval and book at your convenience.",
      ]);
    case "Due Soon Maintenance Reminder":
      if (outputMode === "Short") {
        return buildShortFallback([
          `Hi ${customerName}, maintenance for ${vehicleLabel} is coming up soon.`,
          sourceText || "We can help you schedule the visit before it becomes overdue.",
        ]);
      }
      return buildStandardFallback([
        `Hi ${customerName},`,
        "",
        `A maintenance service for ${vehicleLabel} is coming up soon.`,
        sourceText || "We can help you schedule the visit before it becomes overdue.",
      ]);
    case "Post-Service Follow-Up":
      if (outputMode === "Short") {
        return buildShortFallback([
          `Hi ${customerName}, we wanted to follow up on RO ${roNumber} for ${vehicleLabel}.`,
          sourceText || "Please let us know if everything is working well after your visit.",
        ]);
      }
      return buildStandardFallback([
        `Hi ${customerName},`,
        "",
        `We wanted to follow up on RO ${roNumber} for ${vehicleLabel}.`,
        sourceText || "Please let us know if everything is working well after your visit.",
      ]);
    case "Backjob / Recheck Update":
      if (outputMode === "Short") {
        return buildShortFallback([
          `Hi ${customerName}, we have an update on the comeback or recheck for ${vehicleLabel} (${roNumber}).`,
          sourceText || "Please review the latest findings and next steps with your advisor.",
        ]);
      }
      return buildStandardFallback([
        `Hi ${customerName},`,
        "",
        `We have an update on the comeback or recheck for ${vehicleLabel} (${roNumber}).`,
        sourceText || "Please review the latest findings and next steps with your advisor.",
      ]);
    default:
      return sourceText || "No draft text was available.";
  }
}
