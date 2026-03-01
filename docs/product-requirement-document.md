## 1. Executive Summary

### 1.1 Objective

- **Primary Objective**: Deliver a demo-ready prototype of **Sentinel**, an AI-native compliance decision engine where **AI drafts regulatory decisions and humans supervise any irreversible actions**, using an Angular frontend, Node.js backend, and in-memory storage only.
- **Prototype Goal**: Validate that AI can reliably draft structured decisions, and that human reviewers can efficiently approve, adjust, or override these drafts with full auditability.

### 1.2 Problem Statement

- **Manual review overload**: Compliance teams are overwhelmed by high alert volumes and repetitive, low-value reviews.
- **Inconsistent decisions**: Human-only workflows often lead to inconsistent outcomes and poor traceability of why a decision was made.
- **Risk of unsupervised AI**: Purely automated AI decisions introduce unacceptable risk for irreversible regulatory actions.
- **Sentinel Response**: Combine AI decision drafting with strict human-in-the-loop guardrails and transparent audit trails, enabling faster yet supervised compliance decisions.

### 1.3 Target Users

- **Primary Persona – Compliance Officer / Analyst**
  - Reviews AI-generated risk assessments and recommendations.
  - Approves or overrides decisions, especially before irreversible actions.
  - Needs clear rationales, signals, and case context.
- **Secondary Persona – Compliance Manager / Lead**
  - Monitors override patterns and decision quality.
  - Uses audit views to assess AI performance and reviewer behavior.
- **Tertiary Persona – Product / Risk Owner (Internal)**
  - Uses prototype to assess viability of AI-assisted decisioning for future production rollout.

---

## 2. Key Features

### 2.1 Risk Evaluation

- **Purpose**: Generate structured risk signals and scores that feed AI decision drafting and human review.
- **Scope (Prototype)**:
  - Compute deterministic risk signals (e.g., spikes, anomalies) for simulated transactions.
  - Maintain in-memory user risk profiles and baselines.
  - Output a composite risk score and explanatory signals for each evaluated case.
- **User Value**:
  - **Compliance officers** see why a transaction or case is considered risky.
  - **Managers** can reason about the consistency and coverage of risk logic used by the AI.

### 2.2 AI Decision Drafting

- **Purpose**: Use an LLM to propose structured compliance decisions from risk signals and context.
- **Scope (Prototype)**:
  - Pass case context to an LLM via a **JSON-only** contract (no free-form prompts from the UI).
  - Produce structured outputs: risk level, recommended action, justification, confidence, fairness flags.
  - Validate and normalize AI responses against a strict JSON schema.
- **User Value**:
  - **Compliance officers** get a first-draft decision and rationale, reducing manual effort.
  - **Managers** can inspect how AI rationales align with internal policy expectations.

### 2.3 Human Override

- **Purpose**: Ensure humans supervise and control all irreversible actions and can correct AI drafts.
- **Scope (Prototype)**:
  - Provide clear controls to approve AI recommendations or override them with an alternative decision.
  - Require rationale for overrides and for any irreversible actions.
  - Ensure irreversible actions can only be triggered by humans, never directly by the AI.
- **User Value**:
  - **Compliance officers** retain final authority over impactful decisions.
  - **Risk owners** gain confidence that AI cannot bypass human sign-off.

### 2.4 Audit Log / Transparency

- **Purpose**: Provide end-to-end traceability of AI and human actions on each case.
- **Scope (Prototype)**:
  - Log AI drafts, human reviews, state transitions, and irreversible actions in an in-memory audit log.
  - Surface an audit trail per case in the UI.
  - Clearly distinguish AI-generated content from human-entered content.
- **User Value**:
  - **Compliance officers** can justify decisions during internal/external reviews.
  - **Managers** can inspect patterns of overrides and AI performance over time.

---

## 3. User Stories

### 3.1 User Story Table

