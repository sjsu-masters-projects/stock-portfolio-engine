from fastapi import APIRouter
from app.services.market_data import market_data
from app.services.currency_service import RATES

router = APIRouter(prefix="/api", tags=["prices", "currencies"])

@router.get("/prices")
def get_prices(symbols: str):
    symbol_list = [s.strip() for s in symbols.split(",") if s.strip()]
    return market_data.get_current_prices(symbol_list)

@router.get("/currencies")
def get_currencies():
    """Return supported currencies with their USD conversion rates."""
    return RATES
