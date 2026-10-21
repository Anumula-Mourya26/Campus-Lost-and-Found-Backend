import express from "express";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { listMyClaims } from "../services/claim.service.js";

export const aliasesRouter = express.Router();
aliasesRouter.get("/my-claims", verifyToken, asyncHandler(async (req, res) => {
  res.json({ success: true, data: await listMyClaims(req.user.id) });
}));
