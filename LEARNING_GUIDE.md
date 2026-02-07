# Learning Guide: Full-Stack Web Development with React + FastAPI

A structured, exercise-driven curriculum that walks you through this codebase piece by piece. Each exercise builds on the previous one, gradually introducing new concepts until you understand the entire stack.

**How to use this guide:**
- Work through the exercises in order — they build on each other.
- Each exercise has a **Goal**, **Concepts**, **Steps**, and a **Verify** section.
- Try each exercise yourself before looking at hints or solutions.
- The existing code in this repo is heavily commented — read the comments as you go.

**Prerequisites:** This guide assumes you can open a terminal and run basic commands. No prior web development experience is required.

---

## Module 1: Understanding the Development Environment

### Exercise 1.1 — Explore the Project Structure

**Goal:** Get a mental map of what lives where in this monorepo.

**Concepts:** Monorepo architecture, separation of concerns, project layout conventions.

**Steps:**

1. Open a terminal in the project root directory.
2. List the top-level files and directories. Notice how the project separates `backend/` (Python) and `frontend/` (JavaScript/TypeScript) into distinct folders.
3. Look at these key files and what they do:

   | File/Directory | Purpose |
   |---|---|
   | `backend/` | Python FastAPI API server |
   | `frontend/` | React TypeScript UI application |
   | `Makefile` | Shortcuts for common commands |
   | `docker-compose.yml` | Multi-container orchestration |
   | `Dockerfile.backend` | Container image for the backend |
   | `Dockerfile.frontend` | Container image for the frontend |
   | `.devcontainer/` | VS Code Dev Container configuration |
   | `.env.example` | Template for environment variables |
   | `README.md` | Project documentation |
   | `TUTORIAL.md` | Hands-on chatbot tutorial |

4. Now explore the backend directory structure:
   ```
   backend/
   ├── app/              ← Application code
   │   ├── __init__.py   ← Makes this directory a Python package
   │   ├── config.py     ← Centralized settings
   │   ├── main.py       ← FastAPI app creation and wiring
   │   └── routers/      ← API endpoint definitions
   │       ├── __init__.py
   │       └── health.py ← Health check endpoint
   ├── tests/            ← Test files
   │   └── test_health.py
   └── pyproject.toml    ← Python dependencies and metadata
   ```

5. And the frontend directory structure:
   ```
   frontend/
   ├── src/              ← Application source code
   │   ├── App.tsx       ← Main React component
   │   ├── App.css       ← Component styles
   │   ├── main.tsx      ← Entry point (mounts React)
   │   ├── index.css     ← Global styles
   │   └── api/
   │       └── client.ts ← Typed API fetch helper
   ├── index.html        ← HTML template
   ├── vite.config.ts    ← Vite bundler + proxy configuration
   └── package.json      ← Node.js dependencies
   ```

**Verify:** Can you answer these questions?
- Which directory contains the Python API code?
- Which file is the entry point for the FastAPI application?
- Where are the React components located?
- What file defines the shortcuts for `make dev`, `make test`, etc.?

<details>
<summary>Answers</summary>

- `backend/app/`
- `backend/app/main.py`
- `frontend/src/`
- `Makefile`

</details>

---

### Exercise 1.2 — Read the Makefile

**Goal:** Understand what each `make` command does before you run anything.

**Concepts:** Makefiles, task automation, development workflows.

**Steps:**

1. Open `Makefile` in your editor and read the comments.
2. For each target, identify what shell command it actually runs:

   | Command | What it does | Actual shell command |
   |---|---|---|
   | `make dev` | Starts both services in parallel | `$(MAKE) -j2 dev-backend dev-frontend` |
   | `make dev-backend` | ? | ? |
   | `make dev-frontend` | ? | ? |
   | `make test` | ? | ? |
   | `make lint` | ? | ? |
   | `make clean` | ? | ? |

3. Fill in the table yourself before checking the answer.

**Verify:** Fill in all the "?" cells.

<details>
<summary>Answers</summary>

| Command | What it does | Actual shell command |
|---|---|---|
| `make dev-backend` | Starts FastAPI with hot reload | `cd backend && uv run uvicorn app.main:app --reload --port 8000` |
| `make dev-frontend` | Starts Vite dev server | `cd frontend && npm run dev` |
| `make test` | Runs pytest | `cd backend && uv run pytest` |
| `make lint` | Checks Python code quality | `cd backend && uv run ruff check . && uv run ruff format --check .` |
| `make clean` | Removes caches and build artifacts | (multiple `find` and `rm` commands) |

