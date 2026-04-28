"""
Performance-weighted allocation engine.

Algorithm:
1. Fetch 5-day returns for each ticker using yfinance.
2. Shift all returns to be non-negative (subtract the minimum).
3. Normalize to weights that sum to 1.0.
4. If all returns are identical (edge case), fall back to equal weight.
5. Multiply weights by total investment amount to get dollar allocation.
6. Compute share count = floor(dollar_allocation / current_price).
   Any leftover cash is reported separately.
"""

import yfinance as yf
import pandas as pd
from typing import Any


def _fetch_5day_returns(symbols: list[str]) -> dict[str, float]:
    """
    Downloads last 6 trading days of Close prices and returns
    the 5-day percentage return for each symbol.
    Falls back to 0.0 if data is unavailable.
    """
    if not symbols:
        return {}

    raw = yf.download(
        tickers=symbols,
        period="6d",
        interval="1d",
        auto_adjust=True,
        progress=False,
    )

    close = raw["Close"] if "Close" in raw.columns else raw
    if isinstance(close, pd.Series):
        close = close.to_frame(symbols[0])

    returns: dict[str, float] = {}
    for sym in symbols:
        if sym in close.columns:
            col = close[sym].dropna()
            if len(col) >= 2:
                returns[sym] = float((col.iloc[-1] - col.iloc[0]) / col.iloc[0])
            else:
                returns[sym] = 0.0
        else:
            returns[sym] = 0.0
    return returns


def _fetch_current_prices(symbols: list[str]) -> dict[str, float]:
    """Returns the latest market price for each symbol."""
    prices: dict[str, float] = {}
    for sym in symbols:
        try:
            ticker = yf.Ticker(sym)
            info = ticker.fast_info
            prices[sym] = float(info.last_price)
        except Exception:
            prices[sym] = 0.0
    return prices


def _performance_weights(returns: dict[str, float]) -> dict[str, float]:
    """
    Converts raw returns to allocation weights.
    Shifts values to be ≥ 0, then normalizes.
    Falls back to equal weight when all are identical.
    """
    symbols = list(returns.keys())
    values = [returns[s] for s in symbols]

    min_val = min(values)
    shifted = [v - min_val for v in values]
    total = sum(shifted)

    if total == 0:
        n = len(symbols)
        return {s: 1 / n for s in symbols}

    return {s: shifted[i] / total for i, s in enumerate(symbols)}


def compute_allocation(
    tickers: list[dict],
    amount: float,
) -> dict[str, Any]:
    """
    Main entry point.

    Args:
        tickers: list of {"symbol": str, "name": str}
        amount:  total USD to invest

    Returns:
        {
            "allocations": [
                {
                    "symbol": str,
                    "name": str,
                    "weight": float,          # 0.0–1.0
                    "dollars": float,         # allocated USD
                    "current_price": float,
                    "shares": int,
                    "actual_spent": float,
                    "5day_return_pct": float,
                }
            ],
            "total_invested": float,
            "leftover_cash": float,
        }
    """
    symbols = [t["symbol"] for t in tickers]
    name_map = {t["symbol"]: t["name"] for t in tickers}

    returns = _fetch_5day_returns(symbols)
    prices = _fetch_current_prices(symbols)
    weights = _performance_weights(returns)

    allocations = []
    total_spent = 0.0

    for sym in symbols:
        weight = weights[sym]
        dollars = amount * weight
        price = prices[sym]

        if price > 0:
            shares = int(dollars // price)
            actual_spent = shares * price
        else:
            shares = 0
            actual_spent = 0.0

        total_spent += actual_spent
        allocations.append(
            {
                "symbol": sym,
                "name": name_map[sym],
                "weight": round(weight, 4),
                "dollars": round(dollars, 2),
                "current_price": round(price, 2),
                "shares": shares,
                "actual_spent": round(actual_spent, 2),
                "5day_return_pct": round(returns[sym] * 100, 2),
            }
        )

    # Sort by weight descending for display
    allocations.sort(key=lambda x: x["weight"], reverse=True)

    return {
        "allocations": allocations,
        "total_invested": round(total_spent, 2),
        "leftover_cash": round(amount - total_spent, 2),
    }
