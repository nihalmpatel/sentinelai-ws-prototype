import { DecisionDraft } from "../models/decision.model";
import { RiskProfile } from "../models/risk.model";

// Enforces human/organizational constraints on AI output.
export function applyGuardrailsToDecision(
  decision: DecisionDraft,
  _risk: RiskProfile
): DecisionDraft {
  // Guardrail: AI must never directly request/encode irreversible actions.
  // (Irreversible actions are only available via human review endpoint + UI confirmation.)
  const { ...safe } = decision as DecisionDraft & Record<string, unknown>;
  delete (safe as Record<string, unknown>)["irreversibleAction"];
  delete (safe as Record<string, unknown>)["confirmedIrreversible"];
  return safe as DecisionDraft;
}

