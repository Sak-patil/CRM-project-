# Phase 3 — Architecture & System Design

## Objective
Define the complete technical architecture for the CRM system. This includes database schemas, REST API endpoints, authentication/authorization workflows, project folder structures, and error-handling strategies. This document serves as the technical blueprint for all implementation phases.

---

## 1. Technology Stack

### Frontend
- **Framework:** React 18+ (initialized via Vite for faster builds and modern module resolution).
- **Routing:** React Router v6.
- **State Management:** React Context API for global state (Auth, UI theme). React Query for server state and data fetching/caching.
- **Styling:** Vanilla CSS (CSS Modules or standard stylesheets to maintain full flexibility without heavy frameworks).
- **HTTP Client:** Axios (configured with interceptors for JWT injection and error handling).

### Backend
- **Runtime:** Node.js.
- **Framework:** Express.js.
- **Database:** MongoDB (using Mongoose ODM for schema validation and relationship mapping).
- **Authentication:** JSON Web Tokens (JWT) & bcrypt for password hashing.
- **Validation:** Joi or Zod for API request validation.

---

## 2. Database Schema Design (MongoDB via Mongoose)

### 2.1. `User` Schema
| Field | Type | Constraints | Indexing |
|-------|------|-------------|----------|
| `name` | String | Required | |
| `email` | String | Required, Unique | **Indexed** (Unique) |
| `password` | String | Required | |
| `role` | String | Enum: `['admin', 'salesExecutive']` | |
| `phone` | String | Optional | |

### 2.2. `Customer` Schema
| Field | Type | Constraints | Indexing |
|-------|------|-------------|----------|
| `name` | String | Required | **Indexed** (Text search) |
| `email` | String | Required, Unique | **Indexed** (Unique, Search) |
| `phone` | String | Required | |
| `address` | String | Optional | |
| `assignedTo` | ObjectId(User) | Required | **Indexed** (Querying by SE) |
| `createdBy` | ObjectId(User) | Required | |

### 2.3. `FollowUp` Schema
| Field | Type | Constraints | Indexing |
|-------|------|-------------|----------|
| `customer` | ObjectId(Customer) | Required | **Indexed** (Filtering by Cust) |
| `createdBy` | ObjectId(User) | Required | |
| `date` | Date | Required | **Indexed** (Sorting/Upcoming) |
| `status` | String | Enum: `['Pending', 'In Progress', 'Completed', 'Cancelled']` | **Indexed** |
| `notes` | String | Optional | |

### 2.4. `Interaction` Schema
| Field | Type | Constraints | Indexing |
|-------|------|-------------|----------|
| `customer` | ObjectId(Customer) | Required | **Indexed** |
| `createdBy` | ObjectId(User) | Required | |
| `type` | String | Enum: `['Call', 'Email', 'Meeting']` | |
| `date` | Date | Required | **Indexed** (Timeline sorting) |
| `summary` | String | Required | |
| `notes` | String | Optional | |
| `duration` | Number | Optional (minutes) | |

---

## 3. API Design & Structure

All endpoints will be prefixed with `/api/v1`.

### 3.1. Authentication Routes (`/api/v1/auth`)
- `POST /login`: Authenticate user and issue JWT.
- `GET /me`: Get current authenticated user profile.
- `PUT /me`: Update own profile (name, phone).

### 3.2. User Management Routes (`/api/v1/users`) - *Admin Only*
- `GET /`: List all users (Sales Executives).
- `POST /`: Create a new user.
- `GET /:id`: Get specific user details.
- `PUT /:id`: Update user details.
- `DELETE /:id`: Hard delete user.

### 3.3. Customer Routes (`/api/v1/customers`)
- `GET /`: List customers (Scoped by SE; Admin sees all). Supports query params `?search=term`.
- `POST /`: Create a new customer.
- `GET /:id`: Get specific customer details.
- `PUT /:id`: Update a customer (Admin can reassign `assignedTo`).
- `DELETE /:id`: Delete a customer and associated data (Admin only).

