export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

export type RecommendedAction =
  | "NO_ACTION"
  | "MONITOR"
  | "TEMP_HOLD"
  | "ESCALATE";

// AI-generated decision draft (JSON-only, schema-validated).
export interface DecisionDraft {
  id: string;
  caseId: number;
  riskLevel: RiskLevel;
  recommendedAction: RecommendedAction;
  justification: string;
  confidence: number; // 0..1
  fairnessFlags: string[];
  createdAt: string;
}