</details>

---

### Exercise 1.3 — Set Up and Start the Application

**Goal:** Get the application running and see it in your browser.

**Concepts:** Package managers (uv, npm), virtual environments, development servers.

**Steps:**

1. Install backend dependencies:
   ```bash
   cd backend && uv sync && cd ..
   ```
   `uv sync` reads `pyproject.toml`, creates a virtual environment, and installs all packages.

2. Install frontend dependencies:
   ```bash
   cd frontend && npm install && cd ..
   ```
   `npm install` reads `package.json` and downloads packages into `node_modules/`.

3. Create your environment file:
   ```bash
   cp .env.example .env
   ```

4. Start both services:
   ```bash
   make dev
   ```

5. Open your browser to `http://localhost:5173`. You should see the React app displaying the health status from the backend.

6. In a separate terminal, test the backend API directly:
   ```bash
   curl http://localhost:8000/api/health
   ```
   You should see: `{"status":"ok","version":"0.1.0"}`

**Verify:**
- The frontend at `http://localhost:5173` shows "Status: ok" and "Version: 0.1.0".
- The curl command returns JSON with `status: "ok"`.

---

## Module 2: Understanding the Backend (Python + FastAPI)

### Exercise 2.1 — Read the Configuration System

**Goal:** Understand how application settings are managed.

**Concepts:** Environment variables, `.env` files, Pydantic BaseSettings, type safety.

**Steps:**

1. Open `backend/app/config.py` and read all comments carefully.
2. Answer these questions:
   - What Python library provides the `BaseSettings` class?
   - What happens if you don't set the `APP_NAME` environment variable?
   - How does Pydantic know to read from a `.env` file?
   - If you added a field `database_url: str = ""`, what environment variable would populate it?

3. Open `.env.example` and compare it with the `Settings` class. Notice how each variable in `.env.example` maps to a field in `Settings`.

4. **Experiment:** Change the `APP_NAME` value in your `.env` file to something like `"My Awesome App"`. Restart the backend (`make dev-backend`) and visit `http://localhost:8000/docs`. The Swagger UI title should reflect your change.

**Verify:**
<details>
<summary>Answers</summary>

- `pydantic_settings` (the `pydantic-settings` package).
- It uses the default value `"My App"`.
- The `model_config` dictionary has an `"env_file"` key that specifies the path.
- `DATABASE_URL` (Pydantic matches field names to env vars case-insensitively, converting underscores).

</details>

---

### Exercise 2.2 — Trace a Request Through the Backend

**Goal:** Follow the path of an HTTP request from start to finish.

**Concepts:** FastAPI app creation, middleware, routers, request lifecycle.

**Steps:**

1. Open `backend/app/main.py` and read all comments.
2. Trace what happens when a browser sends `GET /api/health`:

   ```
   Step 1: The request arrives at the FastAPI `app` instance.
   Step 2: __________ middleware processes the request first.
   Step 3: FastAPI matches the URL /api/health to a registered __________.
   Step 4: The __________ function in health.py handles the request.
   Step 5: The function returns a Python dict, which FastAPI converts to __________.
   Step 6: The __________ middleware adds headers to the response.
   Step 7: The response is sent back to the browser.
   ```

3. Open `backend/app/routers/health.py` and read the comments.
4. Notice how the router has no `/api` prefix — that's added in `main.py` when registering:
   ```python
   app.include_router(health.router, prefix="/api")
   ```

**Verify:** Fill in all the blanks.

<details>
<summary>Answers</summary>

1. The request arrives at the FastAPI `app` instance.
2. **CORS** middleware processes the request first.
3. FastAPI matches the URL /api/health to a registered **router**.
4. The **health_check** function in health.py handles the request.
5. The function returns a Python dict, which FastAPI converts to **JSON**.
6. The **CORS** middleware adds headers to the response.
7. The response is sent back to the browser.

</details>

---

### Exercise 2.3 — Understand the Lifespan Pattern

**Goal:** Learn how FastAPI handles startup and shutdown events.

**Concepts:** Async context managers, `yield`, application lifecycle.

**Steps:**

1. Look at the `lifespan` function in `backend/app/main.py`:
   ```python
   @asynccontextmanager
   async def lifespan(app: FastAPI):
       # Startup logic goes here
       yield
       # Shutdown logic goes here
   ```

