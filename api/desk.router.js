import express from "express";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { allowedRoles } from "../middlewares/allowedRoles.middleware.js";
import { csrfProtection } from "../middlewares/csrf.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { DeskModel } from "../models/Desk.model.js";
import { UserModel } from "../models/User.model.js";
import { httpError } from "../utils/httpError.js";

export const deskRouter = express.Router();
deskRouter.post("/", verifyToken, csrfProtection, allowedRoles("MODERATOR"), asyncHandler(async (req, res) => {
  const { name, broadLocation, openingHours, contactInstructions } = req.body || {};
  if (![name, broadLocation, openingHours, contactInstructions].every((value) => typeof value === "string" && value.trim())) throw httpError(400, "name, broadLocation, openingHours and contactInstructions are required");
  const desk = await DeskModel.create({ name, broadLocation, openingHours, contactInstructions });
  res.status(201).json({ success: true, data: desk });
}));
deskRouter.patch("/:id/staff", verifyToken, csrfProtection, allowedRoles("MODERATOR"), asyncHandler(async (req, res) => {
  const { userId, role } = req.body || {};
  if (!userId || !["OFFICER", "MODERATOR", "MEMBER"].includes(role)) throw httpError(400, "userId and a valid role are required");
  const user = await UserModel.findById(userId);
  if (!user) throw httpError(404, "User not found");
  const desk = await DeskModel.findById(req.params.id);
  if (!desk) throw httpError(404, "Desk not found");
  // Only a moderator can change staff roles; users cannot self-assign privileged roles.
  user.role = role;
  await user.save();
  if (role === "OFFICER") {
    if (!desk.officerIds.some((id) => id.toString() === user._id.toString())) desk.officerIds.push(user._id);
    await desk.save();
    if (!user.assignedDeskIds.some((id) => id.toString() === desk._id.toString())) user.assignedDeskIds.push(desk._id);
    await user.save();
  } else {
    user.assignedDeskIds = user.assignedDeskIds.filter((id) => id.toString() !== req.params.id);
    await user.save();
    await DeskModel.findByIdAndUpdate(req.params.id, { $pull: { officerIds: user._id } });
  }
  res.json({ success: true, message: "Staff role updated by moderator", data: { userId: user._id, role: user.role, assignedDeskIds: user.assignedDeskIds } });
}));
deskRouter.get("/", verifyToken, asyncHandler(async (req, res) => {
  const desks = await DeskModel.find({ active: true }).select("name broadLocation openingHours contactInstructions");
  res.json({ success: true, data: desks });
}));
