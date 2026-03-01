import { Case } from "../models/case.model";

export const mockCases: Case[] = [
  {
    id: 1,
    userId: 1,
    status: "evaluated",
    createdAt: new Date().toISOString(),
    context: {
      source: "prototype",
      note: "Seed case for UI demo"
    },
    riskProfile: {
      caseId: 1,
      score: 0.3,
      signals: [
        {
          id: "seed_low_risk",
          label: "Demo seed case with low composite risk",
          weight: 0.3
        }
      ]
    },
    latestDecision: {
      id: "seed-decision-1",
      caseId: 1,
      outcome: "review",
      rationale: "Seed AI draft for demo case; human should review before acting.",
      createdAt: new Date().toISOString()
    }
  }
];

