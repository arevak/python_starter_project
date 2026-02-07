#!/usr/bin/env bash
set -e

echo "==> Setting up backend dependencies..."
cd backend
uv sync
cd ..

echo "==> Setting up frontend dependencies..."
cd frontend
npm install
cd ..

echo "==> Creating .env from template (if not present)..."
if [ ! -f .env ]; then
  cp .env.example .env
fi

echo "==> Done! Run 'make dev' to start the app."
