import { ReportModel } from "../models/Report.model.js";
import { generateEmbedding } from "./embedding.service.js";
import { cosineSimilarity } from "./similarity.service.js";
import { publicReport } from "../utils/publicReport.js";

export async function searchMatchingReports(input) {
  const embedding = await generateEmbedding(input.description);
  const filter = { status: "OPEN", reportType: "FOUND" };
  if (input.category) filter.category = input.category;
  if (input.broadLocation) filter.broadLocation = { $regex: input.broadLocation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), $options: "i" };
  if (input.afterDate || input.beforeDate) filter.eventDate = { ...(input.afterDate && { $gte: input.afterDate }), ...(input.beforeDate && { $lte: input.beforeDate }) };

  let candidates;
  if (process.env.VECTOR_SEARCH_ENABLED === "true") {
    try {
      candidates = await ReportModel.aggregate([
        { $vectorSearch: { index: process.env.REPORT_VECTOR_INDEX || "report_embedding_index", path: "embedding", queryVector: embedding, numCandidates: 100, limit: 30, filter: { status: { $eq: "OPEN" }, ...(input.category ? { category: { $eq: input.category } } : {}) } } },
        { $match: filter }, { $project: { title: 1, description: 1, category: 1, broadLocation: 1, eventDate: 1, reportType: 1, status: 1, createdAt: 1, score: { $meta: "vectorSearchScore" } } }
      ]);
    } catch (err) { console.error("Atlas vector search failed; using local cosine fallback:", err.message); }
  }
  if (!candidates) {
    const docs = await ReportModel.find(filter).select("+embedding").limit(500);
    candidates = docs.map((doc) => ({ ...doc.toObject(), score: cosineSimilarity(embedding, doc.embedding || []) }));
  }
  return candidates.filter((item) => item.reportType !== input.reportType).sort((a, b) => b.score - a.score).slice(0, 10).map((item) => ({ ...publicReport(item), similarity: Math.round((item.score || 0) * 100) / 100 }));
}
