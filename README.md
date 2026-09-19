# VertexLearn AI

An AI-powered Learning Management System (LMS) built with React, Node.js, FastAPI, PostgreSQL, and Docker.

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Frontend     | React 18 + TypeScript + Vite        |
| Styling      | Tailwind CSS                        |
| Backend      | Node.js + Express + TypeScript      |
| AI Service   | Python + FastAPI                    |
| Database     | PostgreSQL + pgvector               |
| Cache/Queue  | Redis                               |
| Object Store | MinIO                               |
| Container    | Docker + Docker Compose             |

## Local Setup

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+)
- [Node.js](https://nodejs.org/) v20+ (for local frontend/backend dev)
- [Python](https://www.python.org/) 3.11+ (for local AI service dev)

### 1. Clone and configure environment

```bash
git clone <repo-url>
cd vertexlearn-ai
cp .env.example .env
# Edit .env with your values (at minimum change passwords)
```

### 2. Start everything with Docker Compose

```bash
cd infra
docker compose up --build
```

Services will be available at:

| Service      | URL                        |
|--------------|----------------------------|
| Frontend     | http://localhost:5173      |
| Backend API  | http://localhost:4000      |
| AI Service   | http://localhost:8000      |
| MinIO UI     | http://localhost:9001      |
| PostgreSQL   | localhost:5432             |
| Redis        | localhost:6379             |

### 3. Health checks

```bash
curl http://localhost:4000/health
curl http://localhost:8000/health
```

### Running services individually (dev mode)

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

**Backend**
```bash
cd backend
npm install
npm run dev
```

**AI Service**
```bash
cd ai-service
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## Project Structure

```
vertexlearn-ai/
├── frontend/          # React + Vite SPA
├── backend/           # Express API server
├── ai-service/        # FastAPI AI microservice
├── infra/             # Docker Compose, Nginx, K8s, Terraform
├── docs/              # PRD, API spec, architecture docs
└── .github/workflows/ # CI/CD pipelines
```

## Contributing

See `docs/` for the PRD and architecture documentation.
