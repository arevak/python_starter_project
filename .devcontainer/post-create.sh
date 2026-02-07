#!/usr/bin/env bash
# =============================================================================
# Post-Create Setup Script
# =============================================================================
# This script runs automatically after the Dev Container is created for the
# first time (not on every restart — only on initial creation). It installs
# all project dependencies so you're ready to start coding immediately.
#
# Triggered by the "postCreateCommand" setting in devcontainer.json.
#
# What it does:
#   1. Installs Python backend dependencies using uv.
#   2. Installs Node.js frontend dependencies using npm.
#   3. Creates a .env file from the template if one doesn't exist.
# =============================================================================

# `set -e` tells bash to stop immediately if any command fails.
# Without this, the script would continue even after an error,
# potentially leaving the environment in a broken state.
set -e

# --- Step 1: Install Python backend dependencies ---
# `uv sync` reads pyproject.toml and uv.lock, creates a virtual environment
# (if needed), and installs all packages — both production and dev dependencies.
echo "==> Setting up backend dependencies..."
cd backend
uv sync
cd ..

# --- Step 2: Install Node.js frontend dependencies ---
# `npm install` reads package.json and package-lock.json, downloads all
# packages into the node_modules/ directory.
echo "==> Setting up frontend dependencies..."
cd frontend
npm install
cd ..

# --- Step 3: Create .env file from template ---
# The .env file contains environment variables (like API keys and settings).
# We only copy the template if .env doesn't already exist, so we never
# overwrite custom settings the developer may have added.
# The `-f` flag in `[ ! -f .env ]` checks whether the file does NOT exist.
echo "==> Creating .env from template (if not present)..."
if [ ! -f .env ]; then
  cp .env.example .env
fi

echo "==> Done! Run 'make dev' to start the app."
