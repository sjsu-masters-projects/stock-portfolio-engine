# Stock Portfolio Suggestion Engine

A full-stack web application that suggests a personalized, performance-weighted stock portfolio based on investment strategy and amount.

## 🌐 Live Demo

| Service | URL |
|---------|-----|
| **Frontend** | [stock-portfolio-engine-iota.vercel.app](https://stock-portfolio-engine-iota.vercel.app) |
| **Backend API** | [stock-portfolio-engine.onrender.com](https://stock-portfolio-engine.onrender.com) |
| **API Docs** | [stock-portfolio-engine.onrender.com/docs](https://stock-portfolio-engine.onrender.com/docs) |

> **Note:** The backend runs on Render's free tier and may take ~30 seconds to wake from a cold start.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 14, React 18, Tailwind CSS, Framer Motion, Recharts |
| **Backend** | FastAPI, Python, Uvicorn, yfinance |
| **Database** | SQLite (persistent on Render) |
| **Deployment** | Vercel (frontend) · Render (backend) |

## Features

- Input investment amount (minimum $5,000 USD)
- Choose one or two investment strategies:
  - Ethical Investing
  - Growth Investing
  - Index Investing
  - Quality Investing
  - Value Investing
- Performance-weighted allocation across selected stocks
- Live price data via yfinance
- Interactive portfolio trend chart
- Save & manage multiple portfolios
- Side-by-side strategy comparison
- Stock detail view with news feed
- Dark / light theme toggle

## Project Structure

```
stock-portfolio-engine/
├── backend/                  # FastAPI application
│   ├── app/
│   │   ├── main.py           # App factory & CORS
│   │   ├── config.py         # pydantic-settings (loads .env)
│   │   ├── database.py       # SQLite schema, repos & seed data
│   │   ├── exceptions.py     # Custom error handling
│   │   ├── routers/          # API route handlers
│   │   │   ├── health.py
│   │   │   ├── strategies.py
│   │   │   ├── portfolio.py
│   │   │   ├── history.py
│   │   │   ├── stocks.py
│   │   │   ├── prices.py
│   │   │   └── compare.py
│   │   ├── services/         # Business logic
│   │   └── models/           # Pydantic schemas
│   ├── requirements.txt
│   └── .env.example
├── frontend/                 # Next.js application
│   ├── app/                  # App router pages
│   │   ├── page.tsx          # Home / portfolio builder
│   │   ├── portfolio/        # Portfolio results
│   │   ├── compare/          # Strategy comparison
│   │   └── history/          # Saved portfolios
│   ├── components/           # Reusable UI components
│   ├── lib/api.ts            # Backend API client
│   ├── contexts/             # React context providers
│   ├── hooks/                # Custom hooks
│   ├── types/                # TypeScript type definitions
│   └── .env.example
├── start.sh                  # Local dev launcher (both services)
└── README.md
```

## Local Development

### Prerequisites

- Python 3.10+
- Node.js 18+
- npm

### Quick Start (both services)

```bash
chmod +x start.sh
./start.sh
```

### Manual Setup

**Backend:**
```bash
cd backend
cp .env.example .env          # configure environment
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.local    # configure environment
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

**Backend** (`backend/.env`):
| Variable | Default | Description |
|----------|---------|-------------|
| `CORS_ORIGINS` | `["http://localhost:3000"]` | Allowed frontend origins (JSON array) |
| `MIN_INVESTMENT` | `5000` | Minimum investment amount ($) |
| `MAX_STRATEGIES` | `2` | Max strategies per portfolio |
| `HISTORY_MAX_ENTRIES` | `5` | Number of history snapshots to retain |
| `CACHE_TTL_SECONDS` | `60` | In-memory cache TTL |
| `DATABASE_PATH` | `portfolio.db` | SQLite DB path (relative or absolute) |

**Frontend** (`frontend/.env.local`):
| Variable | Default | Description |
|----------|---------|-------------|
| `NEXT_PUBLIC_API_URL` | `http://localhost:8000` | Backend API base URL |

## Deployment

### Architecture

```
User → Vercel (Next.js) → Render (FastAPI) → SQLite + yfinance
```

### Frontend — Vercel

1. Import your GitHub repo at [vercel.com](https://vercel.com)
2. Set **Root Directory** to `frontend`
3. Add environment variable:
   - `NEXT_PUBLIC_API_URL` = `https://stock-portfolio-engine.onrender.com`
4. Deploy — Vercel auto-detects Next.js

### Backend — Render

1. Create a **Web Service** at [render.com](https://render.com)
2. Connect your GitHub repo
3. Configure:
   - **Root Directory:** `backend`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables:
   - `CORS_ORIGINS` = `["https://stock-portfolio-engine-iota.vercel.app"]`
   - `DATABASE_PATH` = `portfolio.db`
5. (Optional) Attach a **Persistent Disk** to preserve SQLite data across deploys

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/strategies` | List investment strategies |
| `POST` | `/api/portfolio` | Generate portfolio allocation |
| `GET` | `/api/history` | Portfolio value history |
| `GET` | `/api/stocks/{symbol}` | Stock detail + metrics |
| `GET` | `/api/stocks/{symbol}/news` | Stock news articles |
| `GET` | `/api/prices?symbols=...` | Live stock prices |
| `POST` | `/api/compare` | Compare two strategy sets |
| `GET` | `/api/portfolios` | List saved portfolios |
| `POST` | `/api/portfolios/save` | Save a portfolio |
| `DELETE` | `/api/portfolios/{id}` | Delete a saved portfolio |

## Team

- Ganesh Thampi
- Rajeev Ranjan Chaurasia
- Indraneel Sarode
- Vatsal Gandhi
