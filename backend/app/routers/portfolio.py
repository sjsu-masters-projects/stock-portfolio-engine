import logging
from fastapi import APIRouter, HTTPException
from app.models.requests import PortfolioRequest
from app.models.responses import PortfolioResponse
from app.database import strategy_repo, history_repo, compute_portfolio_value
from app.services.allocation_engine import allocation_engine

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["portfolio"])

@router.post("/portfolio", response_model=PortfolioResponse)
def generate_portfolio(req: PortfolioRequest):
    tickers = strategy_repo.get_tickers(req.strategies)
    if not tickers:
        raise HTTPException(status_code=400, detail="No tickers found for selected strategies.")

    result = allocation_engine.compute_allocation(tickers, req.amount)
    
    portfolio_value = compute_portfolio_value(result["allocations"])
    labels = [strategy_repo.get_label(k) for k in req.strategies]
    history_repo.record_snapshot(portfolio_value, labels)
    
    logger.info("Generated portfolio: $%.2f across %d tickers", req.amount, len(tickers))
    
    return {
        "amount": req.amount,
        "strategies": labels,
        "strategy_keys": list(req.strategies),
        "tickers_used": [t["symbol"] for t in tickers],
        **result
    }

@router.get("/portfolios")
def list_saved_portfolios():
    return history_repo.list_portfolios()

@router.post("/portfolios/save")
def save_portfolio(config: dict):
    portfolio_id = history_repo.save_portfolio(config)
    return {"status": "saved", "id": portfolio_id}

@router.delete("/portfolios/{portfolio_id}")
def delete_portfolio(portfolio_id: str):
    deleted = history_repo.delete_portfolio(portfolio_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Portfolio not found")
    return {"status": "deleted"}
