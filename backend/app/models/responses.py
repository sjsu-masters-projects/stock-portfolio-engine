from pydantic import BaseModel

class AllocationItem(BaseModel):
    symbol: str
    name: str
    weight: float
    dollars: float
    current_price: float
    shares: int
    actual_spent: float
    five_day_return_pct: float

class TrendEntry(BaseModel):
    date: str
    portfolio_value: float

class RiskMetrics(BaseModel):
    beta: float
    volatility: float
    diversification_score: float
    sharpe_ratio: float

class PortfolioResponse(BaseModel):
    amount: float
    strategies: list[str]
    strategy_keys: list[str] = []
    tickers_used: list[str]
    allocations: list[AllocationItem]
    total_invested: float
    leftover_cash: float
    trend: list[TrendEntry]
    risk_metrics: RiskMetrics | None = None

class StockDetail(BaseModel):
    symbol: str
    name: str
    sector: str
    market_cap: float
    current_price: float
    week_52_high: float
    week_52_low: float
    pe_ratio: float | None
    dividend_yield: float | None

class NewsArticle(BaseModel):
    title: str
    publisher: str
    link: str
    published: str
