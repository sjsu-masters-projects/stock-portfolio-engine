"""
Stock Portfolio Suggestion Engine — FastAPI Backend

Endpoints:
  POST /api/portfolio   — generate allocation for given amount + strategies
  GET  /api/history     — fetch 5-day portfolio value trend
  GET  /api/strategies  — list available strategies
  GET  /health          — health check
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import Literal

from strategies import STRATEGIES, get_tickers_for_strategies, get_strategy_labels
from allocator import compute_allocation
from history import record_snapshot, get_history, compute_portfolio_value

app = FastAPI(
    title="Stock Portfolio Suggestion Engine",
    description="Suggests a performance-weighted stock portfolio based on investment strategy.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

VALID_STRATEGIES = list(STRATEGIES.keys())
StrategyKey = Literal["ethical", "growth", "index", "quality", "value"]


# ── Request / Response models ──────────────────────────────────────────────────

class PortfolioRequest(BaseModel):
    amount: float
    strategies: list[StrategyKey]

    @field_validator("amount")
    @classmethod
    def minimum_amount(cls, v: float) -> float:
        if v < 5000:
            raise ValueError("Minimum investment amount is $5,000 USD.")
        return v

    @field_validator("strategies")
    @classmethod
    def validate_strategies(cls, v: list[str]) -> list[str]:
        if not v:
            raise ValueError("Select at least one strategy.")
        if len(v) > 2:
            raise ValueError("Select at most two strategies.")
        # Deduplicate while preserving order
        seen: set[str] = set()
        deduped = []
        for s in v:
            if s not in seen:
                seen.add(s)
                deduped.append(s)
        return deduped


# ── Routes ─────────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/api/strategies")
def list_strategies():
    """Return all available investment strategies."""
    return [
        {
            "key": key,
            "label": meta["label"],
            "description": meta["description"],
            "tickers": meta["tickers"],
        }
        for key, meta in STRATEGIES.items()
    ]


@app.post("/api/portfolio")
def generate_portfolio(req: PortfolioRequest):
    """
    Generate a performance-weighted portfolio.
    If two strategies are selected, their ticker pools are merged (blended).
    """
    try:
        tickers = get_tickers_for_strategies(req.strategies)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc))

    if not tickers:
        raise HTTPException(status_code=400, detail="No tickers found for selected strategies.")

    result = compute_allocation(tickers=tickers, amount=req.amount)

    # Record today's portfolio value in history
    portfolio_value = compute_portfolio_value(result["allocations"])
    strategy_labels = get_strategy_labels(req.strategies)
    record_snapshot(portfolio_value, strategy_labels)

    return {
        "amount": req.amount,
        "strategies": strategy_labels,
        "tickers_used": [t["symbol"] for t in tickers],
        **result,
    }


@app.get("/api/history")
def portfolio_history():
    """Return the last 5 days of portfolio value snapshots."""
    return {"history": get_history()}
