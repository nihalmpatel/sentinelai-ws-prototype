## 1. Introduction

### 1.1 Purpose

The purpose of this System Requirements Document (SRD) is to define the functional and non-functional requirements for **Sentinel**, an AI-native compliance decision engine prototype. Sentinel’s primary goal is to have AI draft structured regulatory decisions from transaction and risk data, while ensuring that **humans supervise and approve any irreversible actions**.

### 1.2 Scope

- **In-scope (prototype):**
  - End-to-end flow from simulated transaction ingestion through:
    - Risk signal detection
    - AI decision drafting
    - Human review and override
    - Audit logging of all key actions
  - Backend services for risk evaluation, AI orchestration, case lifecycle, and audit logging.
  - Angular-based frontend for:
    - Reviewing AI-generated decisions
    - Inspecting supporting signals and historical context
    - Approving or overriding proposed actions.
  - In-memory data storage (mock users, transactions, historical cases) sufficient for demos and experimentation.

- **Out-of-scope (prototype):**
  - Production-grade integrations (no real Kafka, no real database, no real auth/SSO).
  - Full regulatory coverage and legal sign-off.
  - Multi-tenant capabilities and cross-organization deployments.
  - Performance hardening and HA/DR design beyond what is needed for a single-node prototype.

---

## 2. System Overview

### 2.1 Architecture Diagram Description

Conceptual data and control flow:

1. **Transaction Stream (Simulated Source)**  
   - Generates or replays transactions for one or more users.
   - Feeds transaction events into the backend over a simple HTTP API or internal generator.

2. **Risk Detection Layer**  
   - Computes deterministic and statistical signals (e.g., transaction spikes, geo-velocity anomalies).
   - Produces a structured set of risk signals and an aggregate risk score for each transaction or batch.

3. **AI Decision Engine**  
   - Receives user context, recent transactions, detected signals, and policy context in structured JSON.
   - Calls an LLM (OpenAI/Claude/local) via an adapter to produce a **structured decision draft** (risk level, recommended action, justification, confidence, fairness flags).
   - Validates AI output against a strict schema before acceptance.

4. **Case Management API**  
   - Wraps AI drafts in a case object (case ID, status, timestamps, involved user/transactions).
   - Persists case state in memory and exposes endpoints for retrieval and updates from the UI.
   - Enforces state transitions and system guardrails (e.g., AI cannot directly perform irreversible actions).

5. **Human Review UI (Angular Frontend)**  
   - Lists active and historical cases.
   - Shows AI-generated narrative, supporting signals, similarities to historical cases, and proposed actions.
   - Allows human reviewers to approve or override decisions, with mandatory rationale for overrides.

6. **Decision Feedback & Audit Logging**  
   - Logs all key actions (AI decision draft creation, human approvals/overrides) in an audit log.
   - Links AI input/outputs and human actions for traceability and later analysis.

### 2.2 Component Breakdown

- **Backend (Node.js + TypeScript, Fastify)**
  - **Routes Layer**
    - `evaluate` route: triggers risk evaluation + AI decision draft for a transaction.
    - `case` routes: CRUD-style operations for cases (list, get details, update decision, add human review).
  - **Engines**
    - **Risk Engine:** Computes deterministic signals and basic statistical anomalies using in-memory profiles.
    - **AI Engine:** Builds prompts, calls the LLM, validates structured output, and returns a normalized decision draft.
  - **Core**
    - **Case Manager:** Orchestrates creation and lifecycle of cases, ties transactions, AI drafts, and human reviews.
    - **State Machine:** Encodes allowed state transitions (e.g., NEW → AI_DRAFTED → UNDER_REVIEW → APPROVED / OVERRIDDEN).
    - **Guardrails:** Enforces constraints such as: AI cannot directly perform irreversible actions (e.g., permanent account closure).
  - **AI Integration**
    - **LLM Client:** Adapter over external LLM APIs (provider-agnostic).
    - **Prompt Builder:** Assembles structured case context and policy hints for the LLM.
    - **Schema Validation:** Validates AI responses against a strict decision schema.
  - **Audit**
    - **Audit Logger:** Centralized component to record audit events (actor, action, timestamp, references to input/output).
  - **Data (Prototype)**
    - In-memory collections for users, transactions, historical cases, and risk profiles.
    - No external database or ORM; suitable for demos and rapid iteration.

- **Frontend (Angular 17+ Standalone)**
  - **Core**
    - **Services:**
      - `compliance.service`: Communicates with backend evaluate and case APIs.
      - `audit.service`: Fetches and displays relevant audit trails.
    - **Models:** TypeScript interfaces mirroring backend data models (cases, decisions, risk signals).
  - **Feature Modules**
    - **Dashboard:** High-level list of cases, quick view of risk level and status.
    - **Case View:** Detailed view of a single case, showing AI narrative, risk signals, transactions, and recommended action.
    - **Audit Panel:** Timeline of AI and human actions for a selected case.
    - **Override Modal:** UI flow for human reviewers to approve or override AI recommendations.
  - **Shared Components**
    - `risk-badge` for displaying risk levels.
    - `signal-list` for listing risk signals and anomalies.

