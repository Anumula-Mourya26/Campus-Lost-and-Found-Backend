import { searchMatchingReports } from "../services/matching.service.js"

export async function searchPublicItemsTool(input) {
  return await searchMatchingReports(input);
}