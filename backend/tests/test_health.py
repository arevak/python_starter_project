"""
Health Check Endpoint Tests
============================
This module tests the /api/health endpoint to verify it returns the
expected response. It demonstrates several important testing concepts:

  1. Async testing with pytest-asyncio — because our FastAPI app is async,
     our tests need to be async too.
  2. ASGI transport — instead of starting a real HTTP server, we plug the
     test client directly into the FastAPI app. This makes tests fast and
     reliable (no network involved).
  3. Assertions — we check the status code AND the response body to make
     sure both are correct.

Running tests:
  From the project root:  make test
  From the backend dir:   uv run pytest
"""

# pytest is Python's most popular testing framework. The `pytest.mark`
# module provides decorators to configure how tests run.
import pytest

# httpx is an HTTP client library (similar to the popular `requests` library)
# that supports async operations. We use it here as a test client.
#   - ASGITransport: lets httpx talk directly to a FastAPI (ASGI) app without
#     starting a real server. "ASGI" stands for Asynchronous Server Gateway
#     Interface — it's the protocol that connects Python web frameworks to
#     web servers like uvicorn.
#   - AsyncClient: an async HTTP client that can make requests and read responses.
from httpx import ASGITransport, AsyncClient

# Import the FastAPI app instance that we want to test.
# This is the same `app` object created in main.py.
from app.main import app


# @pytest.mark.asyncio tells pytest that this test function is async and
# should be run with an async event loop. Without this decorator, pytest
# would try to run it synchronously and fail.
@pytest.mark.asyncio
async def test_health_check():
    """
    Test that the health check endpoint returns a 200 status with the
    expected JSON body.

    How this test works step by step:
      1. Create an ASGITransport that wraps our FastAPI app — this lets
         httpx send requests directly to the app without a real server.
      2. Create an AsyncClient using that transport with a fake base URL.
         The URL doesn't matter since no real HTTP is happening, but httpx
         requires one.
      3. Send a GET request to /api/health.
      4. Assert (verify) that the status code and body match expectations.
    """
    # Create a transport that routes requests directly to our FastAPI app
    # instead of making real HTTP calls over the network.
    transport = ASGITransport(app=app)

    # `async with` ensures the client is properly opened and closed.
    # This is called a "context manager" — it handles setup and cleanup
    # automatically, even if an error occurs inside the block.
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Send a GET request to the health endpoint.
        # `await` pauses execution until the response comes back.
        response = await client.get("/api/health")

    # Verify the response status code is 200 (HTTP OK).
    assert response.status_code == 200

    # Parse the JSON response body into a Python dictionary.
    data = response.json()

    # Verify the response contains the expected values.
    # If either assertion fails, pytest reports the test as FAILED and shows
    # you exactly which value didn't match what was expected.
    assert data["status"] == "ok"
    assert data["version"] == "0.1.0"