---

## 3. Functional Requirements

### 3.1 Backend Requirements

#### 3.1.1 Risk Detection Engine

- **FR-BE-01**: The system shall compute deterministic risk signals for each evaluated transaction, including but not limited to:
  - Transaction amount spikes vs. historical baseline.
  - Geo-velocity anomalies (unrealistic location changes).
  - Rapid withdrawal after deposit.
  - Structuring-like patterns (multiple small transactions near thresholds).
- **FR-BE-02**: The system shall maintain in-memory risk profiles per user (e.g., average amount, merchants, geographical patterns) using a simple baseline model.
- **FR-BE-03**: The system shall compute a composite risk score from signals and baseline deviation (e.g., 0–1 float), suitable as input to the AI Decision Engine.
- **FR-BE-04**: The system shall expose an HTTP endpoint to evaluate a single transaction or a small batch and return:
  - Risk signals
  - Risk score
  - Associated case reference (if created or updated).

#### 3.1.2 AI Decision Engine

- **FR-BE-05**: The system shall construct a structured AI input object consisting of:
  - User profile (simplified)
  - Recent relevant transactions
  - Detected risk signals
  - Computed risk score
  - Regulatory or policy context (simplified configuration).
- **FR-BE-06**: The system shall call an external LLM provider via an adapter interface to generate a **decision draft** including:
  - Risk level (LOW, MEDIUM, HIGH)
  - Recommended action (e.g., NO_ACTION, MONITOR, TEMP_HOLD, ESCALATE)
  - Human-readable justification
  - Confidence score (0–1)
  - Fairness or bias-related flags.
- **FR-BE-07**: The system shall validate AI responses against a strict schema and reject non-conforming outputs.
- **FR-BE-08**: On validation failure, the system shall:
  - Return a clear error status to the caller, and
  - Log an audit event indicating AI output failure.

#### 3.1.3 Case Management and State Machine

- **FR-BE-09**: The system shall create or update a **case** when a decision is evaluated, tying together:
  - User
  - One or more transactions
  - AI decision drafts
  - Human reviews.
- **FR-BE-10**: The system shall maintain a state machine for case status, including at minimum:
  - `NEW`, `AI_DRAFTED`, `UNDER_REVIEW`, `APPROVED`, `OVERRIDDEN`, `CLOSED`.
- **FR-BE-11**: The system shall enforce valid state transitions (e.g., cannot move directly from `NEW` to `APPROVED` without `AI_DRAFTED`).
- **FR-BE-12**: The system shall support attaching multiple AI decision drafts and human review events to a single case (versioned history).

#### 3.1.4 Guardrails and Irreversible Actions

- **FR-BE-13**: The system shall **prevent AI from directly triggering irreversible actions**, such as:
  - Permanent account closure
  - Law-enforcement reporting.
- **FR-BE-14**: Any irreversible action must be initiated explicitly by a human reviewer through the UI and confirmed by the backend.
- **FR-BE-15**: The system shall enforce server-side checks to ensure that irreversible actions are only executed from appropriate case states and with required human metadata (e.g., reviewer ID, rationale).

#### 3.1.5 Audit Logging

- **FR-BE-16**: The system shall log the following event types at minimum:
  - AI decision draft creation
  - AI decision validation failure
  - Human review creation (approval/override)
  - Case state transition
  - Attempted irreversible actions (whether allowed or rejected).
- **FR-BE-17**: Each audit entry shall include:
  - Actor type (AI / HUMAN / SYSTEM)
  - Actor identifier (where applicable)
  - Action type and details
  - Timestamp
  - References to affected entities (case ID, transaction ID).
- **FR-BE-18**: Audit events shall be immutable (append-only semantics) for the duration of the prototype runtime.

---

### 3.2 Frontend Requirements (Angular)

#### 3.2.1 Case Dashboard

- **FR-FE-01**: The system shall provide a dashboard listing active and recent cases with:
  - Case ID
  - User ID (or pseudonym)
  - Risk level
  - Current status
  - Time of last activity.
- **FR-FE-02**: The dashboard shall support basic filtering or sorting (e.g., by risk level, status, most recent).

#### 3.2.2 Case Detail View

- **FR-FE-03**: The system shall display for a selected case:
  - AI-generated risk narrative
  - Recommended action and confidence
  - Risk signals and anomalies
  - Involved transactions and key attributes
  - Historical similar cases and their outcomes (from in-memory historical set).
