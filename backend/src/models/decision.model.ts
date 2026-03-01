export interface Decision {
  id: string;
  caseId: number;
  outcome: "approve" | "review" | "decline";
  rationale: string;
  createdAt: string;
}

