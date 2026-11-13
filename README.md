# ClientFlow CRM

ClientFlow is a full-stack, role-based Customer Relationship Management application. It helps a business manage customer information, assign customers to Sales Executives, schedule follow-ups, record customer interactions, and monitor sales activity.

## Live Demo

- **Frontend:** [crm-project-1frontend.onrender.com](https://crm-project-1frontend.onrender.com)
- **Backend API:** [crm-project-335d.onrender.com](https://crm-project-335d.onrender.com)
- **API health check:** [crm-project-335d.onrender.com/api/v1/health](https://crm-project-335d.onrender.com/api/v1/health)

## User Roles

### Admin

- Manage Sales Executive accounts
- View and manage all customers
- Assign or reassign customers
- Monitor follow-ups, interactions, and team progress
- View system-wide dashboard information

### Sales Executive

- View assigned customers
- Create and update customer follow-ups
- Record customer interactions
- Track pending, in-progress, completed, and overdue work
- Receive real-time notifications when customers are assigned

## Core Features

- JWT-based login and protected routes
- Role-based authorization
- Customer CRUD operations
- Customer search by name or email
- Follow-up management with Kanban-style status columns
- Overdue follow-up filtering
- Interaction history for calls, emails, and meetings
- Admin and Sales Executive dashboards
- Customer assignment notifications using Socket.IO
- MongoDB persistence through Mongoose
- Docker support for local and production-like execution

## Architecture

```text
React frontend
      │
      ├── Axios HTTP requests
      └── Socket.IO live connection
                │
                ▼
Express backend API
      │
      ├── JWT authentication and role authorization
      ├── Controllers and routes
      └── Mongoose models
                │
                ▼
          MongoDB Atlas
```

### Request flow

```text
React component
→ API helper
→ Axios
→ Express route
→ Authentication middleware
→ Controller
→ Mongoose model
→ MongoDB
→ JSON response
→ React state update
```

## Technology Stack

### Frontend

- React
- React Router
- Axios
- Socket.IO Client
- Vite
- Nginx for the Docker production image

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens
- bcryptjs
- Socket.IO
- Helmet, CORS, rate limiting, and Morgan

## Project Structure

```text
frontend/
  src/
    api/          HTTP API helpers
    components/   Reusable UI components
    context/      Authentication state
    pages/        Application screens

backend/
  src/
    config/       Database configuration
    controllers/  Business logic
    middleware/   Authentication and error handling
    models/       MongoDB schemas
    routes/       API route definitions
    utils/        Shared backend utilities
  server.js       Express and Socket.IO entry point

docker-compose.yml
```

## Local Development

Keep the backend environment variables in `backend/.env`. Do not commit that file.

### Start the backend

```bash
cd backend
npm install
npm run dev
```

The backend runs at `http://localhost:5000`.

### Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs at `http://localhost:5173`.

## Docker

Start the frontend and backend containers from the project root:

```bash
docker compose up --build -d
```

Open `http://localhost:5173`.

Stop the containers:

```bash
docker compose down
```

## Deployment

The application is deployed on Render as two services:

1. A Node.js Web Service for the backend API and Socket.IO.
2. A Static Site for the React frontend.

The frontend uses these deployment variables:

```text
VITE_API_URL=https://crm-project-335d.onrender.com/api/v1
VITE_SOCKET_URL=https://crm-project-335d.onrender.com
```

The backend uses `FRONTEND_URL` to configure Socket.IO access for the deployed frontend.

Environment variables and credentials must be configured in the deployment platform. Never commit secrets to the repository.
