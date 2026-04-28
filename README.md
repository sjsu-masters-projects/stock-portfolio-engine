# Stock Portfolio Suggestion Engine

A full-stack web application that suggests a personalized stock portfolio based on investment strategy and amount.

## Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Recharts
- **Backend**: FastAPI (Python), yfinance
- **Storage**: Local JSON for 5-day portfolio history

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
- Interactive 5-day portfolio trend chart

## Project Structure

```
stock-portfolio-engine/
├── backend/          # FastAPI application
│   ├── main.py
│   ├── strategies.py
│   ├── allocator.py
│   ├── history.py
│   └── requirements.txt
└── frontend/         # Next.js application
    ├── app/
    ├── components/
    └── package.json
```

## Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Team

- Ganesh
- Rajeev
- Neel
- Vatsal
