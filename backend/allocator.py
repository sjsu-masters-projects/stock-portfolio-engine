"""
Performance-weighted allocation engine.

Algorithm:
1. Fetch 5-day close prices for each ticker using yfinance.
2. Compute 5-day percentage returns from the close data.
3. Shift all returns to be non-negative (subtract the minimum).
4. Normalize to weights that sum to 1.0.
5. If all returns are identical (edge case), fall back to equal weight.
6. Multiply weights by total investment amount to get dollar allocation.
7. Compute share count = floor(dollar_allocation / current_price).
   Any leftover cash is reported separately.
8. Compute a synthetic 5-day portfolio value trend from historical prices.
"""

import yfinance as yf
import pandas as pd
from typing import Any


def _fetch_close_history(symbols: list[str]) -> pd.DataFrame:
    """
    Downloads ~5 trading days of Close prices.
    Returns a DataFrame with dates as index and symbols as columns.
    """
    if not symbols:
        return pd.DataFrame()

    raw = yf.download(
        tickers=symbols,
        period="7d",
        interval="1d",
        auto_adjust=True,
        progress=False,
    )

    close = raw["Close"] if "Close" in raw.columns else raw
    if isinstance(close, pd.Series):
        close = close.to_frame(symbols[0])

    return close


def _returns_from_close(
    close: pd.DataFrame, symbols: list[str]
) -> dict[str, float]:
    """Compute 5-day percentage return from the close DataFrame."""
    returns: dict[str, float] = {}
    for sym in symbols:
        if sym in close.columns:
            col = close[sym].dropna()
            if len(col) >= 2:
                returns[sym] = float(
                    (col.iloc[-1] - col.iloc[0]) / col.iloc[0]
                )
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


def _compute_trend(
    close: pd.DataFrame, shares_map: dict[str, int]
) -> list[dict[str, Any]]:
    """
    Compute the hypothetical portfolio value for each trading day
    in the close-price history, using the allocated share counts.
    This gives us a synthetic 5-day trend even on the first run.
    """
    trend: list[dict[str, Any]] = []
    for i in range(len(close)):
        row = close.iloc[i]
        date_str = close.index[i].strftime("%Y-%m-%d")
        total = 0.0
        for sym, shares in shares_map.items():
            if sym in close.columns and pd.notna(row.get(sym)):
                total += shares * float(row[sym])
        trend.append(
            {
                "date": date_str,
                "portfolio_value": round(total, 2),
            }
        )
    return trend


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
            "trend": [{"date": str, "portfolio_value": float}, ...],
        }
    """
    symbols = [t["symbol"] for t in tickers]
    name_map = {t["symbol"]: t["name"] for t in tickers}

    # Single download for history + returns
    close = _fetch_close_history(symbols)
    returns = _returns_from_close(close, symbols)
    prices = _fetch_current_prices(symbols)
    weights = _performance_weights(returns)

    allocations = []
    total_spent = 0.0
    shares_map: dict[str, int] = {}

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
        shares_map[sym] = shares
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

    # Compute 5-day portfolio value trend from historical close prices
    trend = _compute_trend(close, shares_map)

    return {
        "allocations": allocations,
        "total_invested": round(total_spent, 2),
        "leftover_cash": round(amount - total_spent, 2),
        "trend": trend,
    }
