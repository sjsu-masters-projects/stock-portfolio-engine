"""
5-day portfolio history store.

Persists daily portfolio snapshots to history.json.
Each snapshot records the total portfolio value for that day.
Only the last 5 entries are kept (rolling window).
"""

import json
import os
from datetime import date
from typing import Any

HISTORY_FILE = os.path.join(os.path.dirname(__file__), "history.json")
MAX_ENTRIES = 5


def _load() -> list[dict]:
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, "r") as f:
            data = json.load(f)
            return data if isinstance(data, list) else []
    except (json.JSONDecodeError, OSError):
        return []


def _save(entries: list[dict]) -> None:
    with open(HISTORY_FILE, "w") as f:
        json.dump(entries, f, indent=2)


def record_snapshot(portfolio_value: float, strategies: list[str]) -> None:
    """
    Save today's portfolio value.
    If an entry for today already exists, it is overwritten.
    """
    entries = _load()
    today = date.today().isoformat()

    # Remove existing entry for today if present
    entries = [e for e in entries if e.get("date") != today]

    entries.append(
        {
            "date": today,
            "portfolio_value": round(portfolio_value, 2),
            "strategies": strategies,
        }
    )

    # Keep only the last MAX_ENTRIES
    entries = entries[-MAX_ENTRIES:]
    _save(entries)


def get_history() -> list[dict]:
    """Return the stored history entries, oldest first."""
    return _load()


def compute_portfolio_value(allocations: list[dict[str, Any]]) -> float:
    """
    Sum up the current market value across all positions.
    market_value = shares * current_price
    """
    return sum(a["shares"] * a["current_price"] for a in allocations)
