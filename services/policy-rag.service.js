import { PolicyChunkModel } from "../models/PolicyChunk.model.js";
import { generateEmbedding } from "./embedding.service.js";
import { cosineSimilarity } from "./similarity.service.js";
import { chatWithModel } from "./llm.service.js";

export async function retrievePolicyChunks(query, limit = 5) {
  const embedding = await generateEmbedding(query);
  let chunks;
  if (process.env.VECTOR_SEARCH_ENABLED === "true") {
    try {
      chunks = await PolicyChunkModel.aggregate([
        { $vectorSearch: { index: process.env.POLICY_VECTOR_INDEX || "policy_chunk_index", path: "embedding", queryVector: embedding, numCandidates: 50, limit, filter: { active: { $eq: true } } } },
        { $project: { title: 1, text: 1, source: 1, score: { $meta: "vectorSearchScore" } } }
      ]);
    } catch (err) { console.error("Policy vector search failed; using cosine fallback:", err.message); }
  }
  if (!chunks) {
    const docs = await PolicyChunkModel.find({ active: true }).select("+embedding").limit(500);
    chunks = docs.map((doc) => ({ ...doc.toObject(), score: cosineSimilarity(embedding, doc.embedding || []) })).sort((a, b) => b.score - a.score).slice(0, limit);
  }
  return chunks;
}
export async function answerPolicyQuestion(question) {
  const chunks = await retrievePolicyChunks(question);
  if (!chunks.length || (chunks[0].score !== undefined && chunks[0].score < 0.2)) {
    return { answer: "I could not find this detail in the approved campus policy data. Please contact the campus lost-and-found desk.", sources: [], grounded: false };
  }
  const context = chunks.map((chunk, i) => `[${i + 1}] ${chunk.title} (${chunk.source}): ${chunk.text}`).join("\n\n");
  const message = await chatWithModel([
    { role: "system", content: "You are the campus lost-and-found procedure assistant. Answer only using the supplied approved policy context. If the context does not answer the question, say so. Do not reveal private identifiers, exact storage locations, or another person's claim details. Cite policy sources using [1], [2] exactly as numbered." },
    { role: "user", content: `Policy context:\n${context}\n\nQuestion: ${question}` }
  ], { options: { temperature: 0.1 } });
  return { answer: message.content || "I could not generate an answer.", sources: chunks.map((chunk, i) => ({ citation: `[${i + 1}]`, title: chunk.title, source: chunk.source })), grounded: true };
}
