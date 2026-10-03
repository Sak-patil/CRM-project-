# Phase 11 — Sales Executive Dashboard

## Objective
Build the Sales Executive dashboard — a personalized home screen that surfaces actionable
data for the logged-in SE: their assigned customer count, upcoming and overdue follow-ups,
active follow-ups, and recent interactions. Admins also land on a dashboard (Phase 12 covers
the Admin-specific view).

## Dependencies
- Phase 8 ✅ (Customers exist)
- Phase 9 ✅ (Follow-ups exist)
- Phase 10 ✅ (Interactions exist)

---

## Architecture Reference

### Backend — New API Route
From `PHASE_03_ARCHITECTURE.md`, Section 3.6:
```
GET /api/v1/dashboard/se
```
- Auth: `requireAuth` (any authenticated user)
- Data scoping: If `role === 'salesExecutive'` → scoped to their assigned customers. If `role === 'admin'` → not used here (Admin has Phase 12).

### Response Shape
```json
{
  "success": true,
  "data": {
    "summary": {
      "customerCount": 12,
      "followUps": {
        "pending": 4,
        "inProgress": 2,
        "completed": 18,
        "cancelled": 1,
        "overdue": 2,
        "total": 25
      },
      "interactionCount": 30
    },
    "upcomingFollowUps": [...],   // next 7 days, max 5
    "activeFollowUps": [...],     // pending + in-progress, sorted by date, max 5
    "recentInteractions": [...]   // most recent 5
  }
}
```

### New Backend Files
| File | Purpose |
|------|---------|
| `backend/src/controllers/dashboardController.js` | `getSeDashboard()` aggregation handler |
| `backend/src/routes/dashboardRoutes.js` | Mounts `GET /se` and (Phase 12) `GET /admin` |

### New Frontend Files
| File | Purpose |
|------|---------|
| `frontend/src/api/dashboard.js` | `getSeDashboard()` Axios wrapper |
| `frontend/src/pages/SeDashboard.jsx` | SE Dashboard page component |
| `frontend/src/pages/Dashboard.css` | Shared dashboard styles |

### Modified Files
| File | Change |
|------|--------|
| `backend/src/routes/index.js` | Mount `dashboardRoutes` at `/dashboard` |
| `frontend/src/App.jsx` | Replace placeholder `<Dashboard />` with role-aware component |
| `frontend/src/components/Navbar.jsx` | Ensure dashboard nav link points to `/` |

---

## UI Sections (per PHASE_02_UX_DESIGN.md)

### 1. Summary Stat Cards (top row)
| Card | Data Point | Link |
|------|-----------|------|
| My Customers | `summary.customerCount` | `/customers` |
| Pending Follow-ups | `summary.followUps.pending` | `/follow-ups?status=Pending` |
| Overdue | `summary.followUps.overdue` | `/follow-ups?status=Pending` |
| In Progress | `summary.followUps.inProgress` | `/follow-ups?status=In+Progress` |
| Completed | `summary.followUps.completed` | `/follow-ups?status=Completed` |
| Interactions | `summary.interactionCount` | `/interactions` |

### 2. Upcoming Follow-ups Panel (left)
- Shows follow-ups in the **next 7 days** that are Pending or In Progress
- Each row: customer name, date/time, status badge, overdue flag
- Clicking a row goes to the edit page for that follow-up
- Empty state: friendly message + "Schedule One" button

### 3. Active Follow-ups Panel (right)
- Shows all Pending/In Progress follow-ups sorted by date (oldest first)
- Highlights overdue ones with a red left border
- Max 5 rows, link to full list

### 4. Recent Interactions Panel (full width, bottom)
- Most recent 5 interactions for the SE's customers
- Shows: type icon, summary, customer name, date
- Links to `/interactions`

---

## Role-Aware Routing
- `App.jsx` `/` route: checks `user.role`
  - `salesExecutive` → renders `<SeDashboard />`
  - `admin` → renders `<AdminDashboard />` (Phase 12, placeholder until then)

---

## Edge Cases
- **No customers assigned**: `customerCount = 0`, all follow-up counts = 0, empty states shown
- **No follow-ups**: Panels show empty state
- **No interactions**: Panel shows empty state
- **Loading state**: Spinner shown while API call is in flight
- **API error**: Error message displayed, no crash

---

## Files Breakdown

### Already Created (before approval — see note)
> ⚠️ **Note:** In the previous session, the following files were partially created.
> They will be reviewed and finalized in implementation:
> - `backend/src/controllers/dashboardController.js` — `getSeDashboard` written
> - `backend/src/routes/dashboardRoutes.js` — route defined
> - `backend/src/routes/index.js` — dashboard route mounted
> - `frontend/src/api/dashboard.js` — written
> - `frontend/src/pages/SeDashboard.jsx` — written
> - `frontend/src/pages/Dashboard.css` — written

### Still Needed
- [ ] Update `App.jsx` — replace placeholder Dashboard, add role-aware render
- [ ] Review `Navbar.jsx` — verify dashboard link exists and is correct
- [ ] Smoke test: verify `GET /api/v1/dashboard/se` returns expected shape
- [ ] Verify SE dashboard renders correctly in browser for SE and Admin roles

---

## Completion Criteria
- [ ] `GET /api/v1/dashboard/se` returns correct scoped data for SE role
- [ ] `GET /api/v1/dashboard/se` returns all-customer data for Admin role
- [ ] Dashboard page renders for logged-in SE with real data
- [ ] All 6 stat cards display correct counts
- [ ] Upcoming follow-ups panel shows correct upcoming items
- [ ] Active follow-ups panel shows correct active items with overdue highlighting
- [ ] Recent interactions panel shows correct recent items
- [ ] Empty states display correctly when no data
- [ ] Loading and error states handled
- [ ] App.jsx routes `/` to role-aware dashboard
- [ ] `PHASE_11_SE_DASHBOARD.md` created
- [ ] `PHASES.md` and `PROJECT_STATUS.md` updated

---

## Status
- Plan: ✅ Complete (this document)
- Implementation: ⏳ Awaiting approval
- Testing: ⏳ Pending
- Review: ⏳ Pending
- Documentation: ⏳ Pending
