import {Case} from "../models/case.model";
import {mockCustomers} from "../data/mock.users";
import {mockTransactions} from "../data/mock.transactions";
import {LOW_RISK_APPROVAL_THRESHOLD} from "../core/policy.config";

/**
 * Build a structured JSON prompt for the LLM (FR-BE-05).
 *
 * Includes:
 *  - user profile (id, name, role)
 *  - recent transactions for the user
 *  - risk signals and composite score
 *  - active policy context (thresholds, irreversible-action rules)
 *  - case metadata + context
 */
export function buildEvaluationPrompt(inputCase: Case): string {
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

	const payload = {
		systemInstruction:
			"You are a compliance risk-assessment engine. Respond ONLY with valid JSON matching the DecisionDraft schema. Never suggest irreversible actions.",
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

	return JSON.stringify(payload);
}
