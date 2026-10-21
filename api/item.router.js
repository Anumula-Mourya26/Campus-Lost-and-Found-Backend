import express from "express";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { csrfProtection } from "../middlewares/csrf.middleware.js";
import { requireVerifiedEmail } from "../middlewares/requireVerifiedEmail.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { claimSchema } from "../utils/schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createClaim } from "../services/claim.service.js";

export const itemRouter = express.Router();
itemRouter.post("/:id/claims", verifyToken, csrfProtection, requireVerifiedEmail, validateBody(claimSchema), asyncHandler(async (req, res) => {
  const claim = await createClaim(req.params.id, req.user.id, req.body);
  res.status(201).json({ success: true, message: "Claim submitted for desk review", data: { id: claim._id, status: claim.status, createdAt: claim.createdAt } });
}));