2. This is an **async context manager**. The key idea:
   - Code **before** `yield` runs when the server starts.
   - Code **after** `yield` runs when the server shuts down.
   - `yield` is the point where the server is "running" and handling requests.

3. **Thought exercise:** If you needed to connect to a database at startup and disconnect at shutdown, where would each line go? Write pseudocode:
   ```python
   @asynccontextmanager
   async def lifespan(app: FastAPI):
       # Where does db = await connect_to_database() go?
       yield
       # Where does await db.disconnect() go?
   ```

**Verify:** You understand that `yield` separates startup from shutdown, and that this pattern ensures cleanup always runs, even if the server crashes.

---

### Exercise 2.4 — Understand CORS Middleware

**Goal:** Learn why CORS exists and how it's configured.

**Concepts:** Cross-Origin Resource Sharing, browser security model, middleware.

**Steps:**

1. Read the CORS middleware configuration in `backend/app/main.py`.
2. Research the concept: When your frontend (`localhost:5173`) makes a request to the backend (`localhost:8000`), the browser considers this a "cross-origin" request because the ports are different.
3. Without CORS headers, the browser blocks the response (even though the server sent it successfully). CORS middleware adds headers like `Access-Control-Allow-Origin` that tell the browser "this is allowed."
4. Look at the `cors_origins` setting in `config.py`. It defaults to `["http://localhost:5173"]`. This means only the Vite dev server is allowed to make cross-origin requests.

5. **Thought exercise:** In production, what would you set `cors_origins` to? Think about what URL your frontend would be deployed at.

**Verify:** You can explain in your own words why CORS exists and why the backend needs to explicitly allow the frontend's origin.

---

### Exercise 2.5 — Write and Run Your First Test

**Goal:** Understand how the existing test works, then write a new one.

**Concepts:** pytest, async testing, ASGI transport, assertions.

**Steps:**

1. Open `backend/tests/test_health.py` and read all comments.
2. Run the existing test:
   ```bash
   make test
   ```
   You should see `1 passed`.

3. Understand the testing pattern:
   - `ASGITransport(app=app)` connects the test client directly to your FastAPI app (no real HTTP server needed).
   - `AsyncClient` sends requests through that transport.
   - `assert` statements verify the response.

4. **Your turn:** Add a second test to `test_health.py` that verifies the health endpoint returns the correct `Content-Type` header. Here's a skeleton:

   ```python
   @pytest.mark.asyncio
   async def test_health_returns_json_content_type():
       transport = ASGITransport(app=app)
       async with AsyncClient(transport=transport, base_url="http://test") as client:
           response = await client.get("/api/health")

       # TODO: Assert that the content-type header contains "application/json"
       # Hint: response.headers["content-type"] gives you the header value
   ```

5. Run the tests again. Both should pass.

**Verify:**

<details>
<summary>Solution</summary>

```python
@pytest.mark.asyncio
async def test_health_returns_json_content_type():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/health")

    assert "application/json" in response.headers["content-type"]
```

</details>

---

### Exercise 2.6 — Create a New API Endpoint

**Goal:** Build a new endpoint from scratch, following the existing patterns.

**Concepts:** APIRouter, route decorators, JSON responses, router registration.

**Steps:**

1. Create a new file: `backend/app/routers/info.py`
2. Following the pattern in `health.py`, create:
   - An `APIRouter` instance.
   - A `GET /info` endpoint that returns:
     ```json
     {
       "project": "React + FastAPI Starter",
       "python_version": "3.12",
       "framework": "FastAPI"
     }
     ```

3. Register the router in `main.py`:
   - Import the `info` module.
   - Add `app.include_router(info.router, prefix="/api")`.

4. Test it with curl:
   ```bash
   curl http://localhost:8000/api/info
   ```

5. **Bonus:** Write a test for your new endpoint in `backend/tests/test_info.py`.

**Verify:**

<details>
<summary>Solution — info.py</summary>

```python
from fastapi import APIRouter

router = APIRouter()


@router.get("/info")
async def get_info():
    return {
        "project": "React + FastAPI Starter",
        "python_version": "3.12",
        "framework": "FastAPI",
    }
```

</details>

<details>
<summary>Solution — main.py changes</summary>

Add to imports:
```python
from app.routers import health, info
```

Add after the health router registration:
```python
app.include_router(info.router, prefix="/api")
```

</details>

<details>
<summary>Solution — test_info.py</summary>

```python
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_get_info():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.get("/api/info")

    assert response.status_code == 200
    data = response.json()
    assert data["framework"] == "FastAPI"
```

