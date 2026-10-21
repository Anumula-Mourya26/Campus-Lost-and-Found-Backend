import express from "express";
import { ReportModel } from "../models/Report.model.js";
import { DeskModel } from "../models/Desk.model.js";
import { publicReport } from "../utils/publicReport.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const publicRouter = express.Router();
publicRouter.get("/found-items", asyncHandler(async (req, res) => {
  const filter = { reportType: "FOUND", status: "OPEN" };
  if (req.query.category) filter.category = req.query.category;
  if (req.query.location) filter.broadLocation = { $regex: String(req.query.location).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), Number(process.env.PUBLIC_ITEM_LIMIT || 30));
  const reports = await ReportModel.find(filter).sort({ eventDate: -1 }).limit(limit);
  res.json({ success: true, data: reports.map(publicReport) });
}));
publicRouter.get("/lost-found/help", asyncHandler(async (req, res) => {
  const desks = await DeskModel.find({ active: true }).select("name broadLocation openingHours contactInstructions");
  res.json({ success: true, data: { process: ["Submit a lost or found report using your verified campus account.", "Review possible public matches; similarity is only a suggestion.", "Submit private distinguishing evidence for a found-item claim.", "A desk officer reviews the evidence and decides the claim.", "Only after approval can the officer record the handover."], desks } });
}));
