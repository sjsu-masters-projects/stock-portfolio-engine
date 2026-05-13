#!/bin/bash
# Start both backend and frontend for development

set -e

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Starting backend on :8000..."
(cd "$PROJECT_DIR/backend" && pip install -r requirements.txt -q && uvicorn app.main:app --reload --port 8000) &

echo "Starting frontend on :3000..."
(cd "$PROJECT_DIR/frontend" && npm install --silent && npm run dev) &

wait
