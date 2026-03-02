import {Case} from "../models/case.model";
import {DecisionDraft} from "../models/decision.model";
import {buildEvaluationPrompt} from "../ai/prompt.builder";
import {llmClient} from "../ai/llm.client";
import {validateAiResponseShape} from "../ai/schema";
import {auditLogger} from "../audit/audit.logger";

/**
 * Orchestrates prompt → LLM → validation.
 * Logs an audit event when the AI response fails schema validation (FR-BE-08, FR-BE-16).
 */
export async function evaluateCaseWithAi(inputCase: Case): Promise<DecisionDraft> {
	const promptJson = buildEvaluationPrompt(inputCase);

	let raw: unknown;
	try {
		raw = await llmClient.invoke(promptJson);
	} catch (err) {
		// Network / runtime failure – log and fall through to validation with null.
		auditLogger.log({
			id: `audit-${Date.now()}-llm-call-failure`,
			actorType: "SYSTEM",
			action: "AI_LLM_CALL_FAILURE",
			caseId: inputCase.id,
			timestamp: new Date().toISOString(),
			metadata: {
				error: err instanceof Error ? err.message : String(err),
			},
		});
		raw = null;
	}

	const validated = validateAiResponseShape(raw);

	// Detect whether validation returned the fallback (FR-BE-08).
	const isFallback =
		validated.confidence === 0.3 &&
		(validated.fairnessFlags.includes("UNPARSEABLE_MODEL_OUTPUT") || validated.fairnessFlags.includes("AI_ATTEMPTED_IRREVERSIBLE_ACTION"));

	if (isFallback) {
		auditLogger.log({
			id: `audit-${Date.now()}-ai-validation-failure`,
			actorType: "SYSTEM",
			action: "AI_DECISION_VALIDATION_FAILURE",
			caseId: inputCase.id,
			timestamp: new Date().toISOString(),
			metadata: {
				rawResponse: raw,
				fairnessFlags: validated.fairnessFlags,
				note: "AI response failed schema validation; safe fallback applied.",
			},
		});
	}

	return {
		id: `ai-draft-${Date.now()}`,
		caseId: inputCase.id,
		riskLevel: validated.riskLevel,
		recommendedAction: validated.recommendedAction,
		justification: validated.justification,
		confidence: validated.confidence,
		fairnessFlags: validated.fairnessFlags,
		createdAt: new Date().toISOString(),
	};
}
