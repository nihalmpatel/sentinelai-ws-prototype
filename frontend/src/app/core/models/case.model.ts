import type { RiskProfile } from './risk.model';
import type { Decision } from './decision.model';

export type CaseStatus = 'new' | 'evaluating' | 'evaluated' | 'overridden';

export interface Case {
  id: number;
  userId: number;
  status: CaseStatus;
  createdAt: string;
  context?: Record<string, unknown>;
  riskProfile?: RiskProfile;
  latestDecision?: Decision;
}

