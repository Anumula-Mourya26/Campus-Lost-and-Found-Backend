import { ReportModel } from "../models/Report.model.js";
import { generateEmbedding } from "./embedding.service.js";
import { httpError } from "../utils/httpError.js";
import { publicReport } from "../utils/publicReport.js";

export async function createReport(input, userId) {
  const embedding = await generateEmbedding(`${input.title}. ${input.description}. Category: ${input.category}. Location: ${input.broadLocation}`);
  const report = await ReportModel.create({ ...input, reporter: userId, embedding });
  return { id: report._id, reportType: report.reportType, title: report.title, description: report.description, category: report.category, broadLocation: report.broadLocation, eventDate: report.eventDate, status: report.status };
}
export async function listMyReports(userId) {
  const reports = await ReportModel.find({ reporter: userId }).sort({ createdAt: -1 });
  return reports.map(publicReport);
}
