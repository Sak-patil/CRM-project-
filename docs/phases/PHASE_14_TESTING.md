# Phase 14 — Comprehensive Testing & QA

## Objective
Perform a final quality assurance pass across the CRM. Ensure that all modules communicate properly, role-based authorization holds strong, and no regressions have been introduced during the development lifecycle.

## Testing Strategy
Given the architecture (Node/React/Mongo) and the scope of the project, we rely on End-to-End (E2E) workflow testing and manual API validation rather than writing exhaustive unit test suites for simple CRUD controllers.

### 1. Authentication & Authorization Tests
- **[ ] Login as Admin:** Verify successful login redirects to `/` (Admin Dashboard).
- **[ ] Login as SE:** Verify successful login redirects to `/` (SE Dashboard).
- **[ ] Invalid Login:** Verify correct error message is shown for bad credentials.
- **[ ] Role Escalation Protection:** Ensure an SE cannot navigate to `/users` or access the Admin dashboard.

### 2. User Management (Admin Only)
- **[ ] View Users:** Admin can see list of SEs.
- **[ ] Create User:** Admin can create a new SE.
- **[ ] Deactivate User:** Admin can deactivate an SE.

### 3. Customer Management
- **[ ] SE View:** SE can see only their assigned customers.
- **[ ] Admin View:** Admin can see all customers across the system.
- **[ ] Create Customer:** SE can create a customer and it correctly assigns to them. Admin can create a customer and assign it to an SE.

### 4. Follow-ups & Interactions
- **[ ] SE Actions:** SE can view their customers' follow-ups, change statuses, and log interactions (calls, emails, meetings).
- **[ ] Dashboard Sync:** Ensure that marking a follow-up as "Completed" removes it from the "Pending" widgets on the dashboard.

### 5. Error Handling & Edge Cases
- **[ ] Empty States:** Dashboards and tables render gracefully when no data exists.
- **[ ] Invalid Data:** Ensure forms prevent submission of missing/invalid fields (e.g. invalid phone/email).
- **[ ] Protected Routes:** Navigating to a page while logged out redirects to `/login`.

---

## Execution
We will utilize an automated browser subagent to perform an end-to-end smoke test of these core journeys.

## Status
- Plan: ✅ Complete
- Implementation: In Progress (Browser Smoke Tests)
- Testing: In Progress
- Review: Pending
- Documentation: ✅ This document
