import { Router } from "express";
import { mockCases } from "../data/historical.cases";

export const caseRouter = Router();

caseRouter.get("/", (_req, res) => {
  res.status(200).json({
    message: "Case list skeleton",
    cases: mockCases
  });
});

caseRouter.get("/:id", (req, res) => {
  const id = req.params.id;
  const found = mockCases.find((c) => String(c.id) === id);

  if (!found) {
    return res.status(404).json({ message: "Case not found" });
  }

  return res.status(200).json(found);
});

