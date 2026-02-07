# React + FastAPI Monorepo

A full-stack monorepo with a React (TypeScript) frontend and Python FastAPI backend.

## Prerequisites

- Python 3.12+
- Node.js 20+
- [uv](https://docs.astral.sh/uv/) (Python package manager)

## Quick Start

```bash
# Clone the repository
git clone <repo-url> && cd <repo-name>

# Set up backend
cd backend
uv sync
cd ..

# Set up frontend
cd frontend
npm install
cd ..

# Copy environment file
cp .env.example .env

# Run both services
make dev
```

The frontend will be available at `http://localhost:5173` and the backend at `http://localhost:8000`.

## Available Commands

| Command            | Description                                      |
| ------------------ | ------------------------------------------------ |
| `make dev`         | Run both frontend and backend concurrently       |
| `make dev-backend` | Run backend only with hot reload                 |
| `make dev-frontend`| Run frontend only                                |
| `make test`        | Run backend tests                                |
| `make lint`        | Run ruff check and format check on backend       |
| `make docker-up`   | Build and start all services with Docker Compose |
| `make docker-down` | Stop all Docker Compose services                 |
| `make clean`       | Remove build artifacts and caches                |

## Docker

```bash
# Start all services
make docker-up

# Stop all services
make docker-down
```

To enable PostgreSQL, uncomment the `db` service in `docker-compose.yml`.

## Project Structure

```
├── frontend/           # React + TypeScript (Vite)
│   ├── src/
│   │   ├── App.tsx     # Main app component
│   │   ├── main.tsx    # Entry point
│   │   └── api/
│   │       └── client.ts   # Typed API fetch wrapper
│   ├── vite.config.ts  # Vite config with API proxy
│   └── package.json
├── backend/            # Python FastAPI
│   ├── app/
│   │   ├── main.py     # FastAPI app with CORS
│   │   ├── config.py   # Pydantic settings
│   │   └── routers/
│   │       └── health.py   # Health check endpoint
│   ├── tests/
│   │   └── test_health.py
│   └── pyproject.toml
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
└── Makefile
```
