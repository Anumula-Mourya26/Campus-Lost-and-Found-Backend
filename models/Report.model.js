import { Schema, model } from "mongoose";

const reportSchema = new Schema({
  reportType: { type: String, enum: ["LOST", "FOUND"], required: true },
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, required: true, trim: true, maxlength: 2000 },
  category: { type: String, required: true, enum: ["ELECTRONICS", "BAGS", "CLOTHING", "BOOKS", "ID_CARDS", "KEYS", "ACCESSORIES", "OTHER"] },
  broadLocation: { type: String, required: true, trim: true, maxlength: 120 },
  eventDate: { type: Date, required: true },
  reporter: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  desk: { type: Schema.Types.ObjectId, ref: "Desk" },
  status: { type: String, enum: ["OPEN", "UNDER_REVIEW", "CLAIMED", "RETURNED", "CLOSED"], default: "OPEN", index: true },
  embedding: { type: [Number], select: false },
  // Private details are never included in public listing responses.
  privateIdentifiers: { type: String, trim: true, maxlength: 1000, select: false },
  storageLocation: { type: String, trim: true, maxlength: 300, select: false },
  resolvedAt: { type: Date }
}, { timestamps: true, versionKey: false, strict: "throw" });
reportSchema.index({ reportType: 1, status: 1, category: 1, eventDate: -1 });
export const ReportModel = model("Report", reportSchema);
