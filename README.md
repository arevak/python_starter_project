# React + FastAPI Monorepo

A full-stack monorepo with a React (TypeScript) frontend and Python FastAPI backend.

## Prerequisites (manual setup only)

> **Skip this section** if you're using the Dev Container — everything is pre-installed inside the container.

Install the following on your machine:

- **Python 3.12+** — [python.org downloads](https://www.python.org/downloads/) or via a version manager like [pyenv](https://github.com/pyenv/pyenv)
- **Node.js 20+** — [nodejs.org downloads](https://nodejs.org/) (the LTS version) or via [nvm](https://github.com/nvm-sh/nvm)
- **uv** (fast Python package manager):
  ```bash
  # macOS / Linux
  curl -LsSf https://astral.sh/uv/install.sh | sh

  # Windows (PowerShell)
  powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"
  ```
- **make** — pre-installed on macOS and most Linux distros. On Windows, install via `choco install make` or use Git Bash.

## Quick Start (Dev Container — recommended for beginners)

### 1. Install the required software

| Tool | What it does | Install link |
| ---- | ------------ | ------------ |
| **VS Code** | Code editor | [Download VS Code](https://code.visualstudio.com/) |
| **Docker Desktop** | Runs containers on your machine | [Download Docker Desktop](https://www.docker.com/products/docker-desktop/) |
| **Dev Containers extension** | Lets VS Code work inside a container | [Install from Marketplace](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers) |

> **Windows users:** Docker Desktop will prompt you to enable WSL 2 during installation — follow the prompts and restart when asked.

### 2. Open the project in the container

1. Clone this repo and open the folder in VS Code.
2. When prompted **"Reopen in Container"**, click it (or run **Dev Containers: Reopen in Container** from the Command Palette with `Ctrl+Shift+P` / `Cmd+Shift+P`).
3. Wait for the container to build — all dependencies (Python, Node.js, uv, npm packages) install automatically.

### 3. Start developing

Open the VS Code integrated terminal and run:

```bash
make dev
```

The frontend opens at `http://localhost:5173` and the backend API is at `http://localhost:8000`.

That's it — no need to install Python, Node.js, or any tools on your machine.

## Quick Start (manual)

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
