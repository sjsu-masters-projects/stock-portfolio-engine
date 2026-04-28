#!/bin/bash
# Start both backend and frontend

echo "Starting backend on :8000..."
cd backend && pip install -r requirements.txt -q && uvicorn main:app --reload --port 8000 &

echo "Starting frontend on :3000..."
cd frontend && npm install --silent && npm run dev &

wait
