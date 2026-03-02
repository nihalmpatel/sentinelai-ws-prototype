# Sentinel — AI-Native Compliance Decision Engine

> **AI drafts regulatory decisions. Humans supervise irreversible actions.**  
> A structured decision system — not a chatbot — with full auditability, guardrails, and human-in-the-loop governance.

---

## The Problem

Compliance teams face a painful trifecta:

- **Manual review overload** — high alert volumes and repetitive, low-value reviews drain analyst time.
- **Inconsistent decisions** — human-only workflows produce variable outcomes with poor traceability.
- **Unsupervised AI risk** — fully automated AI introduces unacceptable risk for irreversible regulatory actions.

## Sentinel's Approach

Sentinel combines **AI decision drafting** with **strict human-in-the-loop guardrails** and **transparent audit trails**. The AI acts as a first-draft operator — computing risk signals, proposing structured decisions, and flagging confidence and fairness concerns — while humans retain authority over all irreversible actions.

```
Transaction → Risk Signals → AI Decision Draft → Human Review → Final Decision
                                    ↓
                              Audit Trail (every step)
```

---

## Architecture

**Monorepo** with two independent packages — no shared libraries, no monorepo tooling complexity.

```
sentinel-ws/
├── backend/      Express + TypeScript API (port 3000)
├── frontend/     Angular 18 standalone SPA (port 4200)
└── docs/         Design documents & architecture specs
```

### Decision Pipeline

```
POST /api/evaluate { userId, amount, ... }
  → caseManager.createCase()            # NEW case in memory
  → computeRiskSignals()                # deterministic rules
  → evaluateCaseWithAi()                # prompt → LLM → schema validation
  → applyGuardrailsToDecision()         # strip irreversible actions from AI output
  → stateMachine.transition(AI_DRAFTED)
  → auditLogger.log()                   # append-only audit event
```

Human review via `POST /api/cases/:id/reviews` triggers further state transitions and audit logging.

### Core Invariants

| Rule                                       | Enforcement                                                                                                             |
| ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| AI **cannot** execute irreversible actions | `guardrails.ts` + `ai/schema.ts` strip `PERMANENT_ACCOUNT_CLOSURE` and `LAW_ENFORCEMENT_REPORT` unless a human confirms |
| State transitions are strict               | `NEW → AI_DRAFTED → UNDER_REVIEW → APPROVED/OVERRIDDEN → CLOSED` — invalid transitions throw                            |
| All state changes emit audit events        | `auditLogger.log()` with actor type (`AI` / `HUMAN` / `SYSTEM`), action, and metadata                                   |
| LLM output is always validated             | `ai/schema.ts` validates shape; invalid responses fall back to safe defaults                                            |

### Tech Stack

| Layer        | Technology                                                              |
| ------------ | ----------------------------------------------------------------------- |
| **Backend**  | Node.js ≥ 18, Express 4, TypeScript 5.6 (strict mode)                   |
| **Frontend** | Angular 18 (standalone components), Tailwind CSS v4                     |
| **AI**       | Pluggable LLM provider — OpenAI, Anthropic, or stub (no API key needed) |
| **Storage**  | In-memory arrays (prototype scope — no database)                        |
| **Auth**     | None (prototype scope)                                                  |

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (comes with Node.js)
- **Angular CLI** (`npm install -g @angular/cli`) — for frontend dev commands

### 1. Clone & Install

```bash
git clone <repository-url>
cd sentinel-ws

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

```bash
# From backend/
cp default.env .env
```

The default configuration uses a **stub LLM provider** (no API key required). To use a real LLM:

```env
# .env
LLM_PROVIDER=openai          # or: anthropic
LLM_API_KEY=sk-your-key-here
LLM_MODEL=gpt-4o             # or: claude-sonnet-4-20250514
```

### 3. Run

```bash
# Terminal 1 — Backend (from backend/)
npm run dev
# → Express API on http://localhost:3000

# Terminal 2 — Frontend (from frontend/)
ng serve
# → Angular dev server on http://localhost:4200
```

---

## Project Structure

### Backend (`backend/src/`)

```
routes/          HTTP layer only — zero business logic
engines/         Intelligence layer
  risk.engine.ts   Deterministic risk signal computation
  ai.engine.ts     AI pipeline orchestrator (prompt → LLM → validate → guardrail)
core/            Governance layer
  case.manager.ts  Central orchestrator — all case lifecycle logic
  state.machine.ts Allowed state transitions (the governance heart)
  guardrails.ts    Strips irreversible actions from AI output
ai/              LLM integration
  prompt.builder.ts  Constructs structured prompts from case context
  schema.ts          Runtime validation of LLM output
  llm.client.ts      Provider-agnostic LLM interface
  providers/         OpenAI, Anthropic, and stub implementations
audit/           Append-only audit event logging
data/            In-memory seed data (users, transactions, historical cases)
models/          TypeScript interfaces (no classes, no enums)
```

### Frontend (`frontend/src/app/`)

```
features/
  dashboard/         Case list overview with risk indicators
  case-view/         Primary UI for reviewing AI decisions & submitting human reviews
  audit-panel/       Per-case audit trail viewer
  override-modal/    Human override form with rationale capture
core/
  models/            TypeScript interfaces mirroring backend shapes
  services/          HttpClient-based API services
shared/              Reusable UI components (risk badge, signal list)
```

---

## API Overview

### Evaluate a Transaction

```http
POST /api/evaluate
Content-Type: application/json

{
  "userId": "user-001",
  "transactionId": 42,
  "amount": 15000,
  "currency": "USD"
}
```

Returns the newly created case with AI-drafted decision, risk signals, and recommended actions.

### List Cases

```http
GET /api/cases
GET /api/cases/:id
```

### Submit Human Review

```http
POST /api/cases/:id/reviews
Content-Type: application/json

{
  "reviewerId": "analyst-jane",
  "decision": "APPROVED",
  "rationale": "Risk signals consistent with legitimate business pattern",
  "confirmedIrreversible": false
}
```

### Get Case Audit Trail

```http
GET /api/cases/:id/audit
```

---

## Design Principles

- **AI as operator, not oracle** — AI produces structured first-draft decisions; it never has the final say on irreversible actions.
- **Governance in code, not policy** — State machine transitions, guardrails, and audit logging are enforced programmatically.
- **Transparency by default** — Every AI draft, human review, and state transition is recorded in an append-only audit log.
- **Safe defaults** — Invalid LLM output falls back to `MEDIUM` risk / `MONITOR` action / confidence `0.3`.
- **Prototype-first** — In-memory storage, no auth, no infrastructure dependencies. Validates the decision model before investing in production plumbing.

---

## Documentation

Detailed design documents are available in the [`docs/`](docs/) folder:

| Document                                                     | Description                                     |
| ------------------------------------------------------------ | ----------------------------------------------- |
| [Product Requirements](docs/product-requirement-document.md) | User stories, features, and acceptance criteria |
| [System Requirements](docs/system-requirements-document.md)  | Technical specs and system constraints          |
| [High-Level Architecture](docs/high-level-architecture.md)   | System diagrams and component breakdown         |
| [Detailed Design](docs/detailed-design.md)                   | Implementation details and data flows           |
| [Project Structure](docs/project-structure.md)               | Folder layout rationale                         |

---

## License

This is a prototype project. No license has been specified.
