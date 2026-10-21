import { ConversationModel } from "../models/Conversation.model.js";
import { searchMatchingReports } from "./matching.service.js";
import { answerPolicyQuestion } from "./policy-rag.service.js";
import { chatWithModel } from "./llm.service.js";
import { httpError } from "../utils/httpError.js";

export async function recoveryConversation(userId, message, conversationId) {
  let conversation;
  if (conversationId) {
    conversation = await ConversationModel.findOne({ _id: conversationId, user: userId });
    if (!conversation) throw httpError(404, "Conversation not found");
  } else conversation = await ConversationModel.create({ user: userId, messages: [] });
  const lower = message.toLowerCase();
  let context = "";
  let sources = [];
  if (/policy|deadline|evidence|desk|collect|collection|opening|hours|claim process/.test(lower)) {
    const policy = await answerPolicyQuestion(message);
    context = `Approved policy answer: ${policy.answer}`;
    sources = policy.sources;
  } else if (/lost|missing|find|headphones|phone|laptop|bag|item/.test(lower)) {
    const terms = message.replace(/^(help me|please|can you|i want to|find|locate)\s+/i, "").trim();
    if (terms.length >= 3) {
      try {
        const matches = await searchMatchingReports({ description: terms });
        context = matches.length ? `Possible public matches (not proof of ownership): ${JSON.stringify(matches.slice(0, 5))}` : "No open matching reports were found. Ask the user for the item's category, broad location, or approximate date.";
      } catch (err) { context = "Semantic matching is currently unavailable. Ask for category, broad location and approximate date, or try again after the embedding service is running."; }
    }
  }
  const recentMessages = conversation.messages.slice(-8).map((item) => ({ role: item.role, content: item.content }));
  const answer = await chatWithModel([
    { role: "system", content: "You are a cautious campus lost-and-found assistant. You may suggest possible matches but never decide ownership. Never reveal private identifiers, exact storage locations, private claim evidence, or another user's claim status. Ask one concise follow-up when category, broad area, or approximate date is missing. For possible matches, state clearly that a campus desk officer must verify ownership." },
    ...recentMessages,
    { role: "user", content: `${message}${context ? `\n\nSystem context (not user verified): ${context}` : ""}` }
  ], { options: { temperature: 0.2 } });
  conversation.messages.push({ role: "user", content: message }, { role: "assistant", content: answer.content || "I could not generate an answer." });
  await conversation.save();
  return { conversationId: conversation._id, answer: answer.content, sources };
}
