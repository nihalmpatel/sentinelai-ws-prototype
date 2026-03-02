import {RiskProfile, RiskSignal} from "../models/risk.model";
import {Case} from "../models/case.model";
import {mockTransactions} from "../data/mock.transactions";

/**
 * In-memory per-user baseline stats for FR-BE-02.
 * Tracks running averages so risk signals can compare current behavior
 * against a user's known baseline.
 */
interface UserBaseline {
	txCount: number;
	avgAmount: number;
	lastLocation: string | null;
	lastTimestamp: string | null;
}

const userBaselines = new Map<number, UserBaseline>();

/** Retrieve or initialise the baseline for a user (FR-BE-02). */
function getOrCreateBaseline(userId: number): UserBaseline {
	if (!userBaselines.has(userId)) {
		// Bootstrap from mock transactions when no runtime history exists.
		const history = mockTransactions.filter((t) => t.userId === userId);
		const avg = history.length > 0 ? history.reduce((s, t) => s + t.amount, 0) / history.length : 0;
		userBaselines.set(userId, {
			txCount: history.length,
			avgAmount: avg,
			lastLocation: null,
			lastTimestamp: null,
		});
	}
	return userBaselines.get(userId)!;
}

/** Update baseline after an evaluation so future checks have richer data (FR-BE-02). */
function updateBaseline(baseline: UserBaseline, amount: number, location: string | null, timestamp: string | null): void {
	const total = baseline.avgAmount * baseline.txCount + amount;
	baseline.txCount += 1;
	baseline.avgAmount = total / baseline.txCount;
	if (location) baseline.lastLocation = location;
	if (timestamp) baseline.lastTimestamp = timestamp;
}

// ──────────────────────────────────────────────
// Individual signal detectors (FR-BE-01)
// ──────────────────────────────────────────────

/** Amount spike relative to baseline (replaces the old static threshold). */
function detectAmountSpike(amount: number, baseline: UserBaseline): RiskSignal | null {
	if (amount >= 10000) {
		return {
			id: "very_high_amount",
			label: "Transaction amount ≥ $10 000 — well above any baseline",
			weight: 0.9,
		};
	}
	if (baseline.avgAmount > 0 && amount >= baseline.avgAmount * 3) {
		return {
			id: "amount_spike",
			label: `Transaction amount ($${amount}) ≥ 3× user average ($${baseline.avgAmount.toFixed(0)})`,
			weight: 0.7,
		};
	}
	if (amount >= 5000) {
		return {
			id: "high_amount",
			label: "High transaction amount vs baseline",
			weight: 0.8,
		};
	}
	if (amount >= 1000) {
		return {
			id: "moderate_amount",
			label: "Moderate transaction amount vs baseline",
			weight: 0.4,
		};
	}
	return null;
}

/** Geo-velocity anomaly: location changed impossibly quickly (FR-BE-01). */
function detectGeoVelocityAnomaly(location: string | null, timestamp: string | null, baseline: UserBaseline): RiskSignal | null {
	if (!location || !timestamp || !baseline.lastLocation || !baseline.lastTimestamp) {
		return null;
	}
	if (location === baseline.lastLocation) return null;

	const gap = new Date(timestamp).getTime() - new Date(baseline.lastTimestamp).getTime();
	const oneHourMs = 60 * 60 * 1000;

	if (gap >= 0 && gap < oneHourMs) {
		return {
			id: "geo_velocity_anomaly",
			label: `Location changed from "${baseline.lastLocation}" to "${location}" within ${Math.round(gap / 60000)} min`,
			weight: 0.75,
		};
	}
	return null;
}

/**
 * Rapid-withdrawal-after-deposit pattern: if recent transactions include a
 * large credit followed quickly by a debit of similar size (FR-BE-01).
 */
function detectRapidWithdrawalAfterDeposit(userId: number): RiskSignal | null {
	const history = mockTransactions.filter((t) => t.userId === userId).sort((a, b) => a.timestamp.localeCompare(b.timestamp));

	if (history.length < 2) return null;

	const oneHourMs = 60 * 60 * 1000;

	for (let i = history.length - 2; i >= 0 && i >= history.length - 6; i--) {
		const deposit = history[i];
		const withdrawal = history[i + 1];
		if (deposit.amount > 0 && withdrawal.amount > 0) {
			const gap = new Date(withdrawal.timestamp).getTime() - new Date(deposit.timestamp).getTime();
			if (gap >= 0 && gap < oneHourMs && withdrawal.amount >= deposit.amount * 0.8) {
				return {
					id: "rapid_withdrawal_after_deposit",
					label: `Large deposit ($${deposit.amount}) followed by rapid withdrawal ($${withdrawal.amount}) within ${Math.round(gap / 60000)} min`,
					weight: 0.65,
				};
			}
		}
	}
	return null;
}

/**
 * Structuring detection: multiple transactions just below a reporting threshold
 * within a short window (FR-BE-01). Threshold is $10 000 (CTR).
 */
function detectStructuring(userId: number): RiskSignal | null {
	const reportingThreshold = 10000;
	const windowMs = 24 * 60 * 60 * 1000; // 24 hours
	const now = Date.now();

	const recent = mockTransactions.filter(
		(t) =>
			t.userId === userId &&
			now - new Date(t.timestamp).getTime() < windowMs &&
			t.amount >= reportingThreshold * 0.5 &&
			t.amount < reportingThreshold,
	);

	if (recent.length >= 3) {
		const total = recent.reduce((s, t) => s + t.amount, 0);
		return {
			id: "structuring_pattern",
			label: `${recent.length} transactions totalling $${total.toFixed(0)} just below $${reportingThreshold} reporting threshold within 24 h`,
			weight: 0.85,
		};
	}
	return null;
}

// ──────────────────────────────────────────────
// Main entry point
// ──────────────────────────────────────────────

/**
 * Deterministic risk-signal computation (FR-BE-01 … FR-BE-03).
 * Computes individual signals → composite score clamped to [0, 1].
 */
export function computeRiskSignals(inputCase: Case): RiskProfile {
	const context = inputCase.context ?? {};
	const amount = typeof context["amount"] === "number" ? (context["amount"] as number) : 0;
	const location = typeof context["location"] === "string" ? (context["location"] as string) : null;
	const timestamp = typeof context["timestamp"] === "string" ? (context["timestamp"] as string) : null;

	const baseline = getOrCreateBaseline(inputCase.userId);

	const signals: RiskSignal[] = [];

	// 1. Amount spike / absolute thresholds
	const amountSignal = detectAmountSpike(amount, baseline);
	if (amountSignal) signals.push(amountSignal);

	// 2. Geo-velocity anomaly
	const geoSignal = detectGeoVelocityAnomaly(location, timestamp, baseline);
	if (geoSignal) signals.push(geoSignal);

	// 3. Rapid withdrawal after deposit
	const withdrawalSignal = detectRapidWithdrawalAfterDeposit(inputCase.userId);
	if (withdrawalSignal) signals.push(withdrawalSignal);

	// 4. Structuring pattern
	const structuringSignal = detectStructuring(inputCase.userId);
	if (structuringSignal) signals.push(structuringSignal);

	// Update baseline for future evaluations (FR-BE-02).
	updateBaseline(baseline, amount, location, timestamp);

	// Composite score: sum of weights, clamped to [0, 1] (FR-BE-03).
	const rawScore = signals.reduce((sum, s) => sum + s.weight, 0);
	const score = Math.max(0, Math.min(1, rawScore));

	return {
		caseId: inputCase.id,
		score,
		signals,
	};
}
