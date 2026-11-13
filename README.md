# CRM Project

ClientFlow is a role-based customer relationship management application for managing customers, follow-ups, interactions, and Sales Executive progress.

## Deployed Application

- Frontend: [https://crm-project-1frontend.onrender.com](https://crm-project-1frontend.onrender.com)
- Backend API: [https://crm-project-335d.onrender.com](https://crm-project-335d.onrender.com)
- Backend health check: [https://crm-project-335d.onrender.com/api/v1/health](https://crm-project-335d.onrender.com/api/v1/health)

## Main Features

- Admin and Sales Executive roles
- Customer management
- Follow-up tracking with overdue filtering
- Interaction history
- Role-specific dashboards
- Real-time customer assignment notifications

## Local Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The local frontend runs at `http://localhost:5173`.

## Docker

Start both containers from the project root:

```bash
docker compose up --build -d
```

The Docker frontend runs at `http://localhost:5173`.

Stop the containers:

```bash
docker compose down
```

Keep environment variables and secrets in environment configuration files or deployment settings. Do not commit secrets to the repository.
