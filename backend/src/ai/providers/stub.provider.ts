import {LlmPrompt, LlmProvider} from "../llm.provider";

/**
 * Deterministic stub that derives its response from the structured prompt
 * payload so the demo looks realistic without an external LLM (FR-BE-06).
 *
 * Used as the default provider when LLM_PROVIDER is not set.
 */

interface ParsedPayload {
	case?: {context?: Record<string, unknown>};
	risk?: {score?: number; signals?: {id: string; label: string; weight: number}[]} | null;
	recentTransactions?: {amount: number}[];
	[key: string]: unknown;
}

export class StubProvider implements LlmProvider {
	readonly name = "stub";

	async invoke(prompt: LlmPrompt): Promise<unknown> {
		let payload: ParsedPayload = {};
		try {
			payload = JSON.parse(prompt.userContent) as ParsedPayload;
		} catch {
			// Fall through to default response.
		}

		const score = payload.risk?.score ?? 0;
		const signals = payload.risk?.signals ?? [];
		const amount = typeof payload.case?.context?.["amount"] === "number" ? (payload.case.context["amount"] as number) : 0;

		// ── Derive risk level ──
		let riskLevel: "LOW" | "MEDIUM" | "HIGH";
		if (score >= 0.7) riskLevel = "HIGH";
		else if (score >= 0.35) riskLevel = "MEDIUM";
		else riskLevel = "LOW";

		// ── Derive recommended action ──
		let recommendedAction: "NO_ACTION" | "MONITOR" | "TEMP_HOLD" | "ESCALATE";
		if (score >= 0.8) recommendedAction = "ESCALATE";
		else if (score >= 0.6) recommendedAction = "TEMP_HOLD";
		else if (score >= 0.3) recommendedAction = "MONITOR";
		else recommendedAction = "NO_ACTION";

		// ── Build justification from signals ──
		const signalSummary = signals.length > 0 ? signals.map((s) => s.label).join("; ") : "No notable risk signals detected";

		const justification =
			`AI analysis of transaction ($${amount.toLocaleString()}): ${signalSummary}. ` +
			`Composite risk score ${score.toFixed(2)} → recommending ${recommendedAction}.`;

		// ── Confidence: higher when we have more signals to base the decision on ──
		const baseConfidence = signals.length > 0 ? 0.6 : 0.45;
		const signalBoost = Math.min(signals.length * 0.08, 0.3);
		const confidence = Math.round((baseConfidence + signalBoost) * 100) / 100;

		// ── Fairness flags ──
		const fairnessFlags: string[] = [];
		if (signals.length === 0) {
			fairnessFlags.push("NO_SIGNALS_AVAILABLE");
		}

		return {
			riskLevel,
			recommendedAction,
			justification,
			confidence,
			fairnessFlags,
		};
	}
}
