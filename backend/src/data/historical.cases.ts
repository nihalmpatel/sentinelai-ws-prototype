import { Case } from "../models/case.model";

export const mockCases: Case[] = [
  {
    id: 1,
    userId: 1,
    status: "evaluated",
    createdAt: new Date().toISOString(),
    context: {
      source: "prototype",
      note: "Seed case for UI demo"
    },
    riskProfile: {
      caseId: 1,
      score: 0.3,
      signals: [
        {
          id: "seed_low_risk",
          label: "Demo seed case with low composite risk",
          weight: 0.3
        }
      ]
    },
    latestDecision: {
      id: "seed-decision-1",
      caseId: 1,
      outcome: "review",
      rationale: "Seed AI draft for demo case; human should review before acting.",
      createdAt: new Date().toISOString()
    }
  },
  {
    id: 2,
    userId: 2,
    status: "new",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString(),
    context: {
      source: "prototype",
      note: "Freshly created case; not yet evaluated"
    }
  },
  {
    id: 3,
    userId: 3,
    status: "evaluating",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString(),
    context: {
      source: "prototype",
      note: "In-flight evaluation (signals/decision not persisted yet)"
    }
  },
  {
    id: 4,
    userId: 1,
    status: "evaluated",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
    context: {
      source: "prototype",
      note: "Very low risk; stable behavior"
    },
    riskProfile: {
      caseId: 4,
      score: 0.05,
      signals: [
        {
          id: "baseline_consistent_activity",
          label: "Transaction amounts consistent with user baseline",
          weight: 0.15
        }
      ]
    },
    latestDecision: {
      id: "decision-4-approve",
      caseId: 4,
      outcome: "approve",
      rationale: "Risk signals are minimal and consistent with historical behavior. Approve with routine monitoring.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 4).toISOString()
    }
  },
  {
    id: 5,
    userId: 4,
    status: "evaluated",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString(),
    context: {
      source: "prototype",
      note: "Borderline low/medium; single weak anomaly"
    },
    riskProfile: {
      caseId: 5,
      score: 0.29,
      signals: [
        {
          id: "amount_zscore_minor",
          label: "Minor amount deviation (low z-score)",
          weight: 0.25
        }
      ]
    },
    latestDecision: {
      id: "decision-5-review",
      caseId: 5,
      outcome: "review",
      rationale: "A small deviation is present; recommend lightweight review to confirm legitimacy before taking any action.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6 + 1000 * 60 * 9).toISOString()
    }
  },
  {
    id: 6,
    userId: 5,
    status: "evaluated",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
    context: {
      source: "prototype",
      note: "Medium risk; velocity anomaly + mild geo change"
    },
    riskProfile: {
      caseId: 6,
      score: 0.51,
      signals: [
        {
          id: "velocity_spike",
          label: "Velocity anomaly: increased transaction frequency in short window",
          weight: 0.6
        },
        {
          id: "geo_anomaly_low_conf",
          label: "Geo anomaly: uncommon location observed (low confidence)",
          weight: 0.35
        }
      ]
    },
    latestDecision: {
      id: "decision-6-review",
      caseId: 6,
      outcome: "review",
      rationale: "Velocity spike warrants review; geo change is suggestive but not definitive. Recommend human validation and continued monitoring.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 15).toISOString()
    }
  },
  {
    id: 7,
    userId: 6,
    status: "evaluated",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    context: {
      source: "prototype",
      note: "Conflicting signals; medium score but mixed evidence"
    },
    riskProfile: {
      caseId: 7,
      score: 0.49,
      signals: [
        {
          id: "amount_zscore_high",
          label: "Amount anomaly: unusually large transfer relative to baseline",
          weight: 0.75
        },
        {
          id: "known_merchant_whitelist",
          label: "Counter-signal: known merchant / previously seen beneficiary",
          weight: 0.35
        }
      ]
    },
    latestDecision: {
      id: "decision-7-review",
      caseId: 7,
      outcome: "review",
      rationale: "Large amount deviation increases risk, but a known counterparty reduces concern. Recommend review to reconcile conflicting indicators.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4 + 1000 * 60 * 22).toISOString()
    }
  },
  {
    id: 8,
    userId: 7,
    status: "evaluated",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
    context: {
      source: "prototype",
      note: "High risk; structuring pattern across multiple transfers"
    },
    riskProfile: {
      caseId: 8,
      score: 0.82,
      signals: [
        {
          id: "structuring_detected",
          label: "Structuring detected: multiple transactions clustered near reporting threshold",
          weight: 0.9
        },
        {
          id: "velocity_spike_high",
          label: "Velocity anomaly: rapid series of similar-sized transactions",
          weight: 0.75
        }
      ]
    },
    latestDecision: {
      id: "decision-8-decline",
      caseId: 8,
      outcome: "decline",
      rationale: "Structuring behavior and velocity patterns strongly indicate elevated compliance risk. Decline and escalate for follow-up review.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 31).toISOString()
    }
  },
  {
    id: 9,
    userId: 8,
    status: "evaluated",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    context: {
      source: "prototype",
      note: "Extreme risk; multiple strong anomalies"
    },
    riskProfile: {
      caseId: 9,
      score: 0.95,
      signals: [
        {
          id: "geo_anomaly_high_conf",
          label: "Geo anomaly: high-confidence mismatch with typical user locations",
          weight: 0.85
        },
        {
          id: "amount_zscore_extreme",
          label: "Amount anomaly: extreme deviation from baseline",
          weight: 0.95
        },
        {
          id: "velocity_burst",
          label: "Velocity burst: many transactions in minutes",
          weight: 0.9
        }
      ]
    },
    latestDecision: {
      id: "decision-9-decline",
      caseId: 9,
      outcome: "decline",
      rationale: "Multiple high-severity signals (geo, amount, velocity) indicate a likely anomalous event. Decline and recommend immediate review/escalation.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2 + 1000 * 60 * 44).toISOString()
    }
  },
  {
    id: 10,
    userId: 9,
    status: "overridden",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    context: {
      source: "prototype",
      note: "Override scenario: AI suggested decline; human approved with documented rationale"
    },
    riskProfile: {
      caseId: 10,
      score: 0.72,
      signals: [
        {
          id: "velocity_spike",
          label: "Velocity anomaly: unusual burst of activity",
          weight: 0.7
        },
        {
          id: "geo_anomaly_med",
          label: "Geo anomaly: location not in typical set",
          weight: 0.55
        }
      ]
    },
    latestDecision: {
      id: "decision-10-override-approve",
      caseId: 10,
      outcome: "approve",
      rationale: "Human override: verified user travel + merchant verification. Approve with enhanced monitoring despite elevated aggregate risk.",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 1000 * 60 * 58).toISOString()
    }
  }
];

