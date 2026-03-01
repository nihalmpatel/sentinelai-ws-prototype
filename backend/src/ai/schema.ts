export interface AiDecisionShape {
  outcome: "approve" | "review" | "decline";
  rationale: string;
}

export function validateAiResponseShape(raw: unknown): AiDecisionShape {
  const fallback: AiDecisionShape = {
    outcome: "review",
    rationale: "AI response could not be parsed; defaulting to manual review."
  };

  if (!raw || typeof raw !== "object") {
    return fallback;
  }

  const maybe = raw as Partial<AiDecisionShape>;
  if (
    maybe.outcome === "approve" ||
    maybe.outcome === "review" ||
    maybe.outcome === "decline"
  ) {
    if (typeof maybe.rationale === "string" && maybe.rationale.length > 0) {
      return {
        outcome: maybe.outcome,
        rationale: maybe.rationale
      };
    }
  }

  return fallback;
}