</details>

---

## Module 3: Understanding the Frontend (React + TypeScript)

### Exercise 3.1 — Trace How React Mounts to the Page

**Goal:** Understand the chain from HTML to React rendering.

**Concepts:** DOM, React root, entry points, StrictMode.

**Steps:**

1. Open `frontend/index.html`. Find the `<div id="root"></div>` element — this is the empty container where React will render the entire application.

2. Open `frontend/src/main.tsx` and read the comments. This is the first JavaScript that runs. It:
   - Finds the `#root` div in the HTML.
   - Creates a React "root" inside it.
   - Tells React to render the `<App />` component.

3. Trace the rendering chain:
   ```
   Browser loads index.html
     → index.html has <script> pointing to main.tsx
       → main.tsx creates a React root in <div id="root">
         → main.tsx renders <App /> inside that root
           → App.tsx defines what the user actually sees
   ```

4. **Thought exercise:** What is `StrictMode` and why is it useful? (Hint: read the comments in `main.tsx`.)

**Verify:** You can explain the journey from HTML file to visible UI.

---

### Exercise 3.2 — Understand React State with useState

**Goal:** Learn how React manages data that changes over time.

**Concepts:** useState hook, state variables, re-rendering, TypeScript generics.

**Steps:**

1. Open `frontend/src/App.tsx` and read the comments.
2. Find the two `useState` calls:
   ```tsx
   const [health, setHealth] = useState<HealthResponse | null>(null);
   const [error, setError] = useState<string | null>(null);
   ```

3. For each, identify:
   - The **state variable** (the current value).
   - The **setter function** (used to update the value).
   - The **initial value** (passed to `useState`).
   - The **TypeScript type** (in the angle brackets).

4. **Key concept:** When you call a setter (like `setHealth(data)`), React:
   - Stores the new value.
   - Re-renders the component with the new value.
   - The UI updates automatically.

5. Fill in this table:

   | | State Variable | Setter | Initial Value | Type |
   |---|---|---|---|---|
   | Health data | ? | ? | ? | ? |
   | Error message | ? | ? | ? | ? |

**Verify:**

<details>
<summary>Answers</summary>

| | State Variable | Setter | Initial Value | Type |
|---|---|---|---|---|
| Health data | `health` | `setHealth` | `null` | `HealthResponse \| null` |
| Error message | `error` | `setError` | `null` | `string \| null` |

</details>

---

### Exercise 3.3 — Understand useEffect and API Calls

**Goal:** Learn how React loads data when a component first appears.

**Concepts:** useEffect hook, side effects, dependency arrays, Promise chains.

**Steps:**

1. Look at the `useEffect` call in `App.tsx`:
   ```tsx
   useEffect(() => {
     apiFetch<HealthResponse>('/health')
       .then(setHealth)
       .catch((err) => setError(err.message));
   }, []);
   ```

2. Break it down:
   - `useEffect(fn, deps)` — runs `fn` after the component renders.
   - The empty array `[]` means "run this only once, on first mount."
   - `apiFetch<HealthResponse>('/health')` calls the backend API.
   - `.then(setHealth)` stores the response in state on success.
   - `.catch(...)` stores the error message in state on failure.

3. **Experiment:** Open your browser's DevTools (F12) → Network tab. Reload the page. You should see a request to `/api/health`. Click it to inspect the request and response.

4. **Thought exercise:** What would happen if the dependency array was `[health]` instead of `[]`?

**Verify:**

<details>
<summary>Answer</summary>

With `[health]` as the dependency, the effect would re-run every time `health` changes. Since the effect itself updates `health`, this would create an infinite loop: fetch → update state → re-render → fetch → update state → ...

The empty array `[]` means "run once on mount" which is the correct behavior for initial data loading.

</details>

---

### Exercise 3.4 — Understand the API Client Helper

**Goal:** Learn how the typed fetch wrapper works.

**Concepts:** TypeScript generics, async/await, fetch API, error handling.

**Steps:**

1. Open `frontend/src/api/client.ts` and read all comments.
2. The function signature uses a **TypeScript generic** `<T>`:
   ```tsx
   export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T>
   ```
   This means: "The caller tells me what type `T` is, and I promise to return that type."

3. Trace what happens when `apiFetch<HealthResponse>('/health')` is called:
   - `path` = `"/health"`
   - The URL becomes `"/api/health"` (prepended with `/api`).
   - `Content-Type: application/json` header is set.
   - The browser sends a GET request.
   - Vite's proxy forwards it to `http://localhost:8000/api/health`.
   - If the response status is 2xx, parse JSON and return as `HealthResponse`.
   - If not, throw an error.

