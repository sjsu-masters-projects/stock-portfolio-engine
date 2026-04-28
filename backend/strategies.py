"""
Strategy to stock/ETF mapping.
Each strategy maps to at least 3 tickers.
When two strategies are selected, their pools are merged and
allocation is done across the combined set (blended pool).
"""

STRATEGIES: dict[str, list[dict]] = {
    "ethical": {
        "label": "Ethical Investing",
        "description": "Companies with strong ESG profiles and social responsibility.",
        "tickers": [
            {"symbol": "AAPL",  "name": "Apple Inc."},
            {"symbol": "ADBE",  "name": "Adobe Inc."},
            {"symbol": "NSRGY", "name": "Nestle S.A."},
            {"symbol": "MSFT",  "name": "Microsoft Corp."},
        ],
    },
    "growth": {
        "label": "Growth Investing",
        "description": "High-growth companies expected to outperform the market.",
        "tickers": [
            {"symbol": "NVDA",  "name": "NVIDIA Corp."},
            {"symbol": "TSLA",  "name": "Tesla Inc."},
            {"symbol": "AMZN",  "name": "Amazon.com Inc."},
            {"symbol": "META",  "name": "Meta Platforms Inc."},
        ],
    },
    "index": {
        "label": "Index Investing",
        "description": "Broad market exposure via diversified ETFs.",
        "tickers": [
            {"symbol": "VTI",  "name": "Vanguard Total Stock Market ETF"},
            {"symbol": "IXUS", "name": "iShares Core MSCI Total Intl Stock ETF"},
            {"symbol": "ILTB", "name": "iShares Core 10+ Year USD Bond ETF"},
            {"symbol": "QQQ",  "name": "Invesco QQQ Trust"},
        ],
    },
    "quality": {
        "label": "Quality Investing",
        "description": "Stable companies with strong fundamentals and consistent earnings.",
        "tickers": [
            {"symbol": "MSFT", "name": "Microsoft Corp."},
            {"symbol": "JNJ",  "name": "Johnson & Johnson"},
            {"symbol": "BRK-B","name": "Berkshire Hathaway Inc."},
            {"symbol": "PG",   "name": "Procter & Gamble Co."},
        ],
    },
    "value": {
        "label": "Value Investing",
        "description": "Undervalued stocks trading below their intrinsic value.",
        "tickers": [
            {"symbol": "BRK-B","name": "Berkshire Hathaway Inc."},
            {"symbol": "JPM",  "name": "JPMorgan Chase & Co."},
            {"symbol": "XOM",  "name": "Exxon Mobil Corp."},
            {"symbol": "BAC",  "name": "Bank of America Corp."},
        ],
    },
}


def get_tickers_for_strategies(strategy_keys: list[str]) -> list[dict]:
    """
    Return a deduplicated list of tickers for the given strategies.
    When multiple strategies are selected, tickers are merged (blended pool).
    """
    seen: set[str] = set()
    result: list[dict] = []
    for key in strategy_keys:
        if key not in STRATEGIES:
            raise ValueError(f"Unknown strategy: {key}")
        for ticker in STRATEGIES[key]["tickers"]:
            if ticker["symbol"] not in seen:
                seen.add(ticker["symbol"])
                result.append(ticker)
    return result


def get_strategy_labels(strategy_keys: list[str]) -> list[str]:
    return [STRATEGIES[k]["label"] for k in strategy_keys if k in STRATEGIES]
