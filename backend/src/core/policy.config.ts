// Centralized policy configuration for case handling.
// For the prototype, these are simple constants; in a fuller system they could come from config storage.
const rawThreshold = process.env.LOW_RISK_APPROVAL_THRESHOLD;

const parsed = rawThreshold != null ? Number(rawThreshold) : Number.NaN;

/**
 * Threshold in \[0,1] for allowing "Approve AI recommendation" on low-risk cases.
 * Cases with a risk score \<= LOW_RISK_APPROVAL_THRESHOLD are eligible for direct AI approval.
 */
export const LOW_RISK_APPROVAL_THRESHOLD: number =
  Number.isFinite(parsed) && parsed >= 0 && parsed <= 1 ? parsed : 0.5;