4. **Thought exercise:** Why can't we use `apiFetch` for streaming responses? (Hint: read the NOTE in the module comment.)

**Verify:** You can explain why the helper prepends `/api` and how the Vite proxy makes it work.

---

### Exercise 3.5 — Understand Conditional Rendering

**Goal:** Learn how React shows different UI based on state.

**Concepts:** JSX, conditional rendering, short-circuit evaluation.

**Steps:**

1. Look at the return statement in `App.tsx`. There are three conditional blocks:

   ```tsx
   {error && <p className="error">Error: {error}</p>}
   {!health && !error && <p className="loading">Loading...</p>}
   {health && (<div className="health">...</div>)}
   ```

2. For each state combination, determine what renders:

   | `health` | `error` | What shows? |
   |---|---|---|
   | `null` | `null` | ? |
   | `null` | `"Network error"` | ? |
   | `{status: "ok", ...}` | `null` | ? |

3. The `&&` operator in JSX is called **short-circuit evaluation**:
   - `true && <Component />` renders the component.
   - `false && <Component />` renders nothing.
   - This is React's primary pattern for conditional rendering.

**Verify:**

<details>
<summary>Answers</summary>

| `health` | `error` | What shows? |
|---|---|---|
| `null` | `null` | "Loading..." |
| `null` | `"Network error"` | "Error: Network error" |
| `{status: "ok", ...}` | `null` | The health status card |

</details>

---

### Exercise 3.6 — Display the Info Endpoint in React

**Goal:** Create a new React component that fetches from your custom endpoint.

**Concepts:** Component creation, state management, API integration, TypeScript interfaces.

**Steps:**

1. If you completed Exercise 2.6, you have a `/api/info` endpoint. Now display its data in the frontend.

2. In `frontend/src/App.tsx`, add:
   - A TypeScript interface for the info response.
   - A new `useState` for the info data.
   - A `useEffect` that fetches `/info` using `apiFetch`.
   - JSX to display the project name and framework.

3. Try it yourself before looking at the hint.

**Verify:** The page shows both the health status and the project info.

<details>
<summary>Hint</summary>

```tsx
interface InfoResponse {
  project: string;
  python_version: string;
  framework: string;
}

// Inside the App function, add:
const [info, setInfo] = useState<InfoResponse | null>(null);

// Inside the useEffect (or add a second useEffect):
apiFetch<InfoResponse>('/info').then(setInfo);

// In the JSX return, add:
{info && (
  <div className="health">
    <p>Project: <span className="status">{info.project}</span></p>
    <p>Framework: <span className="version">{info.framework}</span></p>
  </div>
)}
```

</details>

---

## Module 4: Understanding the Vite Proxy and Frontend-Backend Communication

### Exercise 4.1 — Understand the Proxy Configuration

**Goal:** Learn how the frontend talks to the backend during development.

**Concepts:** Development proxy, cross-origin requests, Vite configuration.

**Steps:**

1. Open `frontend/vite.config.ts` and read the comments.
2. The key configuration is:
   ```ts
   proxy: {
     '/api': {
       target: 'http://localhost:8000',
       changeOrigin: true,
     },
   }
   ```

3. This means: any request to a URL starting with `/api` that arrives at the Vite dev server (port 5173) gets forwarded to the backend (port 8000).

4. **Trace the full path:**
   ```
   Browser: fetch("/api/health")
     → Request goes to localhost:5173 (Vite dev server)
       → Vite sees the path starts with "/api"
         → Vite forwards the request to localhost:8000/api/health
           → FastAPI processes and responds
         → Vite passes the response back to the browser
   ```

5. **Experiment:** Stop the backend (`Ctrl+C` on `make dev-backend`). Refresh the frontend. You should see an error because the proxy has nowhere to forward requests.

6. **Thought exercise:** In production, you wouldn't use a Vite proxy. How would you handle the frontend-to-backend communication instead?

**Verify:**

<details>
<summary>Answer</summary>

In production, you'd typically:
- Serve both from the same domain using a reverse proxy like nginx.
- Configure nginx to route `/api/*` to the backend and everything else to the static frontend files.
- Or use separate domains with CORS headers properly configured.

</details>

---

## Module 5: Understanding Docker and Containerization

