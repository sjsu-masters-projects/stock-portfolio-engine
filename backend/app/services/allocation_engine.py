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
9. Compute risk metrics (beta, volatility, diversification, sharpe).
"""

import logging
import pandas as pd
import numpy as np
from typing import Any
from app.services.market_data import market_data

logger = logging.getLogger(__name__)


class AllocationEngine:
    @staticmethod
    def _returns_from_close(close: pd.DataFrame, symbols: list[str]) -> dict[str, float]:
        """Compute 5-day percentage return from the close DataFrame."""
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

    @staticmethod
    def _performance_weights(returns: dict[str, float]) -> dict[str, float]:
        """
        Converts raw returns to allocation weights.
        Shifts values to be >= 0, then normalizes.
        Falls back to equal weight when all are identical.
        """
        symbols = list(returns.keys())
        values = [returns[s] for s in symbols]

        min_val = min(values) if values else 0
        shifted = [v - min_val for v in values]
        total = sum(shifted)

        if total == 0:
            n = len(symbols)
            return {s: 1 / n for s in symbols} if n > 0 else {}

        return {s: shifted[i] / total for i, s in enumerate(symbols)}

    @staticmethod
    def _compute_trend(close: pd.DataFrame, shares_map: dict[str, int]) -> list[dict[str, Any]]:
        """
        Compute the hypothetical portfolio value for each trading day
        in the close-price history, using the allocated share counts.
        """
        trend: list[dict[str, Any]] = []
        for i in range(len(close)):
            row = close.iloc[i]
            date_str = close.index[i].strftime("%Y-%m-%d")
            total = 0.0
            for sym, shares in shares_map.items():
                if sym in close.columns and pd.notna(row.get(sym)):
                    total += shares * float(row[sym])
            trend.append({
                "date": date_str,
                "portfolio_value": round(total, 2),
            })
        return trend

    @staticmethod
    def compute_risk_metrics(returns_pct: dict[str, float], weights: dict[str, float]) -> dict[str, float]:
        """
        Compute simplified risk metrics for the portfolio.
        - volatility: std dev of asset returns (proxy for portfolio risk)
        - diversification: 1 - HHI (Herfindahl index of weights)
        - beta: weighted average of individual returns relative to mean (simplified)
        - sharpe: excess return over risk-free rate divided by volatility
        """
        returns_array = np.array(list(returns_pct.values()))
        weights_array = np.array([weights.get(s, 0) for s in returns_pct.keys()])
        
        # Volatility: weighted std of returns
        if len(returns_array) > 1:
            portfolio_return = float(np.dot(weights_array, returns_array))
            # Weighted variance
            deviations = returns_array - portfolio_return
            weighted_var = float(np.dot(weights_array, deviations ** 2))
            volatility = float(np.sqrt(weighted_var))
        else:
            portfolio_return = float(returns_array[0]) if len(returns_array) == 1 else 0.0
            volatility = 0.0

        # Diversification score: 1 - HHI (0 = single asset, approaching 1 = many equal assets)
        hhi = float(np.sum(weights_array ** 2))
        diversification = max(0.0, 1.0 - hhi)

        # Beta proxy: ratio of portfolio return to average market return
        avg_return = float(np.mean(returns_array)) if len(returns_array) > 0 else 0.0
        if abs(avg_return) > 1e-10:
            beta = portfolio_return / avg_return
        else:
            beta = 1.0

        # Sharpe ratio: (portfolio return - risk-free) / volatility
        # Using 5-day risk-free rate (annual 4.5% -> ~0.087% per 5 days)
        risk_free_rate = 0.045 * (5 / 252)
        if volatility > 1e-10:
            sharpe = float((portfolio_return - risk_free_rate) / volatility)
        else:
            sharpe = 0.0

        return {
            "beta": round(beta, 2),
            "volatility": round(volatility * 100, 2),  # as percentage
            "diversification_score": round(diversification * 100, 2),  # 0-100 scale
            "sharpe_ratio": round(sharpe, 2)
        }

    def compute_allocation(self, tickers: list[dict], amount: float) -> dict[str, Any]:
        """
        Main entry point.

        Args:
            tickers: list of {"symbol": str, "name": str}
            amount:  total USD to invest

        Returns allocation dict with allocations, trend, and risk_metrics.
        """
        symbols = [t["symbol"] for t in tickers]
        name_map = {t["symbol"]: t["name"] for t in tickers}

        close = market_data.get_close_history(symbols)
        returns = self._returns_from_close(close, symbols)
        prices = market_data.get_current_prices(symbols)
        weights = self._performance_weights(returns)

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
            allocations.append({
                "symbol": sym,
                "name": name_map[sym],
                "weight": round(weight, 4),
                "dollars": round(dollars, 2),
                "current_price": round(price, 2),
                "shares": shares,
                "actual_spent": round(actual_spent, 2),
                "five_day_return_pct": round(returns[sym] * 100, 2),
            })

        allocations.sort(key=lambda x: x["weight"], reverse=True)
        trend = self._compute_trend(close, shares_map)
        risk_metrics = self.compute_risk_metrics(returns, weights)

        logger.info(
            "Allocation: %d tickers, $%.2f invested, $%.2f leftover",
            len(tickers), total_spent, amount - total_spent
        )

        return {
            "allocations": allocations,
            "total_invested": round(total_spent, 2),
            "leftover_cash": round(amount - total_spent, 2),
            "trend": trend,
            "risk_metrics": risk_metrics
        }


allocation_engine = AllocationEngine()
