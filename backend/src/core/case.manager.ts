import { Case } from "../models/case.model";
import { Decision } from "../models/decision.model";
import { computeRiskSignals } from "../engines/risk.engine";
import { evaluateCaseWithAi } from "../engines/ai.engine";
import { applyGuardrailsToDecision } from "./guardrails";
import { CaseStateMachine } from "./state.machine";
import { mockCases } from "../data/historical.cases";
import { auditLogger } from "../audit/audit.logger";

// High-level orchestration of case lifecycle (in-memory only for prototype).
export class CaseManager {
  private readonly stateMachine = new CaseStateMachine();

  /**
   * Create a new in-memory case for a given user and optional context.
   */
  createCase(userId: number, context?: Record<string, unknown>): Case {
    const nextId =
      mockCases.length > 0
        ? Math.max(...mockCases.map((c) => c.id)) + 1
        : 1;

    const created: Case = {
      id: nextId,
      userId,
      status: "new",
      createdAt: new Date().toISOString(),
      context
    };

    mockCases.push(created);

    return created;
  }

  /**
   * Evaluate an existing case with risk and AI, updating in-memory state.
   */
  async evaluate(caseInput: Case): Promise<Decision> {
    const riskProfile = computeRiskSignals(caseInput);
    const aiDecision = await evaluateCaseWithAi(caseInput);
    const guardedDecision = applyGuardrailsToDecision(aiDecision, riskProfile);

    caseInput.riskProfile = riskProfile;
    caseInput.latestDecision = guardedDecision;

    this.stateMachine.transition(caseInput, "evaluated");

    auditLogger.log({
      id: `ai-decision-${Date.now()}`,
      type: "AI_DECISION_DRAFT",
      caseId: caseInput.id,
      createdAt: new Date().toISOString(),
      payload: {
        riskProfile,
        decision: guardedDecision
      }
    });

    return guardedDecision;
  }
}

export const caseManager = new CaseManager();

