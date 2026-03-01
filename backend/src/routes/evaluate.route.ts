import { Router } from "express";

export const evaluateRouter = Router();

// Placeholder route – will call into engines/core later.
evaluateRouter.post("/", (req, res) => {
  // For now just echo back the payload and a stub decision.
  res.status(200).json({
    message: "Evaluate endpoint skeleton",
    payload: req.body ?? null,
    decision: null
  });
});

