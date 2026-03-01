import { Case } from "../models/case.model";
import { DecisionDraft } from "../models/decision.model";
import { buildEvaluationPrompt } from "../ai/prompt.builder";
import { llmClient } from "../ai/llm.client";
import { validateAiResponseShape } from "../ai/schema";

// Orchestrates prompt -> LLM -> validation.
export async function evaluateCaseWithAi(inputCase: Case): Promise<DecisionDraft> {
  const promptJson = buildEvaluationPrompt(inputCase);
  const raw = await llmClient.invoke(promptJson);
  const validated = validateAiResponseShape(raw);

  return {
    id: `ai-draft-${Date.now()}`,
    caseId: inputCase.id,
    riskLevel: validated.riskLevel,
    recommendedAction: validated.recommendedAction,
    justification: validated.justification,
    confidence: validated.confidence,
    fairnessFlags: validated.fairnessFlags,
    createdAt: new Date().toISOString()
  };
}

