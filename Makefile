# =============================================================================
# Makefile — Task Automation for the Monorepo
# =============================================================================
# A Makefile defines shortcuts (called "targets") for common commands.
# Instead of remembering long commands, you just type `make <target>`.
#
# How it works:
#   - Each target (e.g., `dev`, `test`) has a name, optional dependencies,
#     and one or more shell commands (indented with a TAB, not spaces).
#   - Running `make dev` executes the commands under the `dev:` target.
#   - .PHONY tells make these targets are commands, not file names.
#     Without it, if a file called "test" existed, `make test` would
#     think it's already up to date and skip running the commands.
# =============================================================================

# Declare all targets as "phony" (not tied to files).
.PHONY: dev dev-backend dev-frontend test lint docker-up docker-down clean

# --- Development Targets ---

# `make dev` — Start both backend and frontend simultaneously.
# The -j2 flag runs two targets in parallel (like opening two terminals).
# $(MAKE) is a special variable that refers to the `make` command itself.
dev:
	$(MAKE) -j2 dev-backend dev-frontend

# `make dev-backend` — Start the FastAPI backend with hot reload.
# - `cd backend` moves into the backend directory.
# - `uv run` runs a command inside the project's virtual environment.
# - `uvicorn` is the ASGI server that serves the FastAPI app.
# - `app.main:app` tells uvicorn to look for the `app` variable in app/main.py.
# - `--reload` watches for file changes and auto-restarts the server.
# - `--port 8000` serves on http://localhost:8000.
dev-backend:
	cd backend && uv run uvicorn app.main:app --reload --port 8000

# `make dev-frontend` — Start the Vite development server for the React frontend.
# - `npm run dev` executes the "dev" script defined in package.json.
# - Vite serves the frontend at http://localhost:5173 with hot module replacement
#   (changes appear in the browser instantly without a full page reload).
dev-frontend:
	cd frontend && npm run dev

# --- Quality Targets ---

# `make test` — Run the backend test suite using pytest.
# pytest discovers all files named test_*.py and runs the test functions inside.
test:
	cd backend && uv run pytest

# `make lint` — Check code quality without modifying files.
# - `ruff check .` looks for code style issues and potential bugs.
# - `ruff format --check .` verifies formatting without changing files.
#   (Use `ruff format .` without --check to actually format the code.)
lint:
	cd backend && uv run ruff check . && uv run ruff format --check .

# --- Docker Targets ---

# `make docker-up` — Build images and start all services with Docker Compose.
# The --build flag rebuilds images if Dockerfiles or source code have changed.
docker-up:
	docker compose up --build

# `make docker-down` — Stop and remove all Docker Compose services and networks.
docker-down:
	docker compose down

# --- Cleanup Target ---

# `make clean` — Remove all generated files and caches to start fresh.
# - __pycache__:    Python's compiled bytecode cache.
# - .pytest_cache:  pytest's cache for test session data.
# - .ruff_cache:    ruff's cache for faster subsequent runs.
# - backend/.venv:  Python virtual environment created by uv.
# - node_modules:   Downloaded npm packages.
# - frontend/dist:  Vite's production build output.
# The `2>/dev/null || true` suppresses errors if directories don't exist.
clean:
	find . -type d -name __pycache__ -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .pytest_cache -exec rm -rf {} + 2>/dev/null || true
	find . -type d -name .ruff_cache -exec rm -rf {} + 2>/dev/null || true
	rm -rf backend/.venv
	rm -rf frontend/node_modules
	rm -rf frontend/dist
