# 🧠 Sentinel — Lean Folder Structure Blueprint

We’ll split into two top-level folders:

```plaintext
sentinel/
├── backend/
└── frontend/
```

No monorepo complexity. No shared packages. Keep it simple.

---

# 🔷 Backend (Node + TypeScript)

```plaintext
backend/
├── src/
│   ├── index.ts
│   ├── app.ts
│   │
│   ├── routes/
│   │   ├── evaluate.route.ts
│   │   ├── case.route.ts
│   │
│   ├── engines/
│   │   ├── risk.engine.ts
│   │   ├── ai.engine.ts
│   │
│   ├── core/
│   │   ├── case.manager.ts
│   │   ├── state.machine.ts
│   │   ├── guardrails.ts
│   │
│   ├── ai/
│   │   ├── prompt.builder.ts
│   │   ├── schema.ts
│   │   ├── llm.client.ts
│   │
│   ├── audit/
│   │   ├── audit.logger.ts
│   │
│   ├── data/
│   │   ├── mock.users.ts
│   │   ├── mock.transactions.ts
│   │   ├── historical.cases.ts
│   │
│   ├── models/
│   │   ├── case.model.ts
│   │   ├── decision.model.ts
│   │   ├── risk.model.ts
│   │
│   └── utils/
│       ├── hash.ts
│
├── package.json
├── tsconfig.json
└── .env
```

---

## 🔍 Why This Structure Works

### routes/

Only HTTP concerns live here.
No business logic.

---

### engines/

Pure computation logic:

-   `risk.engine.ts` → deterministic signal generation
-   `ai.engine.ts` → orchestrates prompt → LLM → validation

Keeps AI logic separate from transport.

---

### core/

System-level enforcement:

-   State transitions
-   Guardrails
-   Case lifecycle

This is where responsibility boundaries live.

---

### ai/

Everything LLM-specific is isolated.

If you swap providers later, you only change this folder.

---

### audit/

Centralized, append-only logging.

---

### data/

Hardcoded data for prototype.
No DB. No ORM.

---

# 🔷 Frontend (Angular 17+ Standalone)

```plaintext
frontend/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── services/
│   │   │   │   ├── compliance.service.ts
│   │   │   │   ├── audit.service.ts
│   │   │   │
│   │   │   ├── models/
│   │   │   │   ├── case.model.ts
│   │   │   │   ├── decision.model.ts
│   │   │   │   ├── risk.model.ts
│   │   │
│   │   ├── features/
│   │   │   ├── dashboard/
│   │   │   │   ├── dashboard.component.ts
│   │   │   │   ├── dashboard.component.html
│   │   │   │
│   │   │   ├── case-view/
│   │   │   │   ├── case-view.component.ts
│   │   │   │   ├── case-view.component.html
│   │   │   │
│   │   │   ├── audit-panel/
│   │   │   │   ├── audit-panel.component.ts
│   │   │   │
│   │   │   ├── override-modal/
│   │   │   │   ├── override-modal.component.ts
│   │   │
│   │   ├── shared/
│   │   │   ├── risk-badge.component.ts
│   │   │   ├── signal-list.component.ts
│   │   │
│   │   ├── app.component.ts
│   │   └── app.routes.ts
│
├── angular.json
├── package.json
└── tailwind.config.js
```

---

## 🔍 Why This Angular Structure Works

### core/

Services + models only.
No UI.

---

### features/

Each business capability is isolated:

-   dashboard → list of cases
-   case-view → AI draft display
-   audit-panel → event timeline
-   override-modal → human boundary enforcement

---

### shared/

Small reusable visual components.
Not logic containers.

---

# 🧠 System Responsibility Mapping

| Folder             | Responsibility    |
| ------------------ | ----------------- |
| engines/           | Intelligence      |
| core/              | Governance        |
| ai/                | LLM isolation     |
| audit/             | Accountability    |
| features/case-view | Human supervision |

That clarity will impress technical reviewers.

---

# 🚫 What We Are Intentionally NOT Adding

-   No NgRx
-   No Prisma
-   No database
-   No Kafka
-   No middleware stack
-   No auth
-   No global state management
-   No interceptors (unless trivial)

Because this is a cognition prototype — not infrastructure build.

---

# 🏆 Why This Blueprint Is Strong

It shows:

-   Separation of intelligence vs governance
-   Clean layering
-   Future scalability awareness
-   Mature Angular architecture
-   Backend discipline

Without being bloated.

---
