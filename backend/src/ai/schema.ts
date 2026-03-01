import { RecommendedAction, RiskLevel } from "../models/decision.model";

export interface AiDecisionShape {
  riskLevel: RiskLevel;
  recommendedAction: RecommendedAction;
  justification: string;
  confidence: number;
  fairnessFlags: string[];
}

const FALLBACK: AiDecisionShape = {
  riskLevel: "MEDIUM",
  recommendedAction: "MONITOR",
  justification:
    "AI response could not be parsed; defaulting to monitoring and manual review.",
  confidence: 0.3,
  fairnessFlags: ["UNPARSEABLE_MODEL_OUTPUT"]
};

function isRiskLevel(v: unknown): v is RiskLevel {
  return v === "LOW" || v === "MEDIUM" || v === "HIGH";
}

function isRecommendedAction(v: unknown): v is RecommendedAction {
  return (
    v === "NO_ACTION" ||
    v === "MONITOR" ||
    v === "TEMP_HOLD" ||
    v === "ESCALATE"
  );
}

export function validateAiResponseShape(raw: unknown): AiDecisionShape {
  if (!raw || typeof raw !== "object") {
    return FALLBACK;
  }

  const maybe = raw as Partial<AiDecisionShape> & Record<string, unknown>;

  // Guardrail: schema is intentionally not allowing irreversible actions.
  if ("irreversibleAction" in maybe) {
    return {
      ...FALLBACK,
      fairnessFlags: ["AI_ATTEMPTED_IRREVERSIBLE_ACTION"]
    };
  }

  if (!isRiskLevel(maybe.riskLevel) || !isRecommendedAction(maybe.recommendedAction)) {
    return FALLBACK;
  }

  if (typeof maybe.justification !== "string" || maybe.justification.trim().length === 0) {
    return FALLBACK;
  }

  const confidence =
    typeof maybe.confidence === "number" && Number.isFinite(maybe.confidence)
      ? Math.max(0, Math.min(1, maybe.confidence))
      : FALLBACK.confidence;

  const fairnessFlags = Array.isArray(maybe.fairnessFlags)
    ? maybe.fairnessFlags.filter((f): f is string => typeof f === "string" && f.length > 0)
    : [];

  return {
    riskLevel: maybe.riskLevel,
    recommendedAction: maybe.recommendedAction,
    justification: maybe.justification.trim(),
    confidence,
    fairnessFlags
  };
}

