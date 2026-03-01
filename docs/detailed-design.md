# System Architecture (Prototype → Production Evolution)

## 1. High-Level Logical Architecture

```text
[Angular UI]
│
▼
[API Gateway / Backend]
│
├── Risk Signal Engine
├── AI Decision Engine
├── Case Manager
└── Audit Logger
```

### Component Responsibilities

#### Angular Frontend

- Case dashboard
- AI decision display
- Human approval / override
- Audit timeline viewer

#### Backend (Node + TypeScript)

- Risk signal computation
- LLM orchestration
- Schema validation
- Decision persistence
- Guardrail enforcement

## 2. Low-Level Component Design

### A. Risk Signal Engine

**Purpose**

Detect anomaly signals before AI reasoning.

**Interface**

```ts
interface RiskSignal {
  type: string;
  severity: number; // 0–1
  description: string;
}

function evaluateRisk(userId: string): {
  signals: RiskSignal[];
  aggregateRiskScore: number;
}
```

**Internal Logic (deterministic)**

- Z-score deviation on amount
- Geo anomaly
- Velocity anomaly
- Structuring detection

AI reasons on top of signals — not raw data.

### B. AI Decision Engine

This is the cognitive core.

**Responsibilities**

- Accept structured risk input
- Retrieve similar historical cases
- Generate structured decision draft
- Enforce JSON schema
- Return decision

**Input Contract**

```ts
interface AIDecisionInput {
  userProfile: UserProfile;
  recentTransactions: Transaction[];
  signals: RiskSignal[];
  aggregateRiskScore: number;
  similarCases: HistoricalCase[];
}
```

**Output Contract (Zod enforced)**

```ts
interface AIDecision {
  riskLevel: "LOW" | "MEDIUM" | "HIGH";
  recommendedAction:
    | "NO_ACTION"
    | "MONITOR"
    | "TEMP_HOLD"
    | "ESCALATE"
    | "PERMANENT_CLOSE"; // blocked by guardrail
  justification: string;
  confidence: number;
  fairnessFlags: string[];
  requiresHumanAuthorization?: boolean;
}
```

**Guardrail Layer**

Before returning to the UI:

```ts
if (decision.recommendedAction === "PERMANENT_CLOSE") {
  decision.requiresHumanAuthorization = true;
}
```

AI can recommend; the system prevents direct execution of irreversible actions.

### C. Case Manager

Acts as a state machine.

**Case States**

- `NEW`
- `AI_DRAFTED`
- `HUMAN_APPROVED`
- `HUMAN_OVERRIDDEN`
- `ESCALATED`
- `CLOSED`

**State Transition Rules**

- `NEW → AI_DRAFTED` (automatic)
- `AI_DRAFTED → HUMAN_APPROVED`
- `AI_DRAFTED → HUMAN_OVERRIDDEN`
- `HUMAN_APPROVED → CLOSED` (if reversible action)
- `PERMANENT_CLOSE → requires escalation`

This enforces responsibility boundaries at the system level.

### D. Audit Logger

Every event generates an immutable log entry.

```ts
interface AuditLog {
  caseId: string;
  actor: "AI" | "HUMAN";
  action: string;
  timestamp: Date;
  modelVersion?: string;
  inputHash?: string;
}
```

**Why this matters**

- Regulatory defensibility
- Traceability
- Model accountability

## 3. Data Model (Simplified for Prototype)

### Users

```ts
type User = {
  id: string;
  riskProfile: {
    avgTransactionAmount: number;
    stdDeviation: number;
    typicalLocations: string[];
  };
};
```

### Transactions

```ts
type Transaction = {
  id: string;
  userId: string;
  amount: number;
  location: string;
  timestamp: Date;
};
```

### Cases

```ts
type Case = {
  id: string;
  userId: string;
  status: CaseStatus;
  aggregateRiskScore: number;
  aiDecision?: AIDecision;
  humanDecision?: HumanDecision;
};
```

## 4. API Design

Keep it minimal.

### POST `/api/evaluate`

**Request**

```json
{
  "userId": "123"
}
```

**Response**

```json
{
  "caseId": "abc",
  "riskScore": 0.82,
  "signals": [],
  "aiDecision": {}
}
```

### POST `/api/case/:id/approve`

```json
{
  "action": "APPROVE",
  "overrideReason": "..."
}
```

`"action"` is conceptually `"APPROVE" | "OVERRIDE"`.

### GET `/api/case/:id/audit`

Returns event history.

## 5. AI Decision Pipeline (Step-by-Step Execution)

1. User triggers evaluation.
2. Risk Engine computes signals.
3. Retrieve 2 similar historical cases.
4. Construct structured AI input.
5. Call LLM.
6. Validate with Zod.
7. Enforce guardrails.
8. Persist case.
9. Return draft to UI.

Clean, linear, observable.

## 6. Human Boundary (Explicitly Designed)

**AI owns**

- Risk interpretation
- Justification drafting
- Action recommendation

**Human owns**

- Irreversible actions
- Legal escalation
- Override authority
- Bias judgment

This must be enforced by:

- UI constraints
- Backend validation
- State machine transitions

Not just policy text — system-level enforcement.

## 7. Observability & Governance

Even in the prototype, include conceptual metrics:

- Override rate
- False positive rate
- Risk score distribution
- Model confidence variance

**What breaks first at scale?**

- LLM latency
- Distribution shift in fraud patterns
- Bias amplification
- Audit log explosion

You should explicitly mention this in the pitch.

## 8. Scale Evolution Path

Show that you’re thinking long-term.

**Prototype**

- REST
- In-memory storage
- Sync LLM call

**Production**

- Kafka event ingestion
- Async inference queue
- Model versioning
- Shadow deployment
- Bias monitoring dashboard
- Drift detection pipeline