### Exercise 5.1 — Read the Backend Dockerfile

**Goal:** Understand how the backend is containerized.

**Concepts:** Docker images, layers, caching, multi-stage copies.

**Steps:**

1. Open `Dockerfile.backend` and read all comments.
2. Identify the purpose of each instruction:

   | Instruction | Purpose |
   |---|---|
   | `FROM python:3.12-slim` | ? |
   | `COPY --from=ghcr.io/astral-sh/uv:latest ...` | ? |
   | `WORKDIR /app` | ? |
   | `COPY backend/pyproject.toml backend/uv.lock ./` | ? |
   | `RUN uv sync --frozen --no-dev` | ? |
   | `COPY backend/ .` | ? |
   | `CMD [...]` | ? |

3. **Key concept — Layer caching:** Docker caches each instruction. If a layer hasn't changed, Docker reuses the cached version. This is why we copy dependency files before source code — dependencies change rarely, source code changes often.

**Verify:**

<details>
<summary>Answers</summary>

| Instruction | Purpose |
|---|---|
| `FROM python:3.12-slim` | Use a minimal Python base image |
| `COPY --from=...` | Copy the `uv` binary from its official image |
| `WORKDIR /app` | Set the working directory for subsequent commands |
| `COPY ... pyproject.toml ... uv.lock` | Copy dependency files first (for caching) |
| `RUN uv sync --frozen --no-dev` | Install production dependencies |
| `COPY backend/ .` | Copy application source code |
| `CMD [...]` | Define the default startup command |

</details>

---

### Exercise 5.2 — Understand Docker Compose

**Goal:** Learn how multiple containers work together.

**Concepts:** Docker Compose services, port mapping, volumes, depends_on.

**Steps:**

1. Open `docker-compose.yml` and read all comments.
2. For each service, identify:
   - What Dockerfile it uses.
   - What port it exposes.
   - What volumes are mounted.
   - What the startup command is.

3. **Key concepts:**
   - `ports: "8000:8000"` means "map port 8000 on your machine to port 8000 in the container."
   - `volumes: ./backend:/app` mounts your local code into the container so changes take effect immediately.
   - `depends_on: backend` ensures the backend starts before the frontend.

4. **Experiment:** If you have Docker installed:
   ```bash
   make docker-up    # Build and start all services
   make docker-down  # Stop all services
   ```

**Verify:** You can explain the difference between running services with `make dev` (local) vs `make docker-up` (containerized).

---

## Module 6: Understanding the Dev Container

### Exercise 6.1 — Read the Dev Container Configuration

**Goal:** Understand how the development environment is fully containerized.

**Concepts:** Dev Containers, VS Code integration, reproducible environments.

**Steps:**

1. Read these three files in order:
   - `.devcontainer/Dockerfile` — Builds the development image.
   - `.devcontainer/devcontainer.json` — Configures VS Code integration.
   - `.devcontainer/post-create.sh` — Installs dependencies on first setup.

2. Understand the key differences from production Dockerfiles:
   - Dev Container includes development tools (git, curl, make).
   - Creates a non-root user for security.
   - Has VS Code extensions pre-configured.
   - Installs ALL dependencies (including dev dependencies).

3. In `devcontainer.json`, identify:
   - Which ports are forwarded.
   - What VS Code extensions are installed.
   - What settings are configured for Python and TypeScript.
   - When `post-create.sh` runs.

**Verify:** You understand that a Dev Container provides a complete, reproducible development environment that works the same on any machine.

---

## Module 7: Understanding Environment and Configuration

### Exercise 7.1 — Understand the .env Pattern

**Goal:** Learn how secrets and configuration are managed.

**Concepts:** Environment variables, .env files, .gitignore, security.

**Steps:**

1. Open `.env.example` and read the comments.
2. Open `.gitignore` and confirm that `.env` is listed (never committed to git).
3. Understand the flow:
   ```
   .env.example (template, committed to git)
     → Developer copies to .env (personal config, NOT committed)
       → Pydantic Settings reads .env at startup
         → Values available as settings.app_name, settings.debug, etc.
   ```

4. **Why this matters:** API keys and passwords should NEVER be in git. The `.env` pattern keeps them local and out of version control, while `.env.example` documents what variables are needed.

5. **Thought exercise:** What would happen if someone accidentally committed their `.env` file with a real API key?

**Verify:** You can explain why `.env` is in `.gitignore` and how the `.env.example` template helps new developers.

---

## Module 8: Testing Fundamentals

