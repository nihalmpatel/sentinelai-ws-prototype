import { Case } from "../models/case.model";

export function buildEvaluationPrompt(inputCase: Case): string {
  // JSON-only contract: the "prompt" passed to the LLM client is a structured JSON string.
  // (No free-form prompt content from the UI.)
  const payload = {
    case: {
      id: inputCase.id,
      userId: inputCase.userId,
      status: inputCase.status,
      createdAt: inputCase.createdAt,
      updatedAt: inputCase.updatedAt,
      context: inputCase.context ?? {}
    },
    risk: inputCase.riskProfile ?? null
  };

  return JSON.stringify(payload);
}

