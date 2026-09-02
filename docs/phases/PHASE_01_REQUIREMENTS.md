# Phase 1 — Requirements & Product Definition

## Objective

Formalize every requirement into a structured, unambiguous product definition. This document is the single source of truth for what the CRM system does, what data it manages, who can do what, and what the acceptance criteria are for every feature.

## Scope

- Resolve all open decisions from Phase 0
- Define complete entity specifications (fields, types, constraints)
- Define the full permission matrix
- Define follow-up status lifecycle
- Define interaction types and rules
- Define dashboard content requirements
- Write acceptance criteria for every feature module
- Define error and edge-case expectations

## Out of Scope

- Screen layouts and UI wireframes (Phase 2)
- Technical architecture and database schema (Phase 3)
- Implementation of any feature

## Dependencies

- Phase 0 completed ✓

---

# RESOLVED DECISIONS

All 10 open decisions from Phase 0 have been resolved with the project owner.

| # | Decision | Resolution |
|---|----------|------------|
| 1 | Admin as Sales Executive? | **No** — strictly separate roles. Admin manages the system but is never assigned customers. |
| 2 | Customer reassignment? | **Yes, Admin-only** — Admin can reassign a customer to a different Sales Executive. Follow-ups and interactions stay with the customer. |
| 3 | SE per customer cardinality? | **One-to-one** — strictly one Sales Executive per customer. |
| 4 | Follow-up statuses? | **Four statuses**: Pending, In Progress, Completed, Cancelled. Plus **Overdue** as a system-derived display state. |
| 5 | User creation model? | **Admin-managed only** — Admin creates all Sales Executive accounts. No self-registration. |
| 6 | Soft vs hard delete? | **Hard delete** — records are permanently removed. |
| 7 | Interaction fields? | customerId, createdBy, type, date, summary, notes, duration (optional). |
| 8 | Overdue follow-up detection? | **Yes** — auto-detect at query time. If a follow-up's date has passed and status is still Pending or In Progress, it is flagged as Overdue in the response. No background job. |
| 9 | Deployment target? | **Cloud deployment** (e.g., Render, Railway, Vercel + backend hosting). Details in Phase 16. |
| 10 | Initial Admin creation? | **Seed script** — CLI command creates Admin using credentials from environment variables. |

---

# DATA DICTIONARY

## Entity: User

Represents an authenticated person in the system.

| Field       | Type     | Required | Constraints                                      | Notes                                  |
|-------------|----------|----------|--------------------------------------------------|----------------------------------------|
| name        | String   | Yes      | Min 2 chars, max 100 chars                       | Full name of the user                  |
| email       | String   | Yes      | Valid email format, unique across all users       | Used as login identifier               |
| password    | String   | Yes      | Min 8 chars, stored as bcrypt hash               | Never returned in API responses        |
| role        | String   | Yes      | Enum: `admin`, `salesExecutive`                  | Determines permissions                 |
| phone       | String   | No       | Valid phone format if provided                   |                                        |
| createdAt   | Date     | Auto     | Set on creation                                  | Managed by database                    |
| updatedAt   | Date     | Auto     | Updated on modification                          | Managed by database                    |

**Rules:**
- Email must be unique across the system.
- Password is never exposed in any API response.
- Roles are strictly `admin` or `salesExecutive` — no other values allowed.
- Admin accounts are created via seed script or by another Admin.
- Sales Executive accounts are created only by Admin.

---

## Entity: Customer

Represents a person/entity managed within the CRM.

| Field              | Type     | Required | Constraints                                    | Notes                                     |
|--------------------|----------|----------|------------------------------------------------|-------------------------------------------|
| name               | String   | Yes      | Min 2 chars, max 100 chars                     | Customer's full name                      |
| email              | String   | Yes      | Valid email format, unique across customers     | Primary contact email                     |
| phone              | String   | Yes      | Valid phone format                             | Primary contact phone                     |
| address            | String   | No       | Max 500 chars                                  | Physical or mailing address               |
| assignedTo         | ObjectId | Yes      | Must reference a valid User with role `salesExecutive` | The Sales Executive responsible   |
| createdBy          | ObjectId | Auto     | References the User who created this customer  | Set on creation, immutable                |
| createdAt          | Date     | Auto     | Set on creation                                | Managed by database                       |
| updatedAt          | Date     | Auto     | Updated on modification                        | Managed by database                       |