### Exercise 8.1 — Understand the Test Infrastructure

**Goal:** Learn how async tests work with FastAPI.

**Concepts:** pytest, pytest-asyncio, ASGITransport, test isolation.

**Steps:**

1. Open `backend/tests/test_health.py` and read all comments.
2. The test infrastructure has three key pieces:
   - **pytest** — discovers and runs tests.
   - **pytest-asyncio** — adds support for `async` test functions.
   - **httpx + ASGITransport** — lets you test FastAPI without a real server.

3. Understand why this approach is better than starting a real server:
   - **Speed:** No server startup time.
   - **Isolation:** Each test gets a fresh connection.
   - **Reliability:** No port conflicts or network issues.

4. **Your turn:** Write a test that verifies a non-existent endpoint returns a 404:

   ```python
   @pytest.mark.asyncio
   async def test_nonexistent_endpoint_returns_404():
       transport = ASGITransport(app=app)
       async with AsyncClient(transport=transport, base_url="http://test") as client:
           response = await client.get("/api/nonexistent")

       # What should you assert here?
   ```

**Verify:**

<details>
<summary>Solution</summary>

```python
assert response.status_code == 404
```

Run `make test` — all tests should pass, including your new one.

</details>

---

### Exercise 8.2 — Test a POST Endpoint

**Goal:** Learn how to test endpoints that accept request bodies.

**Concepts:** POST requests, JSON request bodies, test coverage.

**Steps:**

1. This exercise prepares you for the chatbot tutorial. Create a simple echo endpoint first.

2. Create `backend/app/routers/echo.py`:
   ```python
   from fastapi import APIRouter
   from pydantic import BaseModel

   router = APIRouter()

   class EchoRequest(BaseModel):
       message: str

   @router.post("/echo")
   async def echo(request: EchoRequest):
       return {"echo": request.message}
   ```

3. Register it in `main.py` (same pattern as health router).

4. **Your turn:** Write a test for this endpoint. You'll need:
   - `client.post("/api/echo", json={"message": "hello"})` to send a POST with JSON.
   - Assertions on the status code and response body.

5. Run the tests.

**Verify:**

<details>
<summary>Solution — test_echo.py</summary>

```python
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import app


@pytest.mark.asyncio
async def test_echo():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/echo", json={"message": "hello"})

    assert response.status_code == 200
    assert response.json()["echo"] == "hello"


@pytest.mark.asyncio
async def test_echo_missing_message():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.post("/api/echo", json={})

    # FastAPI returns 422 Unprocessable Entity for validation errors
    assert response.status_code == 422
```

</details>

---

## Module 9: Putting It All Together — The Data Flow

### Exercise 9.1 — Trace the Complete Request Lifecycle

**Goal:** Understand the full journey of data from user action to screen update.

**Concepts:** Full-stack request lifecycle, client-server architecture.

**Steps:**

1. Map the complete lifecycle when the page loads:

   ```
   ┌─────────────────────────────────────────────────────────────┐
   │                        BROWSER                              │
   │                                                             │
   │  1. Browser loads index.html                                │
   │  2. index.html loads main.tsx                               │
   │  3. main.tsx creates React root, renders <App />            │
   │  4. App renders with health=null (shows "Loading...")       │
   │  5. useEffect fires → apiFetch("/health")                  │
   │  6. fetch("/api/health") sent to Vite dev server            │
   │                                                             │
   └────────────────────────┬────────────────────────────────────┘
                            │ HTTP GET /api/health
                            ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                    VITE DEV SERVER (5173)                   │
   │                                                             │
   │  7. Vite proxy matches /api prefix                          │
   │  8. Forwards request to localhost:8000                      │
   │                                                             │
   └────────────────────────┬────────────────────────────────────┘
                            │ HTTP GET /api/health
                            ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                  FASTAPI BACKEND (8000)                     │
   │                                                             │
   │  9.  CORS middleware processes the request                  │
   │  10. FastAPI matches /api/health → health.router            │
   │  11. health_check() runs → returns {"status": "ok", ...}   │
   │  12. FastAPI serializes dict to JSON response               │
   │  13. CORS middleware adds response headers                  │
   │                                                             │
   └────────────────────────┬────────────────────────────────────┘
                            │ JSON response
                            ▼
   ┌─────────────────────────────────────────────────────────────┐
   │                        BROWSER                              │
   │                                                             │
   │  14. apiFetch receives response, parses JSON                │
   │  15. .then(setHealth) stores data in React state            │
   │  16. React re-renders App with new health value             │
   │  17. Conditional rendering shows the health status card     │
   │  18. User sees "Status: ok" and "Version: 0.1.0"           │
   │                                                             │
   └─────────────────────────────────────────────────────────────┘
   ```

