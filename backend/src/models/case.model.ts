export interface Case {
  id: number;
  userId: number;
  status: "new" | "evaluating" | "evaluated" | "overridden";
  createdAt: string;
  context?: Record<string, unknown>;
}