**Rules:**
- **No Company field.**
- `assignedTo` must reference a user with role `salesExecutive` — not an Admin.
- A customer is assigned to exactly **one** Sales Executive (1:1).
- Customer reassignment (changing `assignedTo`) can only be done by Admin.
- Email must be unique across all customers.
- When a customer is deleted (hard delete), all associated follow-ups and interactions are also deleted.

---

## Entity: Follow-up

Represents a scheduled future action tied to a customer.

| Field        | Type     | Required | Constraints                                                  | Notes                                   |
|--------------|----------|----------|--------------------------------------------------------------|-----------------------------------------|
| customer     | ObjectId | Yes      | Must reference a valid Customer                              | The customer this follow-up is for      |
| createdBy    | ObjectId | Auto     | References the User who created this follow-up               | Set on creation, immutable              |
| date         | Date     | Yes      | Must be a valid date                                         | The date/time the follow-up is due      |
| notes        | String   | No       | Max 1000 chars                                               | Description or details of the follow-up |
| status       | String   | Yes      | Enum: `Pending`, `In Progress`, `Completed`, `Cancelled`     | Default: `Pending`                      |
| createdAt    | Date     | Auto     | Set on creation                                              | Managed by database                     |
| updatedAt    | Date     | Auto     | Updated on modification                                      | Managed by database                     |

**Status Lifecycle:**

```
                ┌──────────────┐
                │   Pending    │ (default on creation)
                └──────┬───────┘
                       │
              ┌────────┴────────┐
              ▼                 ▼
    ┌──────────────┐   ┌──────────────┐
    │ In Progress  │   │  Cancelled   │
    └──────┬───────┘   └──────────────┘
           │
           ▼
    ┌──────────────┐
    │  Completed   │
    └──────────────┘
```

**Allowed transitions:**
- Pending → In Progress
- Pending → Completed (can skip In Progress)
- Pending → Cancelled
- In Progress → Completed
- In Progress → Cancelled

**Disallowed transitions:**
- Completed → any other status
- Cancelled → any other status (terminal states)

**Overdue Detection (derived, not stored):**
- If a follow-up's `date` is in the past AND its `status` is `Pending` or `In Progress`, it is flagged as **Overdue** in API responses.
- Overdue is a **display flag**, not a stored status. It is computed at query time.
- No background job or scheduled task is needed.

---

## Entity: Interaction

Represents a historical record of a contact event with a customer.

| Field        | Type     | Required | Constraints                                             | Notes                                      |
|--------------|----------|----------|---------------------------------------------------------|--------------------------------------------|
| customer     | ObjectId | Yes      | Must reference a valid Customer                         | The customer this interaction is about     |
| createdBy    | ObjectId | Auto     | References the User who logged this interaction         | Set on creation, immutable                 |
| type         | String   | Yes      | Enum: `Call`, `Email`, `Meeting`                        | The type of interaction                    |
| date         | Date     | Yes      | Must be a valid date                                    | When the interaction occurred              |
| summary      | String   | Yes      | Min 2 chars, max 200 chars                              | Brief one-line description                 |
| notes        | String   | No       | Max 2000 chars                                          | Detailed notes about the interaction       |
| duration     | Number   | No       | Positive integer if provided, in minutes                | Duration of the interaction (optional)     |
| createdAt    | Date     | Auto     | Set on creation                                         | Managed by database                        |
| updatedAt    | Date     | Auto     | Updated on modification                                 | Managed by database                        |

**Rules:**
- Interaction `type` is strictly one of: `Call`, `Email`, `Meeting`.
- `summary` is required and serves as the headline in timeline views.
- `notes` is optional and contains detailed content.
- `duration` is optional (in minutes). Useful for calls and meetings.
- Interactions are immutable records by default — a logged interaction represents something that happened. Editing is permitted for corrections but deletion should be allowed.

---

# PERMISSION MATRIX

## User Management

