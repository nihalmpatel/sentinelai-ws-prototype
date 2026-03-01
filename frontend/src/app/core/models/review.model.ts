import type { RecommendedAction } from './decision.model';

export type ReviewType = 'APPROVE_AI' | 'OVERRIDE';

export type IrreversibleAction =
  | 'PERMANENT_ACCOUNT_CLOSURE'
  | 'LAW_ENFORCEMENT_REPORT';

export interface HumanReview {
  id: string;
  caseId: number;
  reviewerId: string;
  type: ReviewType;
  finalAction: RecommendedAction;
  rationale: string;
  irreversibleAction?: IrreversibleAction;
  confirmedIrreversible?: boolean;
  createdAt: string;
}

