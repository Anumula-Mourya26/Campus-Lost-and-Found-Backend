import { Schema, model } from "mongoose";
const messageSchema = new Schema({ role: { type: String, enum: ["user", "assistant"], required: true }, content: { type: String, required: true, maxlength: 4000 }, createdAt: { type: Date, default: Date.now } }, { _id: false });
const conversationSchema = new Schema({ user: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true }, messages: { type: [messageSchema], default: [] } }, { timestamps: true, versionKey: false, strict: "throw" });
export const ConversationModel = model("Conversation", conversationSchema);
