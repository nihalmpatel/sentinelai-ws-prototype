import { RiskProfile, RiskSignal } from "../models/risk.model";
import { Case } from "../models/case.model";

// Deterministic signal/risk computation (simple demo-friendly version).
export function computeRiskSignals(inputCase: Case): RiskProfile {
  const context = inputCase.context ?? {};
  const amount =
    typeof context["amount"] === "number" ? (context["amount"] as number) : 0;

  const signals: RiskSignal[] = [];

  if (amount >= 5000) {
    signals.push({
      id: "high_amount",
      label: "High transaction amount vs demo baseline",
      weight: 0.8
    });
  } else if (amount >= 1000) {
    signals.push({
      id: "moderate_amount",
      label: "Moderate transaction amount vs demo baseline",
      weight: 0.4
    });
  }

  // Very simple composite score: sum of weights, clamped to [0,1].
  const rawScore = signals.reduce((sum, s) => sum + s.weight, 0);
  const score = Math.max(0, Math.min(1, rawScore));

  return {
    caseId: inputCase.id,
    score,
    signals
  };
}

