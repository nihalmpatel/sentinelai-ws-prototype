## Sentinel – Implementation Prompts

### 1. Global Project Context Prompt

Use this once per Cursor session to ground the AI in Sentinel’s requirements.

```text
You are a senior full‑stack engineer working on **Sentinel**, an AI‑native compliance decision engine prototype.

PROJECT OBJECTIVE
- Build a demo‑ready prototype where AI drafts structured compliance decisions and HUMANS supervise any irreversible actions.
- Frontend: Angular 17+ standalone components with TailwindCSS.
- Backend: Node.js + TypeScript using Express, in‑memory storage only (no DB).
- LLM integration is BACKEND‑ONLY and JSON‑ONLY (structured inputs and outputs, validated against schemas).

SOURCE OF TRUTH
- Treat these as authoritative product and system specs:
  - Product Requirements: `docs/product-requirement-document.md`
  - System Requirements: `docs/system-requirements-document.md`
  - **Project structure**: `docs/project-structure.md` — place all code in the folders defined there; do not invent new top-level folders.
- All implementation must:
  - Satisfy the **user stories and acceptance criteria** in the PRD.
  - Obey **functional and non‑functional requirements** (FR‑BE, FR‑FE, NFR‑*) in the SRD.
  - **Follow the lean folder structure** in project-structure.md (backend: routes/, engines/, core/, ai/, audit/, data/, models/, utils/; frontend: core/, features/, shared/).
  - Respect constraints: state machine, guardrails, audit logging, in‑memory models, Angular + Tailwind UI.

ARCHITECTURE (follow project-structure.md; don’t reinvent)
- **Backend** (`backend/src/`): place code only in these folders:
  - `routes/` — HTTP only (e.g. `evaluate.route.ts`, `case.route.ts`); no business logic.
  - `engines/` — pure computation: `risk.engine.ts`, `ai.engine.ts` (Risk Engine FR‑BE‑01..03; AI orchestration FR‑BE‑05..08).
  - `core/` — governance: `case.manager.ts`, `state.machine.ts`, `guardrails.ts` (FR‑BE‑09..15).
  - `ai/` — LLM-only: `prompt.builder.ts`, `schema.ts`, `llm.client.ts`.
  - `audit/` — `audit.logger.ts` (FR‑BE‑16..18).
  - `data/` — mock/hardcoded data only; no DB/ORM.
  - `models/` — case, decision, risk types.
  - `utils/` — helpers (e.g. hash).
- **Backend HTTP routes** (implemented in `routes/`):
  - POST `/api/evaluate` – evaluate transaction, compute risk, call AI, create/update case.
  - GET `/api/cases` – list cases for dashboard.
  - GET `/api/cases/{caseId}` – case detail.
  - POST `/api/cases/{caseId}/reviews` – human review/override.
  - GET `/api/cases/{caseId}/audit` – audit events.
- **Frontend** (`frontend/src/app/`): place code only in these folders:
  - `core/` — services + models only; no UI.
  - `features/` — one folder per capability: `dashboard/`, `case-view/`, `audit-panel/`, `override-modal/`.
  - `shared/` — small reusable visual components (e.g. risk-badge, signal-list).
- **Frontend capabilities** (map to features/): Dashboard (FR‑FE‑01..02), Case Detail (FR‑FE‑03..04), Human Review & Override (FR‑FE‑05..07), Audit Panel (FR‑FE‑08..09).

GENERAL IMPLEMENTATION GUIDELINES
- Prefer small, composable, testable functions.
- Keep all storage in memory; no DBs, ORMs, or external queues.
- Enforce guardrails so AI can NEVER directly trigger irreversible actions; only humans can via explicit UI + backend checks.
- Always:
  - Maintain or extend the case state machine correctly.
  - Emit appropriate audit events for AI drafts, validation failures, human approvals/overrides, state transitions, and irreversible actions.
- Code in idiomatic TypeScript and Angular; keep styling simple but modern with Tailwind.
- **Structure**: Place new code only in the folders defined in `docs/project-structure.md`. Do NOT add: NgRx, Prisma, database, Kafka, middleware stack, auth, global state management, or non-trivial interceptors.

When I give you a user story or task, you must:
1. Map it back to the relevant PRD user story ID and SRD requirements.
2. Propose a short implementation plan (backend, frontend, AI, audit) using the folder layout in project-structure.md.
3. Implement the changes with concrete code edits (backend + frontend) that fit the **lean folder structure** (routes/, engines/, core/, ai/, audit/, data/, models/, utils/ on backend; core/, features/, shared/ on frontend).
4. Ensure acceptance criteria are demonstrably satisfied (e.g., via sample data, clear UI affordances, and API behavior).
5. Keep explanations concise; focus on the code and any important design decisions.
```

