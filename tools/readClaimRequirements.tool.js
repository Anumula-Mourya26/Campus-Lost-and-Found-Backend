import { answerPolicyQuestion } from "../services/policy-rag.service.js";
export async function readClaimRequirementsTool(input) {
  return await answerPolicyQuestion(input.question);
}
