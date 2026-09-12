# Phase 7 — User Management

## Objective
Implement Admin-side user management — creating, viewing, editing, and deactivating Sales Executive accounts. Also includes the Sales Executive profile management capability.

## Overview
This module gives the Administrator complete control over the system's users (Sales Executives). The Admin can view the list of users, create new ones, edit their details, and hard delete them (provided they have no assigned customers). Sales Executives can also view and edit their own profiles through a separate interface.

## Architecture & API Routes
Based on `PHASE_03_ARCHITECTURE.md`, the backend API routing is strictly segregated:

### 1. User Management (Admin Only) - `/api/v1/users`
All endpoints under this route require `admin` privileges.
- `GET /api/v1/users`: List all users (Sales Executives).
- `POST /api/v1/users`: Create a new user (already partially implemented).
- `GET /api/v1/users/:id`: Get specific user details.
- `PUT /api/v1/users/:id`: Update user details (name, email, phone, role).
- `DELETE /api/v1/users/:id`: Hard delete user. Prevented if they have assigned customers.

### 2. Profile Management (All Users) - `/api/v1/auth`
- `GET /api/v1/auth/me`: Get current authenticated user profile (already implemented).
- `PUT /api/v1/auth/me`: Update own profile (name, phone).

## Frontend Screens & UX
Based on `PHASE_02_UX_DESIGN.md`, the frontend will include the following screens:

### Admin Screens
- **User List (`/admin/users`)**: Table view of all Sales Executives.
- **Create User (`/admin/users/new`)**: Form to create a new SE.
- **Edit User (`/admin/users/:id/edit`)**: Form to edit an existing SE.

### Sales Executive Screens
- **My Profile (`/se/profile`)**: View and edit own basic info (Name, Phone).

## Edge Cases
- **Deletion Prevention**: Deleting a Sales Executive who currently has active customers assigned to them creates orphan records. The system will prevent user deletion if they still have customers assigned. The Admin must reassign the customers to another Sales Executive first before deleting the user.
- **Email Uniqueness**: Ensuring that updates to emails don't conflict with existing users.
- **Self Deletion**: Admins cannot delete themselves via the UI.
