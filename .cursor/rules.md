# Sentinel — AI-Native Compliance Decision Engine

## Project Intent

This project is an AI-native compliance decision engine.

AI owns first-order regulatory decision drafting.
Humans supervise irreversible consequences.

The system is designed to:

-   Replace manual compliance review with AI-drafted structured decisions
-   Enforce human authorization for irreversible actions
-   Maintain auditability and governance boundaries
-   Demonstrate system-level responsibility assignment

Do NOT treat this as a chatbot project.
Do NOT convert this into a conversational assistant.
This is an operational decision system.

---

# Core Architectural Principles

1. AI drafts the regulatory decision.
2. Humans authorize irreversible consequences.
3. Guardrails must be enforced in backend logic, not only UI.
4. Every decision must be traceable and auditable.
5. Structured JSON output from AI is mandatory.
6. Simplicity over abstraction (this is a 1-day prototype).

---

# Technical Constraints

## Frontend

-   Angular 17+ (standalone components)
-   Use Angular Signals for local state
-   Do NOT introduce NgRx
-   Keep component hierarchy shallow
-   No unnecessary abstraction layers

## Backend

-   Node.js + TypeScript
-   Express only
-   Use Zod for AI output validation
-   In-memory storage only (no database)
-   No authentication system
-   No complex middleware stacks

---

# AI Decision Engine Rules

The AI must:

-   Receive structured input JSON
-   Output strict JSON conforming to schema
-   Never output markdown or commentary
-   Never hallucinate unavailable fields
-   Never execute irreversible actions

All LLM output must be validated with Zod.
If validation fails, reject response.

AI may recommend:

-   NO_ACTION
-   MONITOR
-   TEMP_HOLD
-   ESCALATE
-   PERMANENT_CLOSE (flagged as requiring human)

AI may NOT automatically execute:

-   PERMANENT_CLOSE
-   Legal escalation

Guardrails must exist in backend logic.

---

# Case State Machine Rules

Valid states:

-   NEW
-   AI_DRAFTED
-   HUMAN_APPROVED
-   HUMAN_OVERRIDDEN
-   ESCALATED
-   CLOSED

State transitions must be enforced programmatically.
No implicit state changes.

---

# Audit Requirements

Every case must log:

-   AI decision draft timestamp
-   Model version
-   Human approval or override
-   Override reason (required if overriding)

Audit log must be append-only.

---

# Risk Engine Constraints

Risk signals must be deterministic.
Use simple logic:

-   Transaction spike detection
-   Velocity anomaly
-   Structuring pattern detection

Do NOT implement ML models.
Do NOT add unnecessary statistical complexity.

---

# UI Behavior Rules

UI must clearly display:

-   Risk score
-   Triggered signals
-   AI justification
-   Confidence score
-   Fairness flags

If AI recommends PERMANENT_CLOSE:

-   Disable auto-approve
-   Require explicit human confirmation

Override must require typed justification.

---

# Code Quality Rules

-   Prefer clarity over cleverness
-   Avoid deep inheritance hierarchies
-   Avoid excessive utility layers
-   No premature optimization
-   Keep files under 300 lines where possible

If suggesting refactors:

-   Simplify
-   Reduce abstraction
-   Remove unnecessary dependencies

---

# What This Project Is NOT

-   Not a chatbot
-   Not a rules engine wrapper
-   Not a demo-only UI
-   Not an ML research project
-   Not a fintech simulation

It is:
An AI-native decision workflow prototype demonstrating responsibility delegation.

---

# Scaling Awareness (Conceptual Only)

Do not implement, but be aware:

-   Event streaming (Kafka)
-   Async inference queues
-   Model versioning
-   Bias monitoring
-   Drift detection

These should NOT be implemented in prototype,
but architecture should not block them.

---

# Prompt Engineering Guidance

When generating LLM prompts:

-   Use role-based instruction
-   Enforce JSON-only output
-   Include schema in system message
-   Provide example structured input

Never use open-ended prompts.

---

# Absolute Priority

Maintain clear boundary:

AI drafts.
Human authorizes irreversible consequences.

If unsure about implementation detail,
choose the simplest approach that preserves this boundary.
