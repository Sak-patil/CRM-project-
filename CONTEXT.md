# CRM Application — Project Context

A role-based Customer Relationship Management system that helps a business manage customers, sales activities, follow-ups, and interaction history through two distinct user roles.

---

## Purpose

Enable a business to centrally track its customer relationships — who the customers are, which Sales Executive owns them, what follow-ups are pending, what interactions have occurred, and how the overall CRM is performing.

---

## User Roles

| Role             | Responsibility                                                    |
| ---------------- | ----------------------------------------------------------------- |
| Admin            | System-wide management, monitoring, user administration, reports  |
| Sales Executive  | Day-to-day customer work — follow-ups, interactions, sales tasks  |

Exact permissions and capabilities are defined in the project requirements and refined during Phase 1.

---

## Core Business Concepts

| Concept       | Description                                                             |
| ------------- | ----------------------------------------------------------------------- |
| User          | An authenticated person with a role (Admin or Sales Executive)          |
| Customer      | A person/entity managed by a Sales Executive (no Company field)         |
| Follow-up     | A scheduled task tied to a customer (e.g., call, meeting) with status   |
| Interaction   | A historical record of contact with a customer (call, email, meeting)   |
| Dashboard     | Role-specific view summarizing relevant CRM data                        |

### Key Relationship

```
User (Sales Executive)
  └── Customer
        ├── Follow-ups   (scheduled, with lifecycle: Pending → Completed)
        └── Interactions  (historical log of contacts)
```

---

## Technology Stack

| Layer     | Technology        |
| --------- | ----------------- |
| Frontend  | React             |
| Backend   | Node.js + Express |
| Database  | MongoDB           |

Do not change the stack without documenting the rationale under an architecture decision record.

---

## Important Constraints

- **No Company field** on the Customer model.
- **Authorization is backend-enforced** — hiding UI elements alone is not sufficient security.
- The CRM is a **coherent product**, not a collection of disconnected CRUD pages.
- **Incremental development** — no phase should attempt to build everything at once.

---

## Core Engineering Principles

1. **Build incrementally.** Small, working, verified changes.
2. **Verify before declaring done.** AI-generated code must be tested.
3. **Keep architecture understandable.** Do not overengineer.
4. **Make decisions explicit.** Document significant choices.
5. **Don't hide uncertainty.** Flag ambiguities rather than guessing.
6. **Don't silently change requirements.** Ask before making product decisions.
7. **Security is continuous.** Address security during development, not only at the end.
8. **Don't modify unrelated functionality.** Keep changes focused.
9. **Don't add unnecessary dependencies.** Every dependency needs a reason.

---

## AI Development Workflow

Every implementation phase follows this lifecycle:

```
PLAN → IMPLEMENT → TEST → REVIEW → UPDATE DOCUMENTATION → UPDATE PROGRESS → PHASE COMPLETE
```

Before starting any phase, the agent must read:

1. `CONTEXT.md` (this file)
2. `PHASES.md` — the complete development roadmap
3. `PROJECT_STATUS.md` — current project state
4. The relevant phase document under `docs/phases/`
5. Any relevant technical documentation
6. The actual codebase

---

## Documentation Expectations

- **`CONTEXT.md`** — Stable project context (this file). Rarely changes.
- **`PHASES.md`** — Master development roadmap. Updated when phases change status.
- **`PROJECT_STATUS.md`** — Current state snapshot. Updated after every meaningful task.
- **`docs/phases/PHASE_XX_*.md`** — Created when a phase becomes active. Records what was actually done.
- **Technical docs** — Created as needed during implementation phases.

Documentation must describe the **actual current implementation**, not aspirational plans.

---

## Terminology

| Term              | Meaning                                                        |
| ----------------- | -------------------------------------------------------------- |
| CRM               | Customer Relationship Management — this application            |
| Sales Executive   | A user role responsible for customer-facing sales work         |
| Follow-up         | A scheduled future action tied to a customer                   |
| Interaction       | A logged past contact event with a customer                    |
| Tracer Bullet     | An early end-to-end feature used to validate the architecture  |
| Phase             | A logical unit of the development roadmap                      |
