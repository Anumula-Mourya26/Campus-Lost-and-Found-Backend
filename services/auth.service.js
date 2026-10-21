import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { UserModel } from "../models/User.model.js";
import { createRawToken, hashToken } from "../utils/tokens.js";
import { httpError } from "../utils/httpError.js";

function signUser(user) {
  return jwt.sign({ id: user._id.toString(), role: user.role, isVerified: user.isVerified, assignedDeskIds: (user.assignedDeskIds || []).map((id) => id.toString()) }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" });
}
export async function registerUser(input) {
  const email = input.email.toLowerCase().trim();
  const domain = process.env.CAMPUS_EMAIL_DOMAIN;
  if (domain && domain !== "yourcollege.edu.in" && !email.endsWith(`@${domain.toLowerCase()}`)) throw httpError(400, `Use your verified campus email ending with @${domain}`);
  if (await UserModel.findOne({ email })) throw httpError(409, "An account with this email already exists");
  const rawToken = createRawToken();
  const user = await UserModel.create({ name: input.name, email, password: await bcrypt.hash(input.password, 12), role: "MEMBER", isVerified: false, verificationTokenHash: hashToken(rawToken), verificationExpiresAt: new Date(Date.now() + 30 * 60 * 1000) });
  return { user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified }, verificationToken: process.env.NODE_ENV === "production" ? undefined : rawToken, note: "Demo mode returns the verification token. Connect a campus email provider before production." };
}
export async function verifyEmail(token) {
  const user = await UserModel.findOne({ verificationTokenHash: hashToken(token), verificationExpiresAt: { $gt: new Date() } }).select("+verificationTokenHash +verificationExpiresAt");
  if (!user) throw httpError(400, "Verification token is invalid or expired");
  user.isVerified = true;
  user.verificationTokenHash = undefined;
  user.verificationExpiresAt = undefined;
  await user.save();
  return { token: signUser(user), user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified } };
}
export async function loginUser(email, password) {
  const user = await UserModel.findOne({ email: email.toLowerCase().trim() }).select("+password");
  if (!user || !(await bcrypt.compare(password, user.password))) throw httpError(401, "Invalid email or password");
  if (!user.isVerified) throw httpError(403, "Verify your campus email before logging in");
  return { token: signUser(user), user: { id: user._id, name: user.name, email: user.email, role: user.role, isVerified: user.isVerified } };
}
export async function requestPasswordReset(email) {
  const user = await UserModel.findOne({ email: email.toLowerCase().trim() });
  // Do not disclose whether an email is registered.
  if (!user) return { message: "If the account exists, a reset token has been created" };
  const rawToken = createRawToken();
  user.resetTokenHash = hashToken(rawToken);
  user.resetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await user.save();
  return { message: "If the account exists, a reset token has been created", resetToken: process.env.NODE_ENV === "production" ? undefined : rawToken };
}
export async function resetPassword(token, password) {
  const user = await UserModel.findOne({ resetTokenHash: hashToken(token), resetExpiresAt: { $gt: new Date() } }).select("+resetTokenHash +resetExpiresAt");
  if (!user) throw httpError(400, "Reset token is invalid or expired");
  user.password = await bcrypt.hash(password, 12);
  user.resetTokenHash = undefined;
  user.resetExpiresAt = undefined;
  await user.save();
  return { message: "Password updated successfully" };
}
