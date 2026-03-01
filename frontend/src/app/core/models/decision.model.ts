export type DecisionOutcome = 'approve' | 'review' | 'decline';

export interface Decision {
  id: string;
  caseId: number;
  outcome: DecisionOutcome;
  rationale: string;
  createdAt: string;
}