| ID | User Story | Acceptance Criteria |
|----|-----------|---------------------|
| US-01 | As a **compliance officer**, I can see AI-generated risk evaluations and recommended actions for each case so that I can quickly understand where to focus my review. | - Given a new transaction, when it is evaluated, then a case is created with risk signals, a risk score, and an AI decision draft.<br>- The case detail view shows the risk level, recommended action, and key signals.<br>- AI-generated text is visually distinguished from human-entered content. |
| US-02 | As a **compliance officer**, I can override AI decisions so that irreversible actions are supervised. | - On the case view, controls exist to approve or override the AI recommendation.<br>- On override, the system requires an explicit final decision and a textual rationale.<br>- Irreversible actions (e.g., permanent closure) can only be executed when a human explicitly confirms them. |
| US-03 | As a **compliance officer**, I can approve AI recommendations for low-risk cases so that I can process routine work faster. | - For cases below a configurable risk threshold, an “Approve AI recommendation” action is available.<br>- On approval, the case status transitions appropriately and is logged in the audit trail.<br>- The case list reflects the updated status without manual page refresh. |
| US-04 | As a **compliance officer**, I can view a chronological audit trail for each case so that I can reconstruct what happened and why. | - The case detail view includes an audit panel with ordered entries.<br>- Each audit entry shows actor type (AI/HUMAN/SYSTEM), action summary, and timestamp.<br>- Audit events are read-only from the UI. |
| US-05 | As a **compliance manager**, I can see which cases were overridden versus approved so that I can gauge AI performance and reviewer trust. | - The case list shows whether the latest decision was an approval or an override.<br>- The case detail view highlights whether the final outcome matches or diverges from the AI recommendation.<br>- Audit entries capture override events, including rationale. |
| US-06 | As a **compliance officer**, I can inspect the underlying risk signals and recent transactions so that I can justify my final decision. | - The case detail view lists risk signals with short descriptions and severity.<br>- The view includes a concise list of relevant recent transactions for the user.<br>- Signals and transactions are visible before taking an approval/override action. |
| US-07 | As a **compliance manager**, I can simulate multiple example transactions to see how AI behaves so that I can evaluate the prototype. | - A simple way exists (internal or via UI) to trigger evaluation for sample transactions.<br>- Each simulation results in a case with AI draft and audit entries.<br>- The manager can open cases and see AI rationales and human overrides where applied. |
| US-08 | As a **compliance officer**, I am prevented from accidentally triggering irreversible actions without confirmation so that I avoid unintended outcomes. | - Any irreversible action requires a confirmation step (e.g., modal) before submission.<br>- If cancelled, no state change or audit entry for the irreversible action is recorded.<br>- If confirmed, an audit entry is created with reviewer and rationale. |

---

## 4. User Workflows

### 4.1 End-to-End Compliance Review Flow

**Narrative Description**

1. **Transaction Ingestion / Simulation**
   - A simulated transaction is evaluated by the backend.
   - The risk engine computes signals and a composite risk score; a draft case is created or updated.
2. **AI Decision Drafting**
   - The backend assembles a structured JSON payload containing user, transaction, risk signals, and policy context.
   - The LLM returns a structured JSON decision draft (risk level, recommended action, justification, confidence, fairness flags).
   - The backend validates the JSON; on success, it attaches the draft to the case and logs an AI draft audit event.
3. **Case Triage (Dashboard)**
   - The compliance officer opens the Angular dashboard and sees a list of cases with risk level, status, and last activity.
   - The officer filters/sorts to focus on higher-risk or newly created cases.
4. **Case Review (Detail View)**
   - The officer opens a case to see:
     - AI narrative and recommended action.
     - Risk signals and recent transactions.
     - Audit trail to date.
   - The officer assesses whether the AI recommendation is reasonable.
5. **Human Decision & Override**
   - The officer chooses to **approve** the AI recommendation or **override** it.
   - For overrides (and for any irreversible action), the UI requires:
     - Selection of the final decision.
     - Textual rationale.
     - Confirmation of irreversible steps where relevant.
   - The backend enforces guardrails, updates case state, and records a human review audit event.
6. **Closure and Audit**
   - The case status reflects the final human decision.
   - The full chain of AI and human actions is available in the audit panel for review or demonstration.

### 4.2 Simplified Sequence (Textual “Diagram”)

- **Sequence A: Low-Risk, AI-Aligned Approval**
  1. Transaction evaluated → case created with risk signals and AI draft (LOW risk, NO_ACTION or MONITOR).
  2. Officer views case → agrees with AI draft.
  3. Officer clicks “Approve recommendation” → confirms (if required) → case state transitions to APPROVED/CLOSED.
  4. System logs audit entries for AI draft and human approval.

