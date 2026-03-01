export interface RiskSignal {
  id: string;
  label: string;
  weight: number;
}

export interface RiskProfile {
  caseId: number;
  score: number;
  signals: RiskSignal[];
}

