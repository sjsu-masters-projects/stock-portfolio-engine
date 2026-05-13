"""
Market data service with yfinance integration and fallback mock data.

Provides:
- Historical close prices (7-day)
- Current prices (with TTL cache)
- Stock detail (company info)
"""

import time
import logging
import yfinance as yf
import pandas as pd
import numpy as np
from datetime import date, timedelta
from app.config import settings

logger = logging.getLogger(__name__)


class MarketDataService:
    def __init__(self, cache_ttl: int = settings.cache_ttl_seconds):
        self._cache: dict[str, tuple[float, float]] = {}  # symbol -> (price, timestamp)
        self._ttl = cache_ttl

    def get_close_history(self, symbols: list[str]) -> pd.DataFrame:
        """Fetch ~7 days of close prices. Falls back to mock data if yfinance fails."""
        if not symbols:
            return pd.DataFrame()
        
        try:
            raw = yf.download(
                tickers=symbols,
                period="7d",
                interval="1d",
                auto_adjust=True,
                progress=False,
            )
            
            if raw.empty:
                raise ValueError("Empty dataframe from yfinance")
                
            close = raw["Close"] if "Close" in raw.columns else raw
            if isinstance(close, pd.Series):
                close = close.to_frame(symbols[0])
            
            logger.info("Fetched live close history for %d symbols", len(symbols))
            return close
        except Exception as e:
            logger.warning("yfinance failed (%s), using mock data for %d symbols", e, len(symbols))
            return self._mock_close_history(symbols)

    def _mock_close_history(self, symbols: list[str]) -> pd.DataFrame:
        """Generate deterministic mock close prices for presentation safety."""
        dates = [date.today() - timedelta(days=i) for i in range(6, -1, -1)]
        np.random.seed(int(date.today().strftime("%Y%m%d")))
        
        mock_data = {}
        for sym in symbols:
            base = 100.0 + sum(ord(c) for c in sym)
            trend = np.linspace(base * 0.95, base * 1.05, 7) + np.random.normal(0, base * 0.01, 7)
            mock_data[sym] = trend
            
        return pd.DataFrame(mock_data, index=pd.DatetimeIndex(dates))

    def get_current_prices(self, symbols: list[str]) -> dict[str, float]:
        """Get latest prices with TTL caching. Falls back to mock if yfinance fails."""
        now = time.time()
        to_fetch = [s for s in symbols if s not in self._cache or now - self._cache[s][1] > self._ttl]
        
        if to_fetch:
            for sym in to_fetch:
                try:
                    price = float(yf.Ticker(sym).fast_info.last_price)
                except Exception:
                    # Deterministic mock price fallback
                    price = 100.0 + sum(ord(c) for c in sym)
                    logger.debug("Using mock price for %s: %.2f", sym, price)
                self._cache[sym] = (price, now)
                
        return {s: self._cache.get(s, (0.0, 0))[0] for s in symbols}

    def get_stock_detail(self, symbol: str) -> dict:
        """Get detailed stock info. Falls back to minimal mock data."""
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            return {
                "symbol": symbol,
                "name": info.get("longName", symbol),
                "sector": info.get("sector", "N/A"),
                "market_cap": info.get("marketCap", 0),
                "current_price": info.get("currentPrice", 0),
                "week_52_high": info.get("fiftyTwoWeekHigh", 0),
                "week_52_low": info.get("fiftyTwoWeekLow", 0),
                "pe_ratio": info.get("trailingPE"),
                "dividend_yield": info.get("dividendYield"),
            }
        except Exception:
            # Return mock detail so the frontend modal doesn't crash
            mock_price = 100.0 + sum(ord(c) for c in symbol)
            logger.warning("Stock detail fetch failed for %s, returning mock", symbol)
            return {
                "symbol": symbol,
                "name": symbol,
                "sector": "N/A",
                "market_cap": 0,
                "current_price": mock_price,
                "week_52_high": mock_price * 1.2,
                "week_52_low": mock_price * 0.8,
                "pe_ratio": None,
                "dividend_yield": None,
            }


# Module-level instance
market_data = MarketDataService()