- **FR-FE-04**: The UI shall clearly distinguish AI-generated content (narratives, recommendations) from human-entered content.

#### 3.2.3 Human Review and Overrides

- **FR-FE-05**: The system shall provide a UI control for human reviewers to:
  - Approve AI recommendations, or
  - Override them with an alternative decision.
- **FR-FE-06**: On override, the UI shall require the reviewer to enter a textual rationale before submission.
- **FR-FE-07**: The UI shall prevent the user from submitting irreversible actions without explicit confirmation (e.g., confirmation modal).

#### 3.2.4 Audit Panel

- **FR-FE-08**: The system shall display an audit timeline for each case, showing:
  - Chronological list of AI and human actions
  - Actor type and basic details
  - Summary of the action (e.g., “AI draft generated”, “Human override to MONITOR”).
- **FR-FE-09**: The audit panel shall be read-only to end users.

#### 3.2.5 General UI & UX

- **FR-FE-10**: The UI shall use a simple, modern styling (Tailwind-based) highlighting:
  - Risk levels (color-coded badges)
  - Status indicators
  - Clear separation of sections.
- **FR-FE-11**: The UI shall be optimized for desktop screen sizes and a single reviewer persona; mobile responsiveness is optional for the prototype.

---

### 3.3 API Contracts (High-Level)

_All payloads are logically defined; exact field names and nesting will be finalized during implementation but should align with the data models in Section 5._

- **API-01: Evaluate Transaction**
  - **Method/Path**: POST `/api/evaluate`
  - **Request**: Transaction details (user ID, amount, merchant, location, timestamp, etc.).
  - **Behavior**:
    - Runs risk detection.
    - Invokes AI Decision Engine.
    - Creates/updates a case.
  - **Response**: Case summary including:
    - Case ID
    - Risk signals and score
    - AI decision draft.

- **API-02: List Cases**
  - **Method/Path**: GET `/api/cases`
  - **Response**: Paginated list of cases with basic metadata for dashboard display.

- **API-03: Get Case Detail**
  - **Method/Path**: GET `/api/cases/{caseId}`
  - **Response**:
    - Case core data
    - Associated user and transaction summaries
    - Latest AI decision draft
    - Attached human reviews
    - Relevant audit events.

- **API-04: Submit Human Review**
  - **Method/Path**: POST `/api/cases/{caseId}/reviews`
  - **Request**:
    - Reviewer identifier (simplified for prototype)
    - Decision taken (approve / specific override)
    - Rationale text
    - Optional irreversible action flags.
  - **Behavior**:
    - Validates allowed state transitions.
    - Applies guardrails for irreversible actions.
    - Updates case state and writes audit events.
  - **Response**: Updated case summary.

- **API-05: Get Audit Events for Case**
  - **Method/Path**: GET `/api/cases/{caseId}/audit`
  - **Response**: List of audit events associated with the case.

---

## 4. Non-Functional Requirements

### 4.1 Security

- **NFR-SEC-01**: Prototype shall run in a controlled environment (developer workstation or secured demo environment).
- **NFR-SEC-02**: AI provider API keys and any secrets shall be stored outside of source control (e.g., environment variables).
- **NFR-SEC-03**: Even without full authentication, the system shall separate **AI-only capabilities** from **human-triggered irreversible actions** via backend guardrails.

### 4.2 Auditability and Explainability

- **NFR-AUD-01**: Every AI decision draft and every human review must be traceable via audit events linked to the case.
- **NFR-AUD-02**: The system shall maintain sufficient contextual data to reconstruct “why” a decision was made (signals, narrative, recommended action, reviewer rationale).
- **NFR-AUD-03**: The UI shall present AI rationales and human rationales side by side where relevant.

### 4.3 Reliability and Availability

- **NFR-REL-01**: For the prototype, the system shall operate reliably on a single backend instance; no clustering is required.
- **NFR-REL-02**: Failure of the external LLM provider shall be handled gracefully (clear error message, audit log entry, and no partial irreversible actions).

### 4.4 Performance and Scalability

- **NFR-PERF-01**: For typical prototype loads (single-digit concurrent reviewers, low QPS), end-to-end evaluation latency should be primarily bounded by LLM response time.
- **NFR-PERF-02**: Non-LLM processing (risk signals, case updates, audit logging) should be lightweight enough not to dominate response time.
- **NFR-SCAL-01**: The architecture shall be designed so that:
  - Risk Detection Layer, AI Decision Engine, and Case Management can be separated into services in future iterations.
  - Database and message queue integrations can be introduced without rewriting core business logic.

---

## 5. Data Models

> Note: For this prototype, all data is stored in memory; these models define logical structure, not physical schema.

### 5.1 User

