import { RiskProfile } from "./risk.model";
import { Decision } from "./decision.model";

export interface Case {
  id: number;
  userId: number;
  status: "new" | "evaluating" | "evaluated" | "overridden";
  createdAt: string;
  context?: Record<string, unknown>;
  /**
   * Optional, populated once the case has been evaluated.
   */
  riskProfile?: RiskProfile;
  latestDecision?: Decision;
}

