# Phase 12 — Admin Dashboard & System-Wide Views

## Objective
Build the Admin dashboard — a system-wide command center showing overall customer statistics,
Sales Executive activity, follow-up status distribution, and interaction volumes. Only accessible
to the Admin role.

## Dependencies
- Phase 8 ✅ (Customers)
- Phase 9 ✅ (Follow-ups)
- Phase 10 ✅ (Interactions)
- Phase 11 ✅ (Dashboard infrastructure: routes, controller, CSS)

---

## Architecture Reference

### Backend — API Route
From `PHASE_03_ARCHITECTURE.md`, Section 3.6:
```
GET /api/v1/dashboard/admin
```
- Auth: `requireAuth` + `requireRole('admin')`
- Data: System-wide, no scoping

### New/Modified Files
| File | Change |
|------|--------|
| `backend/src/controllers/dashboardController.js` | Added `getAdminDashboard()` |
| `backend/src/routes/dashboardRoutes.js` | `GET /admin` with admin role guard |
| `frontend/src/pages/AdminDashboard.jsx` | Admin dashboard page |
| `frontend/src/api/dashboard.js` | `getAdminDashboard()` Axios wrapper |
| `frontend/src/App.jsx` | `DashboardRouter` renders `<AdminDashboard />` for admin role |

---

## UI Sections Implemented

### 1. Summary Stat Cards (top row — 6 cards)
- Total Customers, Sales Executives, Overdue Follow-ups, Completed Follow-ups, Total Follow-ups, Total Interactions

### 2. Charts Row (3 panels)
- **Follow-up Status Donut Chart** — SVG donut with legend (Pending, In Progress, Completed, Cancelled)
- **Interaction Type Breakdown** — horizontal bar chart (Calls, Emails, Meetings as % of total)
- **Customers per SE** — horizontal bars showing each SE's customer load with % of total

### 3. SE Follow-up Activity Table (full width)
- Table: SE Name | Pending | In Progress | Completed | Cancelled | Total
- Sourced from MongoDB `$group` aggregation on follow-ups by `createdBy`

### 4. Bottom Row (2 panels)
- **Upcoming Follow-ups** — system-wide, next 7 days, max 10
- **Recent Interactions** — system-wide, most recent 10

---

## Aggregations Used (MongoDB)
- `countDocuments()` for all scalar stats
- `$group` + `$lookup` for customers-per-SE and follow-ups-per-SE
- `$group` for interaction type breakdown
- `find().sort().limit()` for upcoming follow-ups and recent interactions

---

## Status
- Plan: ✅ Complete
- Implementation: ✅ Complete
- Testing: ✅ Endpoint built and protected; route verified
- Review: ✅ Complete
- Documentation: ✅ This document
