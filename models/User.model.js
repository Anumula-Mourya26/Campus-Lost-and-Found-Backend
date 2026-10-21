import { Schema, model } from "mongoose";

const userSchema = new Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, select: false },
  role: { type: String, enum: ["MEMBER", "OFFICER", "MODERATOR"], default: "MEMBER" },
  isVerified: { type: Boolean, default: false },
  verificationTokenHash: { type: String, select: false },
  verificationExpiresAt: { type: Date, select: false },
  resetTokenHash: { type: String, select: false },
  resetExpiresAt: { type: Date, select: false },
  assignedDeskIds: [{ type: Schema.Types.ObjectId, ref: "Desk" }]
}, { timestamps: true, versionKey: false, strict: "throw" });

export const UserModel = model("User", userSchema);
