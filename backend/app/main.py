"""
FastAPI Application Entry Point
================================
This is the main file that creates and configures the FastAPI application.
When you run `uvicorn app.main:app`, Python imports this module and uvicorn
looks for the variable named `app` — the FastAPI instance defined below.

This file is responsible for three things:
  1. Creating the FastAPI application instance.
  2. Attaching middleware (e.g., CORS) that processes every request/response.
  3. Registering routers that define the actual API endpoints.

Think of this as the "wiring" layer — it connects all the pieces together
but contains no business logic itself.
"""

# asynccontextmanager lets us write startup/shutdown logic as a single function
# using `yield` to separate the two phases. See the `lifespan` function below.
from contextlib import asynccontextmanager

# FastAPI is the web framework. It handles routing HTTP requests to your
# Python functions, validating inputs, serializing outputs, and generating
# interactive API documentation automatically at /docs.
from fastapi import FastAPI

# CORSMiddleware handles Cross-Origin Resource Sharing headers.
# Browsers block requests from one origin (e.g., localhost:5173) to a different
# origin (e.g., localhost:8000) by default. This middleware adds HTTP headers
# that tell the browser "it's okay, allow these requests."
from fastapi.middleware.cors import CORSMiddleware

# Import our centralized settings (see config.py for details).
from app.config import settings

# Import router modules. Each router is a collection of related endpoints.
# Keeping endpoints in separate router files keeps the codebase organized
# as the application grows.
from app.routers import health


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager — runs code at startup and shutdown.

    How it works:
      - Everything BEFORE `yield` runs once when the server starts.
        Use this for things like opening database connections or loading models.
      - Everything AFTER `yield` runs once when the server shuts down.
        Use this for cleanup like closing database connections.

    This replaces the older @app.on_event("startup") / @app.on_event("shutdown")
    pattern that you may see in older FastAPI tutorials.
    """
    # --- Startup logic goes here ---
    # Example: db = await connect_to_database()
    yield
    # --- Shutdown logic goes here ---
    # Example: await db.disconnect()


# Create the FastAPI application instance.
# - `title` sets the name shown in the auto-generated API docs at /docs.
# - `lifespan` attaches our startup/shutdown handler defined above.
app = FastAPI(title=settings.app_name, lifespan=lifespan)

# Add CORS middleware to the application.
# Middleware wraps every request/response cycle. CORS middleware specifically:
#   - Responds to browser preflight OPTIONS requests automatically.
#   - Adds Access-Control-Allow-* headers to every response.
#
# Configuration explained:
#   allow_origins:     Which frontend URLs can call this API.
#   allow_credentials: Whether cookies/auth headers are forwarded.
#   allow_methods:     Which HTTP methods (GET, POST, etc.) are permitted.
#                      ["*"] means all methods.
#   allow_headers:     Which HTTP headers the frontend can include.
#                      ["*"] means all headers.
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register the health check router.
#   - `health.router` contains the endpoint definitions (see routers/health.py).
#   - `prefix="/api"` means all routes in this router get prefixed with /api.
#     So the health router's "/health" endpoint becomes "/api/health".
#
# Why prefix with /api?
#   In production, it's common to serve the frontend and backend from the same
#   domain. The /api prefix makes it easy for a reverse proxy (like nginx) to
#   route API requests to the backend and everything else to the frontend.
app.include_router(health.router, prefix="/api")
