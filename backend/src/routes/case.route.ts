import {Router} from "express";
import {caseManager} from "../core/case.manager";
import {IrreversibleAction, ReviewType} from "../models/human-review.model";
import {RecommendedAction} from "../models/decision.model";

export const caseRouter = Router();

caseRouter.get("/", (req, res) => {
	const allCases = caseManager.listCases();

	// ── Pagination (API-02) ──
	const page = Math.max(1, Number(req.query.page) || 1);
	const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 20));
	const total = allCases.length;
	const totalPages = Math.ceil(total / limit) || 1;
	const start = (page - 1) * limit;
	const paginated = allCases.slice(start, start + limit);

	res.status(200).json({
		cases: paginated,
		pagination: {
			page,
			limit,
			total,
			totalPages,
		},
	});
});

caseRouter.get("/:id", (req, res) => {
	const id = Number(req.params.id);
	if (!Number.isFinite(id)) {
		return res.status(400).json({message: "Invalid case id"});
	}

	const found = caseManager.getCase(id);

	if (!found) {
		return res.status(404).json({message: "Case not found"});
	}

	// Attach similar historical cases for the case-view UI (FR-FE-03).
	const similarCases = caseManager.findSimilarCases(id, 5).map((c) => ({
		id: c.id,
		userId: c.userId,
		status: c.status,
		riskScore: c.riskProfile?.score ?? null,
		recommendedAction: c.aiDecisions.at(-1)?.recommendedAction ?? null,
	}));

	return res.status(200).json({...found, similarCases});
});

caseRouter.get("/:id/audit", (req, res) => {
	const id = Number(req.params.id);
	if (!Number.isFinite(id)) {
		return res.status(400).json({message: "Invalid case id"});
	}
	const found = caseManager.getCase(id);
	if (!found) {
		return res.status(404).json({message: "Case not found"});
	}

	return res.status(200).json({
		caseId: id,
		events: caseManager.getCaseAudit(id),
	});
});

interface SubmitReviewBody {
	reviewerId: string;
	type: ReviewType;
	finalAction?: RecommendedAction;
	rationale?: string;
	irreversibleAction?: IrreversibleAction;
	confirmedIrreversible?: boolean;
}

caseRouter.post("/:id/reviews", (req, res) => {
	const id = Number(req.params.id);
	if (!Number.isFinite(id)) {
		return res.status(400).json({message: "Invalid case id"});
	}

	const body = req.body as Partial<SubmitReviewBody> | undefined;
	if (!body || typeof body.reviewerId !== "string" || body.reviewerId.trim().length === 0) {
		return res.status(400).json({message: "Missing reviewerId"});
	}
	if (body.type !== "APPROVE_AI" && body.type !== "OVERRIDE") {
		return res.status(400).json({message: "Missing or invalid review type"});
	}

	try {
		const result = caseManager.submitHumanReview({
			caseId: id,
			reviewerId: body.reviewerId.trim(),
			type: body.type,
			finalAction: body.finalAction,
			rationale: body.rationale,
			irreversibleAction: body.irreversibleAction,
			confirmedIrreversible: body.confirmedIrreversible,
		});

		return res.status(200).json({
			case: result.updatedCase,
			review: result.review,
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : "Failed to submit review";
		return res.status(400).json({message});
	}
});
