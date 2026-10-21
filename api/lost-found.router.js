import express from "express";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { csrfProtection } from "../middlewares/csrf.middleware.js";
import { requireVerifiedEmail } from "../middlewares/requireVerifiedEmail.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { reportInputSchema } from "../utils/schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { createReport } from "../services/report.service.js";

export const lostFoundRouter = express.Router();
lostFoundRouter.post("/lost-reports", verifyToken, csrfProtection, requireVerifiedEmail, validateBody(reportInputSchema), asyncHandler(async (req, res) => {
  const data = await createReport({ ...req.body, reportType: "LOST" }, req.user.id);
  res.status(201).json({ success: true, message: "Lost report created", data });
}));
lostFoundRouter.post("/found-reports", verifyToken, csrfProtection, requireVerifiedEmail, validateBody(reportInputSchema), asyncHandler(async (req, res) => {
  const data = await createReport({ ...req.body, reportType: "FOUND" }, req.user.id);
  res.status(201).json({ success: true, message: "Found report created", data });
}));
