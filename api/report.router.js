import express from "express";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { csrfProtection } from "../middlewares/csrf.middleware.js";
import { requireVerifiedEmail } from "../middlewares/requireVerifiedEmail.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { reportSchema } from "../utils/schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createReport, listMyReports } from "../services/report.service.js";
import { ReportModel } from "../models/Report.model.js";
import { publicReport } from "../utils/publicReport.js";

export const reportRouter = express.Router();
reportRouter.post("/", verifyToken, csrfProtection, requireVerifiedEmail, validateBody(reportSchema), asyncHandler(async (req, res) => {
  const report = await createReport(req.body, req.user.id);
  res.status(201).json({ success: true, message: "Report created", data: report });
}));
reportRouter.get("/mine", verifyToken, asyncHandler(async (req, res) => res.json({ success: true, data: await listMyReports(req.user.id) })));
reportRouter.get("/:id", verifyToken, asyncHandler(async (req, res) => {
  const report = await ReportModel.findById(req.params.id).select("+privateIdentifiers +storageLocation");
  if (!report) return res.status(404).json({ success: false, message: "Report not found" });
  const isOwner = report.reporter.toString() === req.user.id;
  const canSee = isOwner || req.user.role === "MODERATOR" || (req.user.role === "OFFICER" && report.desk && (req.user.assignedDeskIds || []).map(String).includes(report.desk.toString()));
  if (!canSee) return res.status(403).json({ success: false, message: "You cannot access this report" });
  res.json({ success: true, data: { ...publicReport(report), ...(isOwner ? { privateIdentifiers: report.privateIdentifiers, storageLocation: report.storageLocation } : {}) } });
}));
