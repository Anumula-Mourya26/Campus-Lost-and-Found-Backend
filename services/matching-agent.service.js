import { chatWithModel } from "./llm.service.js";
import { searchMatchingReports } from "./matching.service.js";
import { answerPolicyQuestion } from "./policy-rag.service.js";
import { ConversationModel } from "../models/Conversation.model.js";
import { httpError } from "../utils/httpError.js";

// Tool calling follows the simple loop: model chooses a tool -> run it -> send result back.
const tools = [
  { type: "function", function: { name: "searchPublicItems", description: "Search sanitized public found-item reports for possible semantic matches. Never returns private identifiers or claim evidence.", parameters: { type: "object", properties: { description: { type: "string", description: "Description of the missing item" }, category: { type: "string", enum: ["ELECTRONICS", "BAGS", "CLOTHING", "BOOKS", "ID_CARDS", "KEYS", "ACCESSORIES", "OTHER"] }, broadLocation: { type: "string" } }, required: ["description"] } } },
  { type: "function", function: { name: "readClaimRequirements", description: "Retrieve approved policy instructions for claiming an item, evidence, desk hours, or collection process.", parameters: { type: "object", properties: { question: { type: "string" } }, required: ["question"] } } },
  { type: "function", function: { name: "askForMoreContext", description: "Generate one useful follow-up question when the item description is too vague.", parameters: { type: "object", properties: { missingDetail: { type: "string" } }, required: ["missingDetail"] } } }
];
async function runTool(name, input) {
  if (name === "searchPublicItems") return await searchMatchingReports({ description: input.description, category: input.category, broadLocation: input.broadLocation });
  if (name === "readClaimRequirements") return await answerPolicyQuestion(input.question);
  if (name === "askForMoreContext") return { question: `Could you share ${input.missingDetail}? Please avoid posting private serial numbers or secret identifying marks in public.` };
  return { error: "Unknown tool" };
}
export async function runMatchingAgent(userId, userMessage) {
  if (typeof userMessage !== "string" || userMessage.trim().length < 2) throw httpError(400, "A message is required");
  const conversation = await ConversationModel.create({ user: userId, messages: [{ role: "user", content: userMessage }] });
  const messages = [
    { role: "system", content: "You are a campus lost-and-found matching assistant. Use tools when relevant. Search only sanitized public listings. Ask for category, broad area or approximate date if details are missing. Never claim a match proves ownership, never approve claims, and never expose private identifiers, exact storage locations, or other users' claim status. A human desk officer makes all ownership decisions. Never call tools with private evidence or serial numbers." },
    { role: "user", content: userMessage }
  ];
  const toolsUsed = [];
  let finalMessage = "I could not complete the search. Please try again with an item description.";
  for (let i = 0; i < 4; i++) {
    const response = await chatWithModel(messages, { tools, options: { temperature: 0.1 } });
    messages.push(response);
    const calls = response.tool_calls || [];
    if (!calls.length) { finalMessage = response.content || finalMessage; break; }
    for (const call of calls) {
      const name = call.function?.name;
      let input = call.function?.arguments || {};
      if (typeof input === "string") { try { input = JSON.parse(input); } catch { input = {}; } }
      const result = await runTool(name, input);
      toolsUsed.push({ name, input, result });
      messages.push({ role: "tool", tool_name: name, content: JSON.stringify(result).slice(0, 12000) });
    }
  }
  conversation.messages.push({ role: "assistant", content: finalMessage });
  await conversation.save();
  return { conversationId: conversation._id, answer: finalMessage, toolsUsed, notice: "AI suggestions are not proof of ownership. Campus staff decide claims." };
}
