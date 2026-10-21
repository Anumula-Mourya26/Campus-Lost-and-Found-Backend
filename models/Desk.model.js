import { Schema, model } from "mongoose";
const deskSchema = new Schema({
  name: { type: String, required: true, trim: true },
  broadLocation: { type: String, required: true, trim: true },
  openingHours: { type: String, required: true, trim: true },
  contactInstructions: { type: String, required: true, trim: true },
  officerIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
  active: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false, strict: "throw" });
export const DeskModel = model("Desk", deskSchema);
