import express from "express";
import { rateLimit } from "express-rate-limit";
import { randomBytes } from "node:crypto";
import { asyncHandler } from "../utils/asyncHandler.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { registerSchema, loginSchema } from "../utils/schemas.js";
import { registerUser, verifyEmail, loginUser, requestPasswordReset, resetPassword } from "../services/auth.service.js";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { csrfProtection } from "../middlewares/csrf.middleware.js";

export const authRouter = express.Router();
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false });
const cookieOptions = { httpOnly: true, secure: process.env.COOKIE_SECURE === "true", sameSite: "strict", path: "/" };
function setAuthCookie(res, token) { res.cookie("accessToken", token, { ...cookieOptions, maxAge: 24 * 60 * 60 * 1000 }); }
authRouter.get("/csrf", (req, res) => {
  const token = cryptoRandom();
  res.cookie("csrfToken", token, { httpOnly: false, secure: process.env.COOKIE_SECURE === "true", sameSite: "strict", path: "/" });
  res.json({ success: true, csrfToken: token });
});
function cryptoRandom() { return randomBytes(24).toString("hex"); }
authRouter.post("/register", authLimiter, validateBody(registerSchema), asyncHandler(async (req, res) => {
  const data = await registerUser(req.body);
  res.status(201).json({ success: true, message: "Account created. Verify your campus email to continue", data });
}));
authRouter.post("/verify-email", authLimiter, asyncHandler(async (req, res) => {
  const data = await verifyEmail(typeof req.body?.token === "string" ? req.body.token : "");
  setAuthCookie(res, data.token);
  res.json({ success: true, message: "Email verified", data: { user: data.user } });
}));
authRouter.post("/login", authLimiter, validateBody(loginSchema), asyncHandler(async (req, res) => {
  const data = await loginUser(req.body.email, req.body.password);
  setAuthCookie(res, data.token);
  res.json({ success: true, message: "Login successful", data: { user: data.user } });
}));
authRouter.post("/logout", verifyToken, csrfProtection, (req, res) => {
  res.clearCookie("accessToken", cookieOptions);
  res.clearCookie("csrfToken", { ...cookieOptions, httpOnly: false });
  res.json({ success: true, message: "Logout successful" });
});
authRouter.get("/me", verifyToken, asyncHandler(async (req, res) => {
  const { UserModel } = await import("../models/User.model.js");
  const user = await UserModel.findById(req.user.id).select("name email role isVerified assignedDeskIds");
  if (!user) return res.status(404).json({ success: false, message: "User not found" });
  res.json({ success: true, data: user });
}));
authRouter.post("/forgot-password", authLimiter, asyncHandler(async (req, res) => {
  const data = await requestPasswordReset(String(req.body?.email || ""));
  res.json({ success: true, data });
}));
authRouter.post("/reset-password", authLimiter, asyncHandler(async (req, res) => {
  const password = String(req.body?.password || "");
  if (password.length < 8 || password.length > 100) return res.status(400).json({ success: false, message: "Password must contain 8 to 100 characters" });
  const data = await resetPassword(String(req.body?.token || ""), password);
  res.json({ success: true, data });
}));
