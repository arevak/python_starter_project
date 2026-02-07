# =============================================================================
# Dev Container Dockerfile
# =============================================================================
# This Dockerfile creates the development environment used by VS Code's
# Dev Containers extension. Unlike the production Dockerfiles, this one
# includes ALL development tools (git, curl, make, uv) and creates a
# non-root user for security.
#
# When you "Reopen in Container" in VS Code, this image is built and
# your entire project is mounted inside it. You get a fully configured
# development environment without installing anything on your host machine.
# =============================================================================

# Use the same Python version as production for consistency.
FROM python:3.12-slim

# Install system-level tools needed during development:
#   - git:  version control (used by VS Code's Git integration and GitLens).
#   - curl: downloading files and testing APIs from the terminal.
#   - make: running Makefile commands (make dev, make test, etc.).
# The `--no-install-recommends` flag skips optional packages to keep the image small.
# `rm -rf /var/lib/apt/lists/*` cleans up the package cache to reduce image size.
RUN apt-get update && apt-get install -y --no-install-recommends \
    git \
    curl \
    make \
    && rm -rf /var/lib/apt/lists/*

# Install uv (fast Python package manager) by copying it from its official image.
# This is the same technique used in Dockerfile.backend.
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /usr/local/bin/

# Create a non-root user named "vscode" (the devcontainers convention).
# Running as root inside a container is a security risk — if code escapes
# the container, it would have root access on the host. A non-root user
# limits the blast radius.
#
# ARG values can be overridden at build time. The defaults here create a
# user with UID/GID 1000, which typically matches the first user on Linux.
# The user is also added to the sudoers file so they can install packages
# when needed (with `sudo apt-get install ...`).
ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=$USER_UID
RUN groupadd --gid $USER_GID $USERNAME \
    && useradd --uid $USER_UID --gid $USER_GID -m $USERNAME \
    && apt-get update && apt-get install -y sudo \
    && echo "$USERNAME ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME \
    && rm -rf /var/lib/apt/lists/*

# Switch to the non-root user for all subsequent operations.
USER $USERNAME
