import { Decision } from "../models/decision.model";
import { RiskProfile } from "../models/risk.model";

// Enforces human/organizational constraints on AI output.
export function applyGuardrailsToDecision(
  decision: Decision,
  _risk: RiskProfile
): Decision {
  // Guardrail rules will be applied here.
  return decision;
}

