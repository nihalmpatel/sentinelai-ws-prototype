import { Case } from "../models/case.model";

export function buildEvaluationPrompt(inputCase: Case): string {
  // The real prompt template will live here.
  return `Evaluate the following case and return a structured decision. Case ID: ${inputCase.id}`;
}

