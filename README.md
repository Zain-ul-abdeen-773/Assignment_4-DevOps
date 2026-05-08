# AI-Model-Registry

Enterprise-grade registry for AI models with a React + Express + PostgreSQL stack.

## Prerequisites
- Node.js 18+
- PostgreSQL 14+
- `psql` on your PATH

## Setup

### 1) Install dependencies (monorepo)
```bash
npm install
```

### 2) Configure PostgreSQL credentials
Copy the example and update as needed:
```bash
cp server/.env.example server/.env
```

### 3) Create databases
```bash
psql -U postgres -c "CREATE DATABASE ai_model_registry;"
psql -U postgres -c "CREATE DATABASE ai_model_registry_test;"
```

### 4) Initialize schema + seed data
```bash
npm --prefix server run db:init
npm --prefix server run db:seed
```

### 5) Run backend unit tests
```bash
npm --prefix server run test
```

### 6) Run linting
```bash
npm run lint
```

### 7) Start the full stack (frontend + backend)
```bash
npm run dev
```

Frontend: http://localhost:5173
Backend: http://localhost:5000

## CI/CD and Deployment
- EC2 setup steps are in [docs/deployment.md](docs/deployment.md)
- GitHub Actions workflow and secret setup are in [docs/ci-cd.md](docs/ci-cd.md)
- Assignment checklist is in [docs/assignment-checklist.md](docs/assignment-checklist.md)

## Optional
- Start backend only: `npm --prefix server run dev`
- Start frontend only: `npm --prefix client run dev`
- Build frontend: `npm --prefix client run build`