### 3.4. Follow-up Routes (`/api/v1/follow-ups`)
- `GET /`: List follow-ups (Scoped). Supports query params `?status=Pending&customerId=xyz`.
- `POST /`: Create a follow-up.
- `PUT /:id`: Update follow-up (date, notes).
- `PATCH /:id/status`: Update only the status of a follow-up.
- `DELETE /:id`: Delete a follow-up.

### 3.5. Interaction Routes (`/api/v1/interactions`)
- `GET /`: List interactions (Scoped). Supports query params `?customerId=xyz`.
- `POST /`: Log a new interaction.
- `PUT /:id`: Update an interaction.
- `DELETE /:id`: Delete an interaction.

### 3.6. Dashboard Routes (`/api/v1/dashboard`)
- `GET /se`: Get aggregated metrics for SE (counts, upcoming follow-ups).
- `GET /admin`: Get system-wide aggregated metrics.

---

## 4. Authentication & Authorization Strategy

### Authentication Flow (JWT)
1. User submits email/password to `POST /api/v1/auth/login`.
2. Backend verifies credentials against hashed password.
3. Backend generates a JWT containing `{ userId, role }` and signs it with `JWT_SECRET`.
4. Token is sent to the client in the JSON response payload (or HTTP-only cookie, depending on deployment preference; standard payload strategy will be used initially).
5. Client stores token (localStorage/sessionStorage).
6. Client attaches token to the `Authorization: Bearer <token>` header for all subsequent API requests.

### Authorization Middleware
- `requireAuth`: Middleware to verify the JWT. Extracts user ID and fetches the user from DB to attach to `req.user`. Returns 401 if invalid.
- `requireRole(role)`: Middleware to check if `req.user.role === role`. Returns 403 if unauthorized.
- **Resource Ownership Check:** In controllers (e.g., `customersController`), a check will ensure that if `req.user.role === 'salesExecutive'`, the operation is strictly limited to records where `assignedTo === req.user._id`.

---

## 5. Project Folder Structure

### Backend (`/backend`)
```
/backend
├── /config         # Database connection, env validation
├── /controllers    # Route logic and response formatting
├── /middlewares    # Auth, role checking, error handling
├── /models         # Mongoose schemas
├── /routes         # API endpoint definitions mapping to controllers
├── /utils          # Helper functions (e.g., error classes)
├── server.js       # Express app initialization
└── .env            # Environment variables
```

### Frontend (`/frontend`)
```
/frontend
├── /public         # Static assets
├── /src
│   ├── /api        # Axios instance and API call wrappers
│   ├── /assets     # Images, global CSS
│   ├── /components # Reusable UI components (Buttons, Inputs, Modals)
│   ├── /context    # React Context (AuthContext)
│   ├── /hooks      # Custom hooks (e.g., useAuth)
│   ├── /pages      # Route components (Login, Dashboard, CustomersList)
│   ├── /utils      # Helpers (date formatting, token parsing)
│   ├── App.jsx     # Main app component with React Router setup
│   └── main.jsx    # React DOM render entry
└── vite.config.js  # Vite configuration
```

---

## 6. Error Handling & Configuration

### API Standardized Response Format
**Success Response:**
```json
{
  "success": true,
  "data": { ... } // Single object or array
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "details": [...] // Optional validation details
  }
}
```

### Backend Error Strategy
- Use a central `errorHandler` middleware.
- Create a custom `AppError` class extending `Error` to attach HTTP status codes.
- Catch all async errors using an `asyncHandler` wrapper to prevent server crashes and send them to the central error middleware.

### Environment Variables
- `PORT`: API server port.
- `MONGO_URI`: MongoDB connection string.
- `JWT_SECRET`: Secret key for signing tokens.
- `JWT_EXPIRES_IN`: Token validity duration (e.g., `7d`).
- `ADMIN_SEED_EMAIL` / `ADMIN_SEED_PASSWORD`: Credentials for the initial Admin seed script.

---

## STATUS

## Plan: ✅ Complete
## Implementation: ✅ Complete (documentation phase — no code)
## Testing: N/A (no code to test)
## Review: ✅ Complete
## Documentation: ✅ This document
