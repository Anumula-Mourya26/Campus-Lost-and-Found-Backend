import { Schema, model } from "mongoose";
const policyChunkSchema = new Schema({
  title: { type: String, required: true, trim: true },
  text: { type: String, required: true, trim: true },
  source: { type: String, required: true, trim: true },
  chunkNumber: { type: Number, default: 0 },
  embedding: { type: [Number], select: false },
  active: { type: Boolean, default: true }
}, { timestamps: true, versionKey: false, strict: "throw" });
export const PolicyChunkModel = model("PolicyChunk", policyChunkSchema);