| Operation                  | Admin | Sales Executive |
|---------------------------|-------|-----------------|
| Create Sales Executive     | ✅    | ❌              |
| View all users             | ✅    | ❌              |
| View single user details   | ✅    | Own profile only |
| Edit user                  | ✅    | Own profile only |
| Delete user                | ✅    | ❌              |
| Change user role           | ✅    | ❌              |

## Customer Management

| Operation                    | Admin            | Sales Executive            |
|-----------------------------|------------------|----------------------------|
| Create customer              | ✅               | ✅ (assigns to self)        |
| View all customers           | ✅               | ❌ (own assigned only)      |
| View single customer detail  | ✅               | ✅ (own assigned only)      |
| Edit customer                | ✅               | ✅ (own assigned only)      |
| Delete customer              | ✅               | ❌                          |
| Reassign customer            | ✅               | ❌                          |
| Search/filter customers      | ✅ (all)         | ✅ (within own assigned)    |

**Notes:**
- When a Sales Executive creates a customer, the `assignedTo` field is automatically set to themselves.
- Admin can create a customer and assign to any Sales Executive.
- Only Admin can reassign a customer from one SE to another.
- Only Admin can delete customers.

## Follow-up Management

| Operation                  | Admin                     | Sales Executive                   |
|---------------------------|---------------------------|-----------------------------------|
| Create follow-up           | ✅ (for any customer)     | ✅ (for own assigned customers)   |
| View follow-ups            | ✅ (all)                  | ✅ (own customers' follow-ups)    |
| Edit follow-up             | ✅                        | ✅ (own customers' follow-ups)    |
| Change follow-up status    | ✅                        | ✅ (own customers' follow-ups)    |
| Delete follow-up           | ✅                        | ✅ (own customers' follow-ups)    |

## Interaction Management

| Operation                  | Admin                     | Sales Executive                       |
|---------------------------|---------------------------|---------------------------------------|
| Log interaction            | ✅ (for any customer)     | ✅ (for own assigned customers)       |
| View interactions          | ✅ (all)                  | ✅ (own customers' interactions)      |
| Edit interaction           | ✅                        | ✅ (own customers' interactions)      |
| Delete interaction         | ✅                        | ✅ (own customers' interactions)      |

## Dashboard

| Operation                        | Admin | Sales Executive |
|---------------------------------|-------|-----------------|
| View Sales Executive dashboard   | ❌    | ✅              |
| View Admin dashboard             | ✅    | ❌              |

## Authentication

| Operation       | Admin | Sales Executive |
|----------------|-------|-----------------|
| Login           | ✅    | ✅              |
| Logout          | ✅    | ✅              |
| View own profile| ✅    | ✅              |
| Edit own profile| ✅    | ✅              |

---

# FEATURE REQUIREMENTS & ACCEPTANCE CRITERIA

## Module: Authentication

### F-AUTH-01: Login

**Description:** Users log in with email and password to receive a JWT token.

**Acceptance Criteria:**
- AC1: User can log in with valid email and password.
- AC2: Successful login returns a JWT containing user ID and role.
- AC3: Invalid email returns an appropriate error (do not reveal whether email exists).
- AC4: Invalid password returns an appropriate error (same generic message as AC3).
- AC5: Empty email or password returns a validation error.
- AC6: JWT has a defined expiration time.

### F-AUTH-02: Logout

**Description:** Users can log out, clearing their authentication state.

**Acceptance Criteria:**
- AC1: Logging out clears the JWT from the frontend.
- AC2: After logout, protected routes are no longer accessible.

### F-AUTH-03: Protected Routes

**Description:** All application routes (except login) require authentication.

**Acceptance Criteria:**
- AC1: Requests without a JWT are rejected with 401 Unauthorized.
- AC2: Requests with an expired JWT are rejected with 401 Unauthorized.
- AC3: Requests with a malformed JWT are rejected with 401 Unauthorized.
- AC4: Authenticated requests proceed to the requested resource.

### F-AUTH-04: Role-based Authorization

**Description:** API endpoints enforce role-based access control.

**Acceptance Criteria:**
- AC1: Admin-only endpoints reject Sales Executive requests with 403 Forbidden.
- AC2: Data scoping is enforced — Sales Executives can only access their own customers' data.
- AC3: Authorization is enforced at the backend, not just the frontend.

---

## Module: User Management

### F-USER-01: Create Sales Executive (Admin only)

**Description:** Admin creates Sales Executive accounts.

**Acceptance Criteria:**
- AC1: Admin can create a new Sales Executive with name, email, password, and optional phone.
- AC2: Duplicate email is rejected with a clear error.
- AC3: Invalid or missing required fields return validation errors.
- AC4: Password is stored as a bcrypt hash.
- AC5: Non-Admin users cannot access this endpoint (403).
- AC6: The created user is returned (without password).

### F-USER-02: View Users (Admin only)

**Description:** Admin can view a list of all users.

**Acceptance Criteria:**
- AC1: Admin can retrieve a list of all users.
- AC2: Passwords are never included in the response.
- AC3: Non-Admin users cannot access this endpoint (403).

### F-USER-03: View Single User

**Description:** View details of a specific user.

**Acceptance Criteria:**
- AC1: Admin can view any user's details.
- AC2: Sales Executive can view only their own profile.
- AC3: Attempting to view another user's profile returns 403.
- AC4: Password is never included in the response.

### F-USER-04: Edit User

**Description:** Edit user information.

**Acceptance Criteria:**
- AC1: Admin can edit any user's name, email, phone, and role.
- AC2: Sales Executive can edit only their own name, email, and phone (not role).
- AC3: Email uniqueness is enforced on update.
- AC4: Invalid fields return validation errors.
- AC5: Password is not editable through this endpoint (separate password change if needed).

### F-USER-05: Delete User (Admin only)

**Description:** Admin permanently deletes a user account.

**Acceptance Criteria:**
- AC1: Admin can delete a Sales Executive account.
- AC2: Admin cannot delete their own account.
- AC3: Non-Admin users cannot access this endpoint (403).
- AC4: The user record is permanently removed (hard delete).
- AC5: Edge case — deleting an SE who has assigned customers: the system should either prevent deletion until customers are reassigned OR cascade appropriately. **Recommended: prevent deletion if customers are still assigned; require reassignment first.**

---

## Module: Customer Management

### F-CUST-01: Create Customer

**Description:** Create a new customer record.

**Acceptance Criteria:**
- AC1: Admin can create a customer and assign to any Sales Executive.
- AC2: Sales Executive can create a customer (auto-assigned to themselves).
- AC3: Required fields: name, email, phone, assignedTo (Admin) or auto-set (SE).
- AC4: Duplicate email is rejected.
- AC5: `assignedTo` must reference a valid Sales Executive (not an Admin).
- AC6: Invalid or missing fields return validation errors.

### F-CUST-02: View Customer List

**Description:** View a list of customers.

**Acceptance Criteria:**
- AC1: Admin sees all customers in the system.
- AC2: Sales Executive sees only customers assigned to them.
- AC3: List supports pagination (or at minimum, is ordered consistently).
- AC4: Each customer entry includes: name, email, phone, assigned SE name.

### F-CUST-03: View Customer Detail

**Description:** View full details of a specific customer.

**Acceptance Criteria:**
- AC1: Admin can view any customer's details.
- AC2: Sales Executive can view only their assigned customer's details.
- AC3: Attempting to view a non-assigned customer returns 403.
- AC4: Detail includes all customer fields plus assigned SE name.

### F-CUST-04: Edit Customer

**Description:** Edit customer information.

**Acceptance Criteria:**
- AC1: Admin can edit any customer's fields including `assignedTo` (reassignment).
- AC2: Sales Executive can edit their assigned customer's fields except `assignedTo`.
- AC3: Email uniqueness is enforced on update.
- AC4: `assignedTo` reassignment can only be done by Admin.
- AC5: Invalid fields return validation errors.

### F-CUST-05: Delete Customer (Admin only)

**Description:** Permanently delete a customer and all associated data.

**Acceptance Criteria:**
- AC1: Admin can delete any customer.
- AC2: Sales Executives cannot delete customers (403).
- AC3: Deleting a customer also deletes all associated follow-ups and interactions (cascade hard delete).
- AC4: Non-existent customer returns 404.

### F-CUST-06: Search and Filter Customers

**Description:** Search customers by name/email and filter by assigned SE.

**Acceptance Criteria:**
- AC1: Search by name (partial match, case-insensitive).
- AC2: Search by email (partial match, case-insensitive).
- AC3: Filter by assigned Sales Executive (Admin only — SE already sees only their own).
- AC4: Admin searches across all customers; SE searches within their own.
- AC5: Empty results return an empty array, not an error.

---

## Module: Follow-up Management

### F-FU-01: Create Follow-up

**Description:** Create a follow-up linked to a customer.

**Acceptance Criteria:**
- AC1: Sales Executive can create follow-ups for their assigned customers.
- AC2: Admin can create follow-ups for any customer.
- AC3: Required fields: customer, date, notes (optional), status defaults to Pending.
- AC4: Cannot create a follow-up for a non-assigned customer (SE) → 403.
- AC5: Invalid customer ID returns 404.

### F-FU-02: View Follow-ups

**Description:** View follow-ups with filtering options.

**Acceptance Criteria:**
- AC1: Sales Executive sees follow-ups for their assigned customers only.
- AC2: Admin sees all follow-ups across the system.
- AC3: Follow-ups can be filtered by status (Pending, In Progress, Completed, Cancelled).
- AC4: Follow-ups can be filtered by customer.
- AC5: Follow-ups that are overdue (date in past, status Pending or In Progress) include an `isOverdue: true` flag in the response.
- AC6: Follow-ups are sorted by date (upcoming first by default).

### F-FU-03: Edit Follow-up

**Description:** Edit follow-up details (date, notes).

**Acceptance Criteria:**
- AC1: Sales Executive can edit follow-ups for their assigned customers.
- AC2: Admin can edit any follow-up.
- AC3: Editable fields: date, notes.
- AC4: Cannot edit a Completed or Cancelled follow-up's date/notes.

### F-FU-04: Change Follow-up Status

**Description:** Transition a follow-up between valid statuses.

**Acceptance Criteria:**
- AC1: Allowed transitions are enforced (see status lifecycle above).
- AC2: Transitioning Completed or Cancelled to any other state is rejected.
- AC3: Sales Executive can change status for their assigned customers' follow-ups.
- AC4: Admin can change status for any follow-up.
- AC5: Invalid transition returns a clear error message.

### F-FU-05: Delete Follow-up

**Description:** Permanently delete a follow-up.

**Acceptance Criteria:**
- AC1: Sales Executive can delete follow-ups for their assigned customers.
- AC2: Admin can delete any follow-up.
- AC3: Non-existent follow-up returns 404.

---

## Module: Interaction Management

### F-INT-01: Log Interaction

**Description:** Record a new interaction with a customer.

**Acceptance Criteria:**
- AC1: Sales Executive can log interactions for their assigned customers.
- AC2: Admin can log interactions for any customer.
- AC3: Required fields: customer, type, date, summary.
- AC4: Optional fields: notes, duration.
- AC5: Type must be one of: Call, Email, Meeting.
- AC6: Cannot log an interaction for a non-assigned customer (SE) → 403.

### F-INT-02: View Interaction History

**Description:** View the interaction timeline for a customer.

**Acceptance Criteria:**
- AC1: Sales Executive can view interactions for their assigned customers.
- AC2: Admin can view interactions for any customer.
- AC3: Interactions are sorted by date (most recent first) to form a timeline.
- AC4: Each interaction shows: type, date, summary, and who logged it.
- AC5: Can also view all interactions across customers (Admin: all; SE: own customers).

### F-INT-03: Edit Interaction

**Description:** Edit an interaction record (for corrections).

**Acceptance Criteria:**
- AC1: Sales Executive can edit interactions for their assigned customers.
- AC2: Admin can edit any interaction.
- AC3: All non-auto fields are editable.

### F-INT-04: Delete Interaction

**Description:** Permanently delete an interaction record.

**Acceptance Criteria:**
- AC1: Sales Executive can delete interactions for their assigned customers.
- AC2: Admin can delete any interaction.
- AC3: Non-existent interaction returns 404.

---

## Module: Sales Executive Dashboard

### F-DASH-SE-01: Dashboard Overview

**Description:** The Sales Executive's home screen showing a summary of their CRM activity.

**Acceptance Criteria:**
- AC1: Displays the count of assigned customers.
- AC2: Displays upcoming follow-ups (next 7 days or configurable).
- AC3: Displays overdue follow-ups (flagged distinctly).
- AC4: Displays count of pending follow-ups.
- AC5: Displays count of completed follow-ups.
- AC6: Displays recent interactions (last 5–10).
- AC7: All data is scoped to the logged-in Sales Executive only.
- AC8: Dashboard data is fetched from real application data (not hardcoded).
- AC9: Only accessible by Sales Executive role.

---

## Module: Admin Dashboard

### F-DASH-ADMIN-01: Dashboard Overview

**Description:** The Admin's home screen showing system-wide CRM health.

**Acceptance Criteria:**
- AC1: Displays total customer count.
- AC2: Displays total Sales Executive count.
- AC3: Displays follow-up statistics (total, pending, in progress, completed, cancelled, overdue).
- AC4: Displays interaction statistics (total, by type breakdown).
- AC5: Displays per-Sales-Executive summary (customer count, follow-up count).
- AC6: All data is system-wide (not scoped to a single SE).
- AC7: Dashboard data is fetched from real application data.
- AC8: Only accessible by Admin role.

---

# EDGE CASES & ERROR HANDLING

## General API Errors

| Scenario                          | Expected Response                               |
|-----------------------------------|-------------------------------------------------|
| Missing required field            | 400 Bad Request with field-level error messages  |
| Invalid field format              | 400 Bad Request with validation details          |
| Unauthenticated request           | 401 Unauthorized                                 |
| Unauthorized role/ownership       | 403 Forbidden                                    |
| Resource not found                | 404 Not Found                                    |
| Duplicate unique field (email)    | 409 Conflict                                     |
| Server error                      | 500 Internal Server Error (no internals leaked)  |

## Key Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| Delete an SE who has assigned customers | **Reject** — require all customers to be reassigned first |
| Delete a customer with follow-ups and interactions | **Cascade delete** — remove all associated follow-ups and interactions |
| Reassign a customer | Follow-ups and interactions stay with the customer, transfer to new SE's view |
| SE tries to create customer assigned to another SE | **Reject** — SE can only assign to self |
| SE tries to access another SE's customer | **403 Forbidden** |
| Follow-up date in the past on creation | **Allow** — the user may be logging a past-due item |
| Edit a Completed/Cancelled follow-up | **Reject** — terminal states cannot be modified |
| Login with non-existent email | Generic "Invalid credentials" (don't reveal email existence) |
| Admin deletes own account | **Reject** — Admin cannot delete themselves |

---

# DASHBOARD CONTENT REQUIREMENTS

## Sales Executive Dashboard Widgets

1. **My Customers** — count of assigned customers
2. **Upcoming Follow-ups** — list of follow-ups due in the next 7 days
3. **Overdue Follow-ups** — list of past-due follow-ups (Pending/In Progress with past date), displayed prominently
4. **Follow-up Summary** — counts by status (Pending, In Progress, Completed, Cancelled)
5. **Recent Interactions** — last 5–10 interactions logged across their customers

## Admin Dashboard Widgets

1. **Total Customers** — system-wide count
2. **Total Sales Executives** — count of active SE users
3. **Follow-up Overview** — system-wide counts by status + overdue count
4. **Interaction Overview** — system-wide counts by type (Call, Email, Meeting)
5. **Sales Executive Summary** — table/list showing each SE with their customer count and open follow-up count

---

# STATUS

## Plan: ✅ Complete
## Implementation: ✅ Complete (documentation phase — no code)
## Testing: N/A (no code to test)
## Review: ✅ Complete
## Documentation: ✅ This document

## Decisions Made

All 10 open decisions from Phase 0 resolved — see "Resolved Decisions" table above.

## Issues

None.

## Completion Criteria

- [x] Every entity has a complete field specification
- [x] Permission matrix is defined and approved
- [x] Follow-up lifecycle is defined
- [x] Interaction rules are defined
- [x] Dashboard requirements are specified
- [x] All acceptance criteria written
- [x] Open decisions from Phase 0 resolved
- [x] Documentation updated