- **Sequence B: High-Risk, Human Override with Irreversible Action**
  1. Transaction evaluated → case created with AI draft (HIGH risk, TEMP_HOLD or ESCALATE).
  2. Officer reviews signals, transactions, and AI narrative.
  3. Officer decides to apply a stricter irreversible action (e.g., permanent closure).
  4. UI requires selection of irreversible action and rationale → displays confirmation dialog.
  5. If confirmed, backend validates guardrails, applies state change, and records detailed audit events.
  6. Dashboard reflects final outcome and audit trail shows both AI suggestion and human override.

---

## 5. Metrics & Success Criteria

### 5.1 Core Metrics

| Metric | Definition | Target (Prototype) | Measurement Approach |
|--------|------------|--------------------|----------------------|
| Time to Review | Average time from case creation to final human decision for typical demo scenarios. | **Reduce by 30–50%** vs. a manual baseline walkthrough of similar cases. | Time stamps from case creation and final review events in audit log; compare to scripted manual-only benchmark. |
| Override Rate | Percentage of AI recommendations that are materially changed by human reviewers. | **Observed, not optimized** in prototype; aim for 20–60% as a useful exploration band. | Compare AI recommended action vs. final human decision across demo sessions. |
| AI Draft Quality (Accuracy vs Benchmark) | Share of AI recommendations that match a predefined “expert benchmark” decision set for sample cases. | **≥70%** alignment on curated benchmark set. | Compare AI outputs to a fixed labeled set of scenarios defined by product/risk owners. |
| Audit Completeness | Percentage of key actions (AI drafts, human approvals/overrides, irreversible actions) that have corresponding audit entries. | **100%** coverage for in-scope actions. | Periodic spot-check of cases against expected event types. |
| Explainability Satisfaction | Qualitative rating from test users on clarity of AI rationales and audit trail. | **≥4/5** average rating across test sessions. | Short feedback survey after demo sessions. |

### 5.2 Success Criteria (Prototype)

- **Usability**: Compliance officers can complete typical review flows without external guidance after a short orientation.
- **Trust & Control**: Test users report that they understand AI rationales and feel in control of irreversible actions.
- **Technical Feasibility**: JSON-only LLM integration, in-memory case management, and Angular UI are stable for demos.
- **Decision Quality Insight**: Override patterns and benchmark comparisons reveal actionable insights about AI behavior.

---

## 6. Constraints

### 6.1 Technical Constraints (Prototype)

- **Frontend**:
  - Must use **Angular** for all UI components and workflows.
- **Backend**:
  - Must use **Node.js** (with a simple HTTP framework) for all server logic.
- **Storage**:
  - All data (users, transactions, cases, audit log) must reside in **in-memory storage** only; no external database.
- **LLM Integration**:
  - All communication with the LLM must be **JSON-only**:
    - Backend sends structured JSON inputs (no arbitrary prompts from the UI).
    - Backend receives and validates structured JSON outputs against a schema.
  - No direct client-side calls to the LLM from the Angular app.

### 6.2 Scope Limitations

- No production-grade authentication, authorization, or multi-tenant support.
- No persistent storage; data is lost when the backend restarts.
- No external streaming infrastructure; transaction flow is simulated.
- Non-functional tuning is limited to demo-scale loads and latencies.

---

## 7. Assumptions & Dependencies

### 7.1 Assumptions

- The prototype will be used by a small group of expert users in controlled demo or lab environments.
- Curated sample data (users, transactions, cases) is representative enough to showcase meaningful risk scenarios.
- LLM provider APIs are reachable, stable, and performant enough for interactive demos.
- Compliance officers using the prototype will understand which actions are AI-generated suggestions vs. human decisions.
- Benchmark labels for “expert decisions” will be provided for a limited set of scenarios to evaluate AI accuracy.

### 7.2 Dependencies

- **Technology & Tooling**
  - Node.js runtime and tooling for backend development.
  - Angular CLI and build pipeline for frontend.
  - Access to an LLM provider with JSON-capable APIs and valid credentials.
- **Operational**
  - Secure mechanism for injecting secrets (e.g., API keys) without committing them to source control.
  - Availability of compliance subject-matter experts to define benchmark decisions and review flows.
  - Alignment with internal risk and legal teams on acceptable demo scenarios and messaging.

