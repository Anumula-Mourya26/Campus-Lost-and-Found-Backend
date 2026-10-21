import { ClaimModel } from "../models/Claim.model.js";
import { ReportModel } from "../models/Report.model.js";
import { httpError } from "../utils/httpError.js";

export async function createClaim(reportId, userId, input) {
  const report = await ReportModel.findById(reportId);
  if (!report || report.status !== "OPEN" || report.reportType !== "FOUND") throw httpError(404, "This found item is not available for claims");
  if (report.reporter.toString() === userId) throw httpError(400, "You cannot claim an item you reported as found");
  const existing = await ClaimModel.findOne({ report: reportId, claimant: userId, status: { $in: ["PENDING", "APPROVED", "HANDED_OVER"] } });
  if (existing) throw httpError(409, "You already have an active claim for this item");
  return ClaimModel.create({ report: reportId, claimant: userId, privateEvidence: input.privateEvidence, distinguishingDetails: input.distinguishingDetails });
}
export async function listMyClaims(userId) {
  const claims = await ClaimModel.find({ claimant: userId }).populate("report", "title category broadLocation eventDate status reportType").sort({ createdAt: -1 });
  return claims.map((claim) => ({ id: claim._id, status: claim.status, decisionNote: claim.decisionNote, createdAt: claim.createdAt, report: claim.report }));
}
export async function getClaimForOfficer(claimId, user) {
  const claim = await ClaimModel.findById(claimId).select("+privateEvidence +distinguishingDetails").populate({ path: "report", select: "+privateIdentifiers +storageLocation" });
  if (!claim) throw httpError(404, "Claim not found");
  if (user.role !== "MODERATOR") {
    if (user.role !== "OFFICER") throw httpError(403, "Officer access required");
    const assigned = (user.assignedDeskIds || []).map(String);
    if (!claim.report.desk || !assigned.includes(claim.report.desk.toString())) throw httpError(403, "You are not assigned to this item's desk");
  }
  return claim;
}
export async function decideClaim(claimId, user, decision, decisionNote = "") {
  if (!["APPROVED", "REJECTED"].includes(decision)) throw httpError(400, "Decision must be APPROVED or REJECTED");
  const claim = await getClaimForOfficer(claimId, user);
  if (claim.status !== "PENDING") throw httpError(409, "Only pending claims can be decided");
  claim.status = decision;
  claim.decisionNote = decisionNote;
  claim.reviewedBy = user.id;
  claim.reviewedAt = new Date();
  await claim.save();
  if (decision === "APPROVED") await ReportModel.findByIdAndUpdate(claim.report._id, { status: "UNDER_REVIEW" });
  return { id: claim._id, status: claim.status, decisionNote: claim.decisionNote };
}
export async function recordHandover(claimId, user) {
  const claim = await getClaimForOfficer(claimId, user);
  if (claim.status !== "APPROVED") throw httpError(409, "Only an approved claim can be handed over");
  claim.status = "HANDED_OVER";
  claim.handoverBy = user.id;
  claim.handoverAt = new Date();
  await claim.save();
  await ReportModel.findByIdAndUpdate(claim.report._id, { status: "RETURNED", resolvedAt: new Date() });
  return { id: claim._id, status: claim.status, handoverAt: claim.handoverAt };
}
