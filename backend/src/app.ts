import express, { Application } from "express";
import { json } from "express";
import { evaluateRouter } from "./routes/evaluate.route";
import { caseRouter } from "./routes/case.route";

export const app: Application = express();

app.use(json());

// HTTP-only concerns: wire routes, no business logic here.
app.use("/api/evaluate", evaluateRouter);
app.use("/api/cases", caseRouter);

app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
