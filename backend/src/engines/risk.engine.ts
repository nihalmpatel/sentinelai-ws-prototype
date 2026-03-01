import { RiskProfile } from "../models/risk.model";
import { Case } from "../models/case.model";

// Deterministic signal/risk computation will live here.
export function computeRiskSignals(inputCase: Case): RiskProfile {
  return {
    caseId: inputCase.id,
    score: 0,
    signals: []
  };
}

