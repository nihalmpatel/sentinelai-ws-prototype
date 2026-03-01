import { RiskProfile } from "./risk.model";
import { DecisionDraft } from "./decision.model";
import { HumanReview } from "./human-review.model";
import type { MockTransaction } from "../data/mock.transactions";

export interface Case {
  id: number;
  userId: number;
  status:
    | "NEW"
    | "AI_DRAFTED"
    | "UNDER_REVIEW"
    | "APPROVED"
    | "OVERRIDDEN"
    | "CLOSED";
  createdAt: string;
  updatedAt: string;
  context?: Record<string, unknown>;
  /**
   * Optional, populated once the case has been evaluated.
   */
  riskProfile?: RiskProfile;
  aiDecisions: DecisionDraft[];
  humanReviews: HumanReview[];
  /**
   * Optional, recent transactions for the related user (in-memory only).
   */
  recentTransactions?: MockTransaction[];
}

