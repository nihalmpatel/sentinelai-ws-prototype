import {Case} from "../models/case.model";
import {LlmPrompt} from "./llm.provider";
import {mockCustomers} from "../data/mock.users";
import {mockTransactions} from "../data/mock.transactions";
import {LOW_RISK_APPROVAL_THRESHOLD} from "../core/policy.config";

/**
 * System-level instruction sent to every LLM provider.
 * Describes the expected JSON output schema and hard constraints.
 */
const SYSTEM_PROMPT = [
	"You are a compliance risk-assessment engine for a financial institution.",
	"Analyze the provided case data and produce a structured risk decision.",
	"",
	"Respond ONLY with valid JSON matching this exact schema:",
	"{",
	'  "riskLevel": "LOW" | "MEDIUM" | "HIGH",',
	'  "recommendedAction": "NO_ACTION" | "MONITOR" | "TEMP_HOLD" | "ESCALATE",',
	'  "justification": "<clear, human-readable explanation>",',
	'  "confidence": <number between 0.0 and 1.0>,',
	'  "fairnessFlags": ["<optional flag strings>"]',
	"}",
	"",
	"Rules:",
	"- riskLevel must be exactly one of: LOW, MEDIUM, HIGH",
	"- recommendedAction must be exactly one of: NO_ACTION, MONITOR, TEMP_HOLD, ESCALATE",
	"- NEVER recommend irreversible actions (PERMANENT_ACCOUNT_CLOSURE, LAW_ENFORCEMENT_REPORT)",
	"- confidence must be a decimal between 0.0 and 1.0 reflecting certainty",
	"- justification must clearly explain reasoning based on risk signals, transactions, and user profile",
	"- fairnessFlags should note data-quality concerns, potential bias, or missing information",
	"- Output raw JSON only — no markdown fencing, no extra text",
].join("\n");

/**
 * Build a structured prompt for the LLM (FR-BE-05).
 *
 * Returns a {@link LlmPrompt} with a dedicated system prompt and a
 * JSON user-content payload containing:
 *  - user profile (id, name, role)
 *  - recent transactions for the user
 *  - risk signals and composite score
 *  - active policy context (thresholds, irreversible-action rules)
 *  - case metadata + context
 */
export function buildEvaluationPrompt(inputCase: Case): LlmPrompt {
	// ── User profile ──
	const user = mockCustomers.find((u) => u.id === inputCase.userId) ?? {
		id: inputCase.userId,
		name: "Unknown",
		email: "unknown@example.com",
		role: "customer",
		accountType: "Unknown",
		riskTier: "standard" as const,
		kycStatus: "pending" as const,
		country: "US",
		joinedAt: new Date().toISOString(),
	};

	// ── Recent transactions (last 10) ──
	const recentTransactions = mockTransactions
		.filter((t) => t.userId === inputCase.userId)
		.sort((a, b) => b.timestamp.localeCompare(a.timestamp))
		.slice(0, 10)
		.map((t) => ({
			id: t.id,
			amount: t.amount,
			currency: t.currency,
			merchant: t.merchant,
			location: t.location,
			category: t.category,
			timestamp: t.timestamp,
		}));

	// ── Policy context ──
	const policyContext = {
		lowRiskApprovalThreshold: LOW_RISK_APPROVAL_THRESHOLD,
		irreversibleActions: ["PERMANENT_ACCOUNT_CLOSURE", "LAW_ENFORCEMENT_REPORT"],
		irreversibleActionsNote: "AI must NEVER recommend irreversible actions. Only humans may authorise them.",
		allowedActions: ["NO_ACTION", "MONITOR", "TEMP_HOLD", "ESCALATE"],
	};

	const userPayload = {
		case: {
			id: inputCase.id,
			userId: inputCase.userId,
			status: inputCase.status,
			createdAt: inputCase.createdAt,
			updatedAt: inputCase.updatedAt,
			context: inputCase.context ?? {},
		},
		userProfile: {
			id: user.id,
			name: user.name,
			email: user.email,
			role: user.role,
			accountType: user.accountType,
			riskTier: user.riskTier,
			kycStatus: user.kycStatus,
			country: user.country,
			joinedAt: user.joinedAt,
		},
		recentTransactions,
		risk: inputCase.riskProfile ?? null,
		policyContext,
	};

	return {
		systemPrompt: SYSTEM_PROMPT,
		userContent: JSON.stringify(userPayload),
	};
}
