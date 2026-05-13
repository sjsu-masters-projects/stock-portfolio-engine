from fastapi import APIRouter
from app.models.responses import StockDetail, NewsArticle
from app.services.market_data import market_data
from app.services.news_service import news_service

router = APIRouter(prefix="/api", tags=["stocks"])

@router.get("/stocks/{symbol}", response_model=StockDetail)
def get_stock_detail(symbol: str):
    return market_data.get_stock_detail(symbol)

@router.get("/stocks/{symbol}/news", response_model=list[NewsArticle])
def get_stock_news(symbol: str):
    return news_service.get_news(symbol)
