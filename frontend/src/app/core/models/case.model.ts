import type { RiskProfile } from './risk.model';
import type { DecisionDraft } from './decision.model';
import type { HumanReview } from './review.model';
import type { MockTransaction } from './transaction.model';

export type CaseStatus =
  | 'NEW'
  | 'AI_DRAFTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'OVERRIDDEN'
  | 'CLOSED';

export interface SimilarCase {
  id: number;
  userId: number;
  status: CaseStatus;
  riskScore: number | null;
  recommendedAction: string | null;
}

export interface Case {
  id: number;
  userId: number;
  status: CaseStatus;
  createdAt: string;
  updatedAt: string;
  context?: Record<string, unknown>;
  riskProfile?: RiskProfile;
  aiDecisions: DecisionDraft[];
  humanReviews: HumanReview[];
  recentTransactions?: MockTransaction[];
  similarCases?: SimilarCase[];
}
