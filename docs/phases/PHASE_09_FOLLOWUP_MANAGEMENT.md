# Phase 9 — Follow-up Management

## Objective
Implement the follow-up management module — creating, viewing, updating, and completing follow-ups associated with customers.

## Overview
Follow-up tracking is a core CRM feature that prevents customer tasks from being forgotten. Sales Executives can manage follow-ups for their assigned customers, while Admins can view and manage all follow-ups across the system.

## Entities
### Follow-up
- `customer`: Ref to Customer (Required)
- `createdBy`: Ref to User (Required)
- `date`: Date/Time (Required)
- `status`: Enum `['Pending', 'In Progress', 'Completed', 'Cancelled']` (Required, Default: `Pending`)
- `notes`: String (Optional, max 1000)

## API Routes (`/api/v1/follow-ups`)
- `GET /`: List follow-ups (Scoped). Query params: `status`, `customer`.
- `POST /`: Create a follow-up.
- `GET /:id`: Get specific follow-up details.
- `PUT /:id`: Update follow-up (date, notes).
- `PATCH /:id/status`: Update status.
- `DELETE /:id`: Hard delete follow-up.

## Logic & Edge Cases
- **Role-based Scoping**: SEs can only view/create/edit/delete follow-ups for customers assigned to them. Admins can operate system-wide.
- **Overdue Detection**: Computed at query-time. If `date < now` and `status` is `Pending` or `In Progress`, set `isOverdue: true` on the response object.
- **Status Validation**:
  - Allowed: Pending -> In Progress / Completed / Cancelled
  - Allowed: In Progress -> Completed / Cancelled
  - Disallowed: Completed -> Any, Cancelled -> Any.
- **Cascade Delete**: When a customer is deleted, all their follow-ups must be deleted.
