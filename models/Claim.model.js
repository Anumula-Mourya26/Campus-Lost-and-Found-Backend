import { Schema, model } from "mongoose";

const claimSchema = new Schema({
  report: { type: Schema.Types.ObjectId, ref: "Report", required: true, index: true },
  claimant:  { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  privateEvidence: { type: String, required: true, trim: true, maxlength: 2000, select: false },
  distinguishingDetails: { type: String, trim: true, maxlength: 1000, select: false },
  status: { type: String, enum: ["PENDING", "APPROVED", "REJECTED", "HANDED_OVER", "CANCELLED"], default: "PENDING", index: true },
  decisionNote: { type: String, trim: true, maxlength: 1000 },
  reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  reviewedAt: { type: Date },
  handoverBy: { type: Schema.Types.ObjectId, ref: "User" },
  handoverAt: { type: Date }
}, { timestamps: true, versionKey: false, strict: "throw" });
claimSchema.index({ report: 1, claimant: 1, status: 1 });
export const ClaimModel = model("Claim", claimSchema);
