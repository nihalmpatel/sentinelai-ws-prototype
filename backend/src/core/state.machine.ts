import { Case } from "../models/case.model";

export type CaseState = Case["status"];

export class CaseStateMachine {
  private readonly allowed: Record<CaseState, CaseState[]> = {
    NEW: ["AI_DRAFTED"],
    AI_DRAFTED: ["UNDER_REVIEW", "APPROVED", "OVERRIDDEN"],
    UNDER_REVIEW: ["APPROVED", "OVERRIDDEN"],
    APPROVED: ["CLOSED"],
    OVERRIDDEN: ["CLOSED"],
    CLOSED: []
  };

  transition(inputCase: Case, next: CaseState): void {
    const current = inputCase.status;
    const allowedNext = this.allowed[current] ?? [];
    if (!allowedNext.includes(next)) {
      throw new Error(
        `Invalid case state transition: ${current} -> ${next} (caseId=${inputCase.id})`
      );
    }
    inputCase.status = next;
  }
}

