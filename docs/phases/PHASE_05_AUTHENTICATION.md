# Phase 5 — Authentication & Authorization

## Status: COMPLETED

## Objective
Implement the complete authentication and authorization system — login, JWT management, role-based middleware, and protected routes on both backend and frontend.

## Key Accomplishments

### Backend
1. **User Model:** Created `User.js` with `name`, `email`, `password`, `role`, and `phone` fields. Integrated `bcryptjs` for secure password hashing using a Mongoose `pre('save')` hook.
2. **Middleware:** 
   - Created `requireAuth` to verify JWT tokens and inject `req.user`.
   - Created `requireRole` to restrict routes based on `admin` or `salesExecutive` roles.
3. **Controllers & Routes:**
   - Auth endpoints (`POST /api/v1/auth/login` and `GET /api/v1/auth/me`).
   - Admin-only User creation endpoint (`POST /api/v1/users`).
4. **Seed Script:** Implemented `seedAdmin.js` to create the initial admin user from `.env` credentials, avoiding the need for an open registration endpoint.

### Frontend
1. **Context & State:** Created `AuthContext.jsx` to manage global user state and token persistence in `localStorage`, consumed via the custom `useAuth` hook.
2. **API Interceptor:** Updated `axiosInstance.js` to automatically attach the `Authorization: Bearer <token>` header to all requests when logged in.
3. **Routing:** 
   - Created a responsive `Login.jsx` page.
   - Built a `ProtectedRoute.jsx` component that blocks unauthenticated users and redirects them to the login screen.
   - Restructured `App.jsx` to wrap the app in the `AuthProvider` and configure routes using `react-router-dom`.

## Next Steps
Proceeding to Phase 6: Tracer Bullet (End-to-End Validation), where we will build a minimal feature testing the entire full-stack flow through this authentication system.
