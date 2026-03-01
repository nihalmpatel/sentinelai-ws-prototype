import { Case } from "../models/case.model";
import { Decision } from "../models/decision.model";
import { computeRiskSignals } from "../engines/risk.engine";
import { evaluateCaseWithAi } from "../engines/ai.engine";
import { applyGuardrailsToDecision } from "./guardrails";
import { CaseStateMachine } from "./state.machine";

// High-level orchestration of case lifecycle will live here.
export class CaseManager {
  private readonly stateMachine = new CaseStateMachine();

  async evaluate(caseInput: Case): Promise<Decision> {
    const riskProfile = computeRiskSignals(caseInput);
    const aiDecision = await evaluateCaseWithAi(caseInput);
    const guardedDecision = applyGuardrailsToDecision(aiDecision, riskProfile);

    this.stateMachine.transition(caseInput, "evaluated");

    return guardedDecision;
  }
}