2. For each step, identify which file in the codebase is responsible.

**Verify:** You can explain every step of this diagram from memory.

---

## Module 10: Code Quality and Linting

### Exercise 10.1 — Run the Linter

**Goal:** Learn how code quality tools work.

**Concepts:** Linting, code formatting, ruff, code standards.

**Steps:**

1. Run the linter:
   ```bash
   make lint
   ```
   This runs two ruff commands:
   - `ruff check .` — looks for code issues (unused imports, style violations, etc.).
   - `ruff format --check .` — checks if code formatting matches the standard.

2. **Experiment:** Introduce a linting error. Open `backend/app/routers/health.py` and add an unused import:
   ```python
   import os  # This is unused
   ```

3. Run `make lint` again. Ruff should flag the unused import.

4. Fix it by removing the import. Run `make lint` again to confirm it passes.

5. **Auto-formatting:** You can also auto-fix formatting issues:
   ```bash
   cd backend && uv run ruff format .
   ```

**Verify:** You can run the linter, understand its output, and fix issues it reports.

---

## Module 11: Next Steps — Building the Chatbot

### Exercise 11.1 — Start the Chatbot Tutorial

**Goal:** Apply everything you've learned to build a real feature.

**Concepts:** All previous concepts + API integration, streaming, real-time UI.

**Steps:**

Now that you understand every piece of this codebase, you're ready for the main event. Open `TUTORIAL.md` and follow it step by step to build a streaming LLM chatbot.

The tutorial will have you:
1. Add the Anthropic SDK to the backend.
2. Create a streaming chat endpoint.
3. Build a React chat UI that handles streaming responses.
4. Connect everything together.

You'll use every concept from this learning guide:
- Configuration management (Exercise 2.1) — for the API key.
- Router creation (Exercise 2.6) — for the chat endpoint.
- API communication (Exercise 3.4) — for calling the backend.
- React state (Exercise 3.2) — for managing the message list.
- useEffect patterns (Exercise 3.3) — for auto-scrolling.
- Testing (Exercise 8.2) — for verifying your endpoint.

**Verify:** You complete the TUTORIAL.md and have a working chatbot.

---

## Summary: What You Learned

| Module | Key Concepts |
|---|---|
| **1. Environment** | Project structure, Makefiles, setup |
| **2. Backend** | FastAPI, routers, middleware, CORS, lifespan |
| **3. Frontend** | React components, useState, useEffect, TypeScript |
| **4. Proxy** | Vite proxy, frontend-backend communication |
| **5. Docker** | Dockerfiles, layers, caching, images |
| **6. Dev Container** | Reproducible development environments |
| **7. Configuration** | Environment variables, .env files, security |
| **8. Testing** | pytest, async tests, ASGI transport |
| **9. Full Stack** | Complete request lifecycle |
| **10. Code Quality** | Linting, formatting, ruff |
| **11. Chatbot** | API integration, streaming, real-time UI |

---

## Quick Reference: File → Concept Map

Use this table to find which file teaches which concept:

| File | Concepts |
|---|---|
| `backend/app/config.py` | Pydantic Settings, environment variables, type safety |
| `backend/app/main.py` | FastAPI creation, CORS middleware, router registration, lifespan |
| `backend/app/routers/health.py` | APIRouter, async endpoints, JSON responses |
| `backend/tests/test_health.py` | pytest, async testing, ASGI transport, assertions |
| `frontend/src/main.tsx` | React bootstrapping, DOM mounting, StrictMode |
| `frontend/src/App.tsx` | React components, useState, useEffect, conditional rendering |
| `frontend/src/api/client.ts` | TypeScript generics, fetch API, error handling |
| `frontend/vite.config.ts` | Development proxy, Vite plugins |
| `Makefile` | Task automation, shell commands |
| `Dockerfile.backend` | Docker layers, caching, multi-stage copies |
| `Dockerfile.frontend` | Node.js containers, npm ci |
| `docker-compose.yml` | Multi-container orchestration, volumes, ports |
| `.devcontainer/` | Reproducible dev environments, VS Code integration |
| `backend/pyproject.toml` | Python dependency management, project metadata |
| `.env.example` | Configuration templates, secrets management |
