import { Router } from "express";
import { caseManager } from "../core/case.manager";

export const evaluateRouter = Router();

interface EvaluateRequestBody {
  userId: number;
  amount?: number;
  currency?: string;
  merchant?: string;
  location?: string;
  timestamp?: string;
  [key: string]: unknown;
}

// POST /api/evaluate – evaluate a (simulated) transaction and create a case.
evaluateRouter.post("/", async (req, res) => {
  const body = req.body as Partial<EvaluateRequestBody> | undefined;

  if (!body || typeof body.userId !== "number") {
    return res.status(400).json({
      message: "Missing or invalid userId in request body."
    });
  }

  try {
    const context: Record<string, unknown> = {
      amount: body.amount ?? 0,
      currency: body.currency ?? "USD",
      merchant: body.merchant ?? "Demo Merchant",
      location: body.location ?? "Demo Location",
      timestamp: body.timestamp ?? new Date().toISOString()
    };

    const createdCase = caseManager.createCase(body.userId, context);
    const decisionDraft = await caseManager.evaluate(createdCase);

    return res.status(200).json({
      caseId: createdCase.id,
      case: createdCase,
      riskProfile: createdCase.riskProfile,
      decisionDraft
    });
  } catch (err) {
    // In a real system we'd have structured error handling here.
    // For the prototype we surface a generic error.
    // eslint-disable-next-line no-console
    console.error("[evaluate] error", err);

    return res.status(500).json({
      message: "Failed to evaluate case"
    });
  }
});

