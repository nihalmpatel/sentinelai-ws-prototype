import { Case } from "../models/case.model";

export type CaseState = "new" | "evaluating" | "evaluated" | "overridden";

// Minimal placeholder state machine focused on clarity, not completeness.
export class CaseStateMachine {
  transition(_case: Case, _next: CaseState): void {
    // State transition rules will be enforced here.
  }
}

