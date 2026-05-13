"""News service using yfinance ticker news."""

import logging
import yfinance as yf

logger = logging.getLogger(__name__)


class NewsService:
    @staticmethod
    def get_news(symbol: str, limit: int = 5) -> list[dict]:
        try:
            ticker = yf.Ticker(symbol)
            articles = getattr(ticker, "news", []) or []
            return [
                {
                    "title": a.get("title", ""),
                    "publisher": a.get("publisher", ""),
                    "link": a.get("link", ""),
                    "published": str(a.get("providerPublishTime", 0)),
                }
                for a in articles[:limit]
            ]
        except Exception as e:
            logger.warning("News fetch failed for %s: %s", symbol, e)
            return []


news_service = NewsService()
