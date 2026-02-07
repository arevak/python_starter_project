"""
Health Check Router
====================
This module defines a simple health check endpoint. Health checks are a
standard practice in web services — they give you (and automated tools like
load balancers, Kubernetes, or monitoring systems) a quick way to verify
that the server is running and responding to requests.

Key concepts demonstrated here:
  - Creating an APIRouter (a mini-app that groups related endpoints).
  - Defining an async endpoint with a decorator.
  - Returning a Python dict, which FastAPI automatically converts to JSON.
"""

# APIRouter is like a "mini FastAPI app" that holds a group of related routes.
# You define endpoints on the router, then register the router with the main
# app in main.py. This keeps your code organized — each file handles one
# area of functionality.
from fastapi import APIRouter

# Create a router instance. No prefix is set here because the prefix ("/api")
# is added when this router is registered in main.py. This makes the router
# reusable — you could mount it at a different prefix if needed.
router = APIRouter()


# The @router.get("/health") decorator does two things:
#   1. Tells FastAPI that this function handles GET requests to "/health".
#   2. Registers the function in the automatic API documentation at /docs.
@router.get("/health")
async def health_check():
    """
    Health check endpoint — GET /api/health

    Returns a JSON object indicating the service is running:
      {"status": "ok", "version": "0.1.0"}

    Why is this useful?
      - During development: quickly verify the backend is running.
      - In production: load balancers ping this endpoint to decide whether
        to route traffic to this server instance.
      - In Docker: can be used as a container health check.

    The `async` keyword makes this an asynchronous function. FastAPI can handle
    many async requests concurrently without blocking, which is important for
    performance when your endpoints call external APIs or databases.

    Returns:
        dict: A dictionary with "status" and "version" keys.
              FastAPI automatically serializes this to a JSON response
              with a 200 OK status code.
    """
    return {"status": "ok", "version": "0.1.0"}
