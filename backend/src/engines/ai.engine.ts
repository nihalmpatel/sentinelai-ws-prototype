import { Case } from "../models/case.model";
import { Decision } from "../models/decision.model";
import { buildEvaluationPrompt } from "../ai/prompt.builder";
import { llmClient } from "../ai/llm.client";
import { validateAiResponseShape } from "../ai/schema";

// Orchestrates prompt -> LLM -> validation.
export async function evaluateCaseWithAi(inputCase: Case): Promise<Decision> {
  const prompt = buildEvaluationPrompt(inputCase);
  const raw = await llmClient.invoke(prompt);
  const validated = validateAiResponseShape(raw);

  return {
    id: "pending",
    caseId: inputCase.id,
    outcome: validated.outcome,
    rationale: validated.rationale,
    createdAt: new Date().toISOString()
  };
}

