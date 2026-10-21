import express from "express";
import { verifyToken } from "../middlewares/verifyToken.middleware.js";
import { csrfProtection } from "../middlewares/csrf.middleware.js";
import { requireVerifiedEmail } from "../middlewares/requireVerifiedEmail.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { chatSchema, matchSchema } from "../utils/schemas.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { searchMatchingReports } from "../services/matching.service.js";
import { recoveryConversation } from "../services/conversation.service.js";
import { runMatchingAgent } from "../services/matching-agent.service.js";
import { answerPolicyQuestion } from "../services/policy-rag.service.js";

export const aiRouter = express.Router();
aiRouter.post("/match", verifyToken, csrfProtection, requireVerifiedEmail, validateBody(matchSchema), asyncHandler(async (req, res) => {
  const matches = await searchMatchingReports(req.body);
  res.json({ success: true, message: "Similarity is a suggestion only; desk staff must verify ownership", data: matches });
}));
aiRouter.post("/recovery-chat", verifyToken, csrfProtection, requireVerifiedEmail, validateBody(chatSchema), asyncHandler(async (req, res) => {
  const data = await recoveryConversation(req.user.id, req.body.message, req.body.conversationId);
  res.json({ success: true, data });
}));
aiRouter.post("/matching-agent", verifyToken, csrfProtection, requireVerifiedEmail, validateBody(chatSchema), asyncHandler(async (req, res) => {
  const data = await runMatchingAgent(req.user.id, req.body.message);
  res.json({ success: true, data });
}));
aiRouter.post("/policy-question", verifyToken, csrfProtection, requireVerifiedEmail, asyncHandler(async (req, res) => {
  const question = String(req.body?.question || "").trim();
  if (question.length < 3 || question.length > 1000) return res.status(400).json({ success: false, message: "question must contain 3 to 1000 characters" });
  const data = await answerPolicyQuestion(question);
  res.json({ success: true, data });
}));
