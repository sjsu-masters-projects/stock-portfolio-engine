import logging
from fastapi import APIRouter, HTTPException
from app.models.requests import CompareRequest
from app.database import strategy_repo
from app.services.allocation_engine import allocation_engine

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["compare"])

@router.post("/compare")
def compare_portfolios(req: CompareRequest):
    tickers_a = strategy_repo.get_tickers(req.strategies_a)
    tickers_b = strategy_repo.get_tickers(req.strategies_b)
    
    if not tickers_a or not tickers_b:
        raise HTTPException(status_code=400, detail="No tickers found for selected strategies.")

    result_a = allocation_engine.compute_allocation(tickers_a, req.amount)
    result_b = allocation_engine.compute_allocation(tickers_b, req.amount)
    
    labels_a = [strategy_repo.get_label(k) for k in req.strategies_a]
    labels_b = [strategy_repo.get_label(k) for k in req.strategies_b]
    
    logger.info("Compared portfolios: A=%s vs B=%s at $%.2f", req.strategies_a, req.strategies_b, req.amount)
    
    return {
        "portfolio_a": {
            "amount": req.amount,
            "strategies": labels_a,
            "strategy_keys": list(req.strategies_a),
            "tickers_used": [t["symbol"] for t in tickers_a],
            **result_a
        },
        "portfolio_b": {
            "amount": req.amount,
            "strategies": labels_b,
            "strategy_keys": list(req.strategies_b),
            "tickers_used": [t["symbol"] for t in tickers_b],
            **result_b
        }
    }