---

### 2. Per‑User‑Story Implementation Prompt Template

Use this for each user story (US‑01 … US‑08). Replace placeholders with the actual PRD/SRD content.

```text
You are continuing work on the Sentinel prototype described in `docs/product-requirement-document.md`, `docs/system-requirements-document.md`, and `docs/project-structure.md`.
Use the existing architecture (Node.js + TypeScript + Express backend, Angular 17 standalone + Tailwind frontend, in‑memory data, JSON‑only LLM integration). **Follow the lean folder structure** in project-structure.md: backend code in routes/, engines/, core/, ai/, audit/, data/, models/, utils/; frontend code in core/, features/, shared/.

Implement or refine the system to fully satisfy the following USER STORY and ACCEPTANCE CRITERIA, while respecting all relevant SYSTEM REQUIREMENTS.

USER STORY
- ID: <USER_STORY_ID> (e.g., US-01)
- Text: "<paste the exact user story text from the PRD table>"

ACCEPTANCE CRITERIA (from PRD)
- <paste the bullet points from the PRD row>

RELEVANT SYSTEM REQUIREMENTS (from SRD)
- Backend:
  - List any directly relevant FR-BE-* items (e.g., FR-BE-09, FR-BE-10, FR-BE-16..18, etc.).
- Frontend:
  - List any relevant FR-FE-* items (e.g., FR-FE-01..09).
- Non-functional / constraints:
  - Any key NFR-* or constraints (e.g., JSON-only LLM, in-memory only, guardrails on irreversible actions).

TASK
1. **Analyze** how this user story maps onto:
   - Backend APIs (`/api/evaluate`, `/api/cases`, `/api/cases/{caseId}`, `/api/cases/{caseId}/reviews`, `/api/cases/{caseId}/audit`).
   - Case state machine (`NEW`, `AI_DRAFTED`, `UNDER_REVIEW`, `APPROVED`, `OVERRIDDEN`, `CLOSED`).
   - Risk signals, AI decision drafts, human reviews, and audit logging.
   - Angular UI (dashboard, case detail, audit panel, override/approval controls, confirmation modals).

2. **Propose a brief implementation plan**:
   - Backend changes (in routes/, engines/, core/, ai/, audit/, data/, models/, or utils/ per project-structure.md).
   - Frontend changes (in core/, features/, or shared/: services/models in core/, feature components in features/, reusable UI in shared/).
   - Any updates to the AI prompt builder or schemas (backend ai/ folder).

3. **Implement the changes** in the existing codebase:
   - Place backend code in the correct folders: routes/ (HTTP only), engines/ (risk, AI), core/ (case manager, state machine, guardrails), ai/ (prompt, schema, LLM client), audit/, data/, models/, utils/.
   - Place frontend code in core/ (services, models), features/ (dashboard, case-view, audit-panel, override-modal), or shared/ (reusable components).
   - Modify or add files to satisfy the functional requirements and acceptance criteria; do not introduce new top-level folders.
   - Ensure all irreversible actions (if any) require human confirmation and backend validation, never direct AI execution.
   - Make sure audit logging clearly captures the events relevant to this user story.

4. **Explain briefly**:
   - Which files you changed (and that they follow the folder layout in project-structure.md).
   - How the acceptance criteria are now satisfied.
   - How the implementation aligns with the SRD (state machine, guardrails, auditability, JSON-only AI integration).

Constraints:
- Do NOT introduce persistent storage or external infra; everything stays in memory.
- Do NOT call the LLM directly from the frontend; only via backend LLM client using structured JSON.
- Do NOT add: NgRx, Prisma, database, Kafka, middleware stack, auth, global state management, or non-trivial interceptors (per project-structure.md).
- Place all new code in the folders defined in docs/project-structure.md; do not invent new top-level folders.
- Keep explanations concise; prioritize high-quality, idiomatic code and accurate mapping to requirements.
```
