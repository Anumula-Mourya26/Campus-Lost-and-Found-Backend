import express from "express";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { allowedRoles } from "../middlewares/allowedRoles.middleware.js";
import { csrfProtection } from "../middlewares/csrf.middleware.js";
import { requireVerifiedEmail } from "../middlewares/requireVerifiedEmail.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { claimSchema } from "../utils/schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createClaim, listMyClaims, getClaimForOfficer, decideClaim, recordHandover } from "../services/claim.service.js";
import { ClaimModel } from "../models/Claim.model.js";

export const claimRouter = express.Router();
claimRouter.post("/items/:id", verifyToken, csrfProtection, requireVerifiedEmail, validateBody(claimSchema), asyncHandler(async (req, res) => {
  const claim = await createClaim(req.params.id, req.user.id, req.body);
  res.status(201).json({ success: true, message: "Claim submitted for desk review", data: { id: claim._id, status: claim.status, createdAt: claim.createdAt } });
}));
claimRouter.get("/mine", verifyToken, asyncHandler(async (req, res) => res.json({ success: true, data: await listMyClaims(req.user.id) })));
claimRouter.get("/my-claims", verifyToken, asyncHandler(async (req, res) => res.json({ success: true, data: await listMyClaims(req.user.id) })));
claimRouter.get("/:id/evidence", verifyToken, allowedRoles("OFFICER", "MODERATOR"), asyncHandler(async (req, res) => {
  const claim = await getClaimForOfficer(req.params.id, req.user);
  res.json({ success: true, data: { id: claim._id, status: claim.status, privateEvidence: claim.privateEvidence, distinguishingDetails: claim.distinguishingDetails, report: { id: claim.report._id, title: claim.report.title, privateIdentifiers: claim.report.privateIdentifiers, storageLocation: claim.report.storageLocation } } });
}));
claimRouter.post("/:id/decision", verifyToken, csrfProtection, allowedRoles("OFFICER", "MODERATOR"), asyncHandler(async (req, res) => {
  const data = await decideClaim(req.params.id, req.user, req.body?.decision, String(req.body?.decisionNote || ""));
  res.json({ success: true, message: "Claim decision saved", data });
}));
claimRouter.post("/:id/handover", verifyToken, csrfProtection, allowedRoles("OFFICER", "MODERATOR"), asyncHandler(async (req, res) => {
  const data = await recordHandover(req.params.id, req.user);
  res.json({ success: true, message: "Handover recorded", data });
}));
claimRouter.get("/:id", verifyToken, asyncHandler(async (req, res) => {
  const claim = await ClaimModel.findById(req.params.id).populate("report", "title category broadLocation eventDate status");
  if (!claim) return res.status(404).json({ success: false, message: "Claim not found" });
  if (claim.claimant.toString() !== req.user.id) {
    if (req.user.role === "OFFICER") await getClaimForOfficer(req.params.id, req.user);
    else if (req.user.role !== "MODERATOR") return res.status(403).json({ success: false, message: "You cannot access this claim" });
  }
  res.json({ success: true, data: { id: claim._id, status: claim.status, decisionNote: claim.decisionNote, report: claim.report, createdAt: claim.createdAt } });
}));
