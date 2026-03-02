# Sentinel — AI-Native Compliance Decision Engine

## What This Is

An **operational decision system**, not a chatbot. AI drafts regulatory compliance decisions; humans authorize irreversible consequences. This boundary is enforced in code, not just policy.

## Architecture Overview

**Monorepo** with `backend/` (Express + TypeScript) and `frontend/` (Angular 18 standalone). No database — all state is **in-memory mutable arrays** (`backend/src/data/`). No auth. Prototype-scoped.

**Key separation:** `engines/` = intelligence (risk scoring + AI), `core/` = governance (state machine, guardrails, case lifecycle). Routes (`routes/`) contain zero business logic.

### Decision Pipeline (data flow)

```
POST /api/evaluate { userId, amount, ... }
  → caseManager.createCase()          # status=NEW, pushed to mockCases[]
  → computeRiskSignals()              # deterministic rules in risk.engine.ts
  → evaluateCaseWithAi()              # prompt.builder → llm.client (stub) → schema validation
  → applyGuardrailsToDecision()       # strips irreversible keys from AI output
  → stateMachine.transition(AI_DRAFTED)
  → auditLogger.log()                 # append-only, every step
```

Human review via `POST /api/cases/:id/reviews` triggers further state transitions and audit logging.

## Critical Invariants — Do NOT Break

1. **AI cannot execute irreversible actions.** `PERMANENT_ACCOUNT_CLOSURE` and `LAW_ENFORCEMENT_REPORT` require human `confirmedIrreversible=true`. Guardrails in `core/guardrails.ts` and `ai/schema.ts` enforce this.
2. **State machine transitions are strict.** `NEW → AI_DRAFTED → UNDER_REVIEW → APPROVED/OVERRIDDEN → CLOSED`. Invalid transitions throw. See `core/state.machine.ts`.
3. **All state changes must emit audit events** via `auditLogger.log()` with actor type (`AI`/`HUMAN`/`SYSTEM`), action, and metadata.
4. **LLM output is always validated.** `ai/schema.ts` runtime-validates shape; invalid responses fall back to safe defaults (`MEDIUM`/`MONITOR`/confidence 0.3).

## Code Conventions

### Backend (`backend/`)

- **Express 4 + TypeScript 5.6**, strict mode, ES2020/CommonJS. Dev: `ts-node-dev --respawn --transpile-only`
- **Models are interfaces only** — no classes, no TS `enum`. Use string literal unions: `'LOW' | 'MEDIUM' | 'HIGH'`
- **Singletons at module level:** `export const caseManager = new CaseManager()`. Always export both the class and a pre-instantiated singleton.
- **IDs:** `number` for cases/transactions, `string` (e.g., `draft-${Date.now()}`) for drafts/reviews/audit entries. Timestamps are ISO-8601 strings.
- **Error handling:** Routes catch business errors and return 400/500 JSON. Business logic throws plain `Error`. No custom error classes.
- **No validation libraries.** Manual type-checks in routes; `ai/schema.ts` does runtime type-guarding of LLM output.
- **File naming:** `kebab.dot.case.ts` (e.g., `risk.engine.ts`, `case.model.ts`)

### Frontend (`frontend/`)

- **Angular 18 standalone components** — no `NgModule`. Bootstrap via `bootstrapApplication()`.
- **Selector prefix:** `sentinel-` for all feature/shared components, `app-` for root only.
- **100% Tailwind CSS v4** — zero component-level SCSS. Dark theme with slate/emerald/amber/rose/indigo palette.
- **No Angular signals, no NgRx.** State is class properties, refreshed imperatively after mutations.
- **Classic template syntax** — `*ngIf`, `*ngFor`, `ngClass`, `CommonModule` everywhere (not `@if`/`@for` control flow).
- **Services** return raw `Observable<T>` from `HttpClient` — no error handling/retry/caching at service level.
- **Models** in `core/models/` mirror backend shapes exactly. Some DTOs are co-located in `compliance.service.ts`.

## Dev Workflow

```bash
# Backend (from backend/)
npm run dev          # ts-node-dev on port 3000

# Frontend (from frontend/)
ng serve             # dev server on port 4200
```

Both share `environment.apiUrl = 'http://localhost:3000/api'`. The `LOW_RISK_APPROVAL_THRESHOLD` (default 0.5) is configured in both `backend/.env` and `frontend/src/environments/`.

## Key Files to Understand First

| File                                   | Why                                                                |
| -------------------------------------- | ------------------------------------------------------------------ |
| `backend/src/core/case.manager.ts`     | Central orchestrator (~314 lines) — all case lifecycle logic       |
| `backend/src/core/state.machine.ts`    | Allowed state transitions (the governance heart)                   |
| `backend/src/ai/schema.ts`             | LLM output validation + irreversible action guardrail              |
| `backend/src/engines/ai.engine.ts`     | AI pipeline orchestrator (prompt → LLM → validate → guardrail)     |
| `backend/src/data/historical.cases.ts` | Seed data (~485 lines) — shows all model shapes in practice        |
| `frontend/src/app/features/case-view/` | Primary UI for reviewing AI decisions and submitting human reviews |

## Aspirational Conventions (Not Yet Implemented)

These are target conventions from project planning. When adding **new** code, prefer these over the legacy patterns:

- **Angular Signals** — use `signal()`, `computed()`, `input()`, `output()` for new component state instead of class properties. Existing components still use class properties + imperative refresh.
- **Zod for AI output validation** — `ai/schema.ts` currently uses manual type-guards. New AI schema validation should use Zod (`z.object()` / `z.safeParse()`).
- **`@if`/`@for` control flow** — prefer Angular built-in control flow over `*ngIf`/`*ngFor` with `CommonModule` in new components.

## What NOT To Do

- Do not add NgRx, Prisma, databases, Kafka, auth, or middleware stacks
- Do not convert AI integration into a conversational/chatbot pattern
- Do not use TypeScript `enum` — use string literal unions
- Do not add ML models to the risk engine — keep signals deterministic
- Do not skip audit logging for any state-changing operation
- Do not allow AI to execute irreversible actions under any code path
