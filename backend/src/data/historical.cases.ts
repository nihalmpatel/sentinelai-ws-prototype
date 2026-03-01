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
    }
  }
];

