import { Case } from "../models/case.model";
import { DecisionDraft, RecommendedAction } from "../models/decision.model";
import { computeRiskSignals } from "../engines/risk.engine";
import { evaluateCaseWithAi } from "../engines/ai.engine";
import { applyGuardrailsToDecision } from "./guardrails";
import { CaseStateMachine } from "./state.machine";
import { mockCases } from "../data/historical.cases";
import { mockTransactions } from "../data/mock.transactions";
import { LOW_RISK_APPROVAL_THRESHOLD } from "./policy.config";
import { auditLogger } from "../audit/audit.logger";
import {
  HumanReview,
  IrreversibleAction,
  ReviewType
} from "../models/human-review.model";

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

    const now = new Date().toISOString();
    const created: Case = {
      id: nextId,
      userId,
      status: "NEW",
      createdAt: now,
      updatedAt: now,
      context,
      aiDecisions: [],
      humanReviews: []
    };

    mockCases.push(created);

    return created;
  }

  /**
   * Evaluate an existing case with risk and AI, updating in-memory state.
   */
  async evaluate(caseInput: Case): Promise<DecisionDraft> {
    const riskProfile = computeRiskSignals(caseInput);
    caseInput.riskProfile = riskProfile;

    // Attach a small window of recent transactions for the related user (if any).
    const recent = mockTransactions
      .filter((t) => t.userId === caseInput.userId)
      .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
      .slice(-5);
    if (recent.length > 0) {
      caseInput.recentTransactions = recent;
    }
    const aiDecision = await evaluateCaseWithAi(caseInput);
    const guardedDecision = applyGuardrailsToDecision(aiDecision, riskProfile);

    caseInput.aiDecisions.push(guardedDecision);
    caseInput.updatedAt = new Date().toISOString();

    if (caseInput.status === "NEW") {
      this.stateMachine.transition(caseInput, "AI_DRAFTED");
      auditLogger.log({
        id: `audit-${Date.now()}-transition`,
        actorType: "SYSTEM",
        action: "CASE_STATE_TRANSITION",
        caseId: caseInput.id,
        timestamp: new Date().toISOString(),
        metadata: { from: "NEW", to: "AI_DRAFTED" }
      });
    }

    auditLogger.log({
      id: `audit-${Date.now()}-ai-draft`,
      actorType: "AI",
      action: "AI_DECISION_DRAFT_CREATED",
      caseId: caseInput.id,
      timestamp: new Date().toISOString(),
      metadata: { riskProfile, decisionDraft: guardedDecision }
    });

    return guardedDecision;
  }

  listCases(): Case[] {
    return [...mockCases];
  }

  getCase(caseId: number): Case | undefined {
    return mockCases.find((c) => c.id === caseId);
  }

  submitHumanReview(params: {
    caseId: number;
    reviewerId: string;
    type: ReviewType;
    finalAction?: RecommendedAction;
    rationale?: string;
    irreversibleAction?: IrreversibleAction;
    confirmedIrreversible?: boolean;
  }): { updatedCase: Case; review: HumanReview } {
    const found = this.getCase(params.caseId);
    if (!found) {
      throw new Error("Case not found");
    }

    if (found.status === "NEW") {
      throw new Error("Case has no AI draft yet");
    }

    if (found.status === "APPROVED" || found.status === "OVERRIDDEN" || found.status === "CLOSED") {
      throw new Error("Case already has a final human decision");
    }

    const latestAi = found.aiDecisions.at(-1);
    if (!latestAi) {
      throw new Error("Case has no AI draft yet");
    }

    const now = new Date().toISOString();
    const reviewType = params.type;

    if (
      params.irreversibleAction &&
      params.irreversibleAction !== "PERMANENT_ACCOUNT_CLOSURE" &&
      params.irreversibleAction !== "LAW_ENFORCEMENT_REPORT"
    ) {
      throw new Error("Invalid irreversibleAction");
    }

    if (reviewType === "OVERRIDE") {
      if (
        typeof params.finalAction !== "string" ||
        (params.finalAction !== "NO_ACTION" &&
          params.finalAction !== "MONITOR" &&
          params.finalAction !== "TEMP_HOLD" &&
          params.finalAction !== "ESCALATE")
      ) {
        throw new Error("Override requires an explicit finalAction");
      }
      if (typeof params.rationale !== "string" || params.rationale.trim().length === 0) {
        throw new Error("Override requires a textual rationale");
      }
    }

    if (reviewType === "APPROVE_AI") {
      const score = found.riskProfile?.score;
      if (typeof score !== "number") {
        auditLogger.log({
          id: `audit-${Date.now()}-low-risk-approval-rejected`,
          actorType: "HUMAN",
          actorId: params.reviewerId,
          action: "LOW_RISK_APPROVAL_REJECTED",
          caseId: found.id,
          timestamp: now,
          metadata: {
            reason: "Missing risk profile score",
            threshold: LOW_RISK_APPROVAL_THRESHOLD
          }
        });
        throw new Error("Cannot approve AI recommendation without a risk score");
      }

      if (score > LOW_RISK_APPROVAL_THRESHOLD) {
        auditLogger.log({
          id: `audit-${Date.now()}-low-risk-approval-rejected`,
          actorType: "HUMAN",
          actorId: params.reviewerId,
          action: "LOW_RISK_APPROVAL_REJECTED",
          caseId: found.id,
          timestamp: now,
          metadata: {
            reason: "Risk score above low-risk approval threshold",
            score,
            threshold: LOW_RISK_APPROVAL_THRESHOLD
          }
        });
        throw new Error(
          "Approve AI recommendation is only available for low-risk cases. Use override instead."
        );
      }
    }

    const finalAction =
      reviewType === "APPROVE_AI"
        ? latestAi.recommendedAction
        : (params.finalAction as RecommendedAction);

    const rationale =
      reviewType === "APPROVE_AI"
        ? (params.rationale?.trim() || "Approved AI recommendation.")
        : (params.rationale as string).trim();

    if (params.irreversibleAction) {
      if (params.confirmedIrreversible !== true) {
        auditLogger.log({
          id: `audit-${Date.now()}-irreversible-rejected`,
          actorType: "HUMAN",
          actorId: params.reviewerId,
          action: "IRREVERSIBLE_ACTION_REJECTED",
          caseId: found.id,
          timestamp: now,
          metadata: {
            irreversibleAction: params.irreversibleAction,
            reason: "Missing explicit confirmation"
          }
        });
        throw new Error("Irreversible action requires explicit confirmation");
      }
    }

    // Under-review is optional in the prototype, but we keep the transition for audit clarity.
    if (found.status === "AI_DRAFTED") {
      this.stateMachine.transition(found, "UNDER_REVIEW");
      auditLogger.log({
        id: `audit-${Date.now()}-transition-under-review`,
        actorType: "SYSTEM",
        action: "CASE_STATE_TRANSITION",
        caseId: found.id,
        timestamp: now,
        metadata: { from: "AI_DRAFTED", to: "UNDER_REVIEW" }
      });
    }

    const review: HumanReview = {
      id: `review-${Date.now()}`,
      caseId: found.id,
      reviewerId: params.reviewerId,
      type: reviewType,
      finalAction,
      rationale,
      irreversibleAction: params.irreversibleAction,
      confirmedIrreversible: params.confirmedIrreversible,
      createdAt: now
    };
    found.humanReviews.push(review);
    found.updatedAt = now;

    auditLogger.log({
      id: `audit-${Date.now()}-human-review`,
      actorType: "HUMAN",
      actorId: params.reviewerId,
      action: "HUMAN_REVIEW_SUBMITTED",
      caseId: found.id,
      timestamp: now,
      metadata: {
        type: reviewType,
        finalAction,
        irreversibleAction: params.irreversibleAction ?? null,
        rationale
      }
    });

    const targetStatus =
      reviewType === "APPROVE_AI" ? "APPROVED" : ("OVERRIDDEN" as const);
    this.stateMachine.transition(found, targetStatus);
    auditLogger.log({
      id: `audit-${Date.now()}-transition-final`,
      actorType: "SYSTEM",
      action: "CASE_STATE_TRANSITION",
      caseId: found.id,
      timestamp: now,
      metadata: { from: "UNDER_REVIEW", to: targetStatus }
    });

    if (params.irreversibleAction) {
      auditLogger.log({
        id: `audit-${Date.now()}-irreversible-confirmed`,
        actorType: "HUMAN",
        actorId: params.reviewerId,
        action: "IRREVERSIBLE_ACTION_CONFIRMED",
        caseId: found.id,
        timestamp: now,
        metadata: { irreversibleAction: params.irreversibleAction }
      });

      this.stateMachine.transition(found, "CLOSED");
      auditLogger.log({
        id: `audit-${Date.now()}-transition-closed`,
        actorType: "SYSTEM",
        action: "CASE_STATE_TRANSITION",
        caseId: found.id,
        timestamp: now,
        metadata: { from: targetStatus, to: "CLOSED" }
      });

      auditLogger.log({
        id: `audit-${Date.now()}-irreversible-executed`,
        actorType: "SYSTEM",
        action: "IRREVERSIBLE_ACTION_EXECUTED",
        caseId: found.id,
        timestamp: now,
        metadata: { irreversibleAction: params.irreversibleAction }
      });
    }

    return { updatedCase: found, review };
  }

  getCaseAudit(caseId: number) {
    return auditLogger.listForCase(caseId);
  }
}

export const caseManager = new CaseManager();