| Field        | Type   | Description                                |
|-------------|--------|--------------------------------------------|
| id          | string | Unique user identifier                     |
| name        | string | Pseudonym or display name                  |
| segment     | string | User segment (e.g., retail, SME)          |
| riskProfile | object | Baseline behavioral statistics and profile |

### 5.2 Transaction

| Field       | Type     | Description                                  |
|------------|----------|----------------------------------------------|
| id         | string   | Unique transaction identifier                |
| userId     | string   | Reference to user                            |
| amount     | number   | Transaction amount                           |
| currency   | string   | Currency code                                |
| merchant   | string   | Merchant or counterparty                     |
| location   | string   | Geographical or channel information          |
| timestamp  | datetime | Time of transaction                          |
| metadata   | object   | Additional attributes used for risk analysis |

### 5.3 Case

| Field          | Type            | Description                                              |
|----------------|-----------------|----------------------------------------------------------|
| id            | string          | Unique case identifier                                   |
| userId        | string          | Related user                                             |
| transactionIds| array\<string\> | One or more transactions involved in this case           |
| status        | enum            | Case status (`NEW`, `AI_DRAFTED`, `UNDER_REVIEW`, etc.) |
| createdAt     | datetime        | Case creation time                                       |
| updatedAt     | datetime        | Time of last update                                      |
| aiDecisions   | array\<object\> | Collection of AI decision drafts                         |
| humanReviews  | array\<object\> | Collection of human review entries                       |

### 5.4 AI Decision Draft

| Field             | Type          | Description                                                              |
|------------------|---------------|--------------------------------------------------------------------------|
| id               | string        | Identifier for this AI draft                                             |
| caseId           | string        | Associated case                                                          |
| riskLevel        | enum          | Risk classification (`LOW`, `MEDIUM`, `HIGH`)                           |
| recommendedAction| enum          | Recommended action (`NO_ACTION`, `MONITOR`, `TEMP_HOLD`, `ESCALATE`, etc.) |
| justification    | string        | Natural-language explanation                                             |
| confidence       | number        | Numeric confidence between 0 and 1                                       |
| fairnessFlags    | array\<string\> | List of fairness/bias-related warnings                                |
| createdAt        | datetime      | Time AI draft was produced                                               |

### 5.5 Human Review

| Field       | Type     | Description                              |
|------------|----------|------------------------------------------|
| id         | string   | Unique human review identifier           |
| caseId     | string   | Associated case                          |
| reviewerId | string   | Identifier for human reviewer (simplified)|
| decision   | enum     | Final human decision or override         |
| rationale  | string   | Text rationale for decision              |
| createdAt  | datetime | Time of submission                       |

### 5.6 Audit Log Entry

| Field     | Type     | Description                                |
|----------|----------|--------------------------------------------|
| id       | string   | Unique audit entry identifier              |
| actorType| enum     | `AI`, `HUMAN`, or `SYSTEM`                  |
| actorId  | string   | Optional identifier for human/system actor |
| action   | string   | Description or code for the action         |
| caseId   | string   | Associated case, if applicable             |
| timestamp| datetime | Time of the event                          |
| metadata | object   | Extra structured context for the event     |

---

## 6. Constraints

### 6.1 Tech Stack Constraints

- **Backend**
  - Node.js with TypeScript.
  - Fastify for HTTP server.
  - No relational database or ORM for the prototype; in-memory collections only.
- **Frontend**
  - Angular 17+ using standalone components.
  - TailwindCSS for styling.
- **AI Layer**
  - External LLM provider (e.g., OpenAI, Claude, or local LLM) accessed via a provider-agnostic adapter.
  - Structured JSON outputs with strict validation.

### 6.2 Prototype Limitations

- No production-grade authentication, authorization, or multi-tenant design.
- No persistent storage; state is lost when the backend process restarts.
- No message queues (e.g., Kafka) or streaming infrastructure; transaction input is simulated.
- Non-functional requirements (latency, throughput, availability) are tuned only for demo-scale usage.
- Compliance policies and regulatory logic are simplified for demonstration and are not exhaustive.

---

## 7. Assumptions & Dependencies

### 7.1 Assumptions

- The prototype is operated by a small number of expert users (compliance analysts) in a controlled environment.
- LLM provider APIs are reachable and reasonably stable during demos.
- Input data (transactions, user profiles, historical cases) is representative enough to exercise risk patterns and decision logic.
- Reviewers will be trained to understand which actions are AI suggestions and which require explicit human confirmation.

### 7.2 External Dependencies

- Availability and correct configuration of:
  - Node.js runtime.
  - Angular tooling (CLI, build pipeline).
  - External LLM API and associated credentials.
- Network connectivity to reach the LLM provider from the backend environment.
- Local environment or container configuration to inject secrets (e.g., API keys) without storing them in source control.

