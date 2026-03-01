export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type RecommendedAction = 'NO_ACTION' | 'MONITOR' | 'TEMP_HOLD' | 'ESCALATE';

export interface DecisionDraft {
  id: string;
  caseId: number;
  riskLevel: RiskLevel;
  recommendedAction: RecommendedAction;
  justification: string;
  confidence: number;
  fairnessFlags: string[];
  createdAt: string;
}

