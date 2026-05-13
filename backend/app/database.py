"""
SQLite persistence layer for the Stock Portfolio Engine.

Tables:
  - strategies: investment strategy definitions
  - strategy_tickers: tickers belonging to each strategy
  - portfolios: saved portfolio configurations
  - history: daily portfolio value snapshots
"""

import sqlite3
import os
import uuid
import logging
from datetime import date, datetime
from typing import Any
from contextlib import contextmanager

from app.config import settings

logger = logging.getLogger(__name__)

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "portfolio.db")

SCHEMA = """
CREATE TABLE IF NOT EXISTS strategies (
    key         TEXT PRIMARY KEY,
    label       TEXT NOT NULL,
    description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS strategy_tickers (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    strategy_key TEXT NOT NULL REFERENCES strategies(key),
    symbol      TEXT NOT NULL,
    name        TEXT NOT NULL,
    UNIQUE(strategy_key, symbol)
);

CREATE TABLE IF NOT EXISTS history (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    date            TEXT NOT NULL,
    portfolio_value REAL NOT NULL,
    strategies      TEXT NOT NULL,
    UNIQUE(date)
);

CREATE TABLE IF NOT EXISTS portfolios (
    id          TEXT PRIMARY KEY,
    saved_at    TEXT NOT NULL,
    data        TEXT NOT NULL
);
"""

# Default seed data
SEED_STRATEGIES = [
    ("ethical",  "Ethical Investing",  "Companies with strong ESG profiles.", [
        ("AAPL", "Apple Inc."), ("ADBE", "Adobe Inc."),
        ("NSRGY", "Nestle S.A."), ("MSFT", "Microsoft Corp."),
    ]),
    ("growth",   "Growth Investing",  "High-growth companies expected to outperform the market.", [
        ("NVDA", "NVIDIA Corp."), ("TSLA", "Tesla Inc."),
        ("AMZN", "Amazon.com Inc."), ("META", "Meta Platforms Inc."),
    ]),
    ("index",    "Index Investing",   "Broad market exposure via diversified ETFs.", [
        ("VTI", "Vanguard Total Stock Market ETF"),
        ("IXUS", "iShares Core MSCI Total Intl Stock ETF"),
        ("ILTB", "iShares Core 10+ Year USD Bond ETF"),
        ("QQQ", "Invesco QQQ Trust"),
    ]),
    ("quality",  "Quality Investing", "Stable companies with strong fundamentals and consistent earnings.", [
        ("MSFT", "Microsoft Corp."), ("JNJ", "Johnson & Johnson"),
        ("BRK-B", "Berkshire Hathaway Inc."), ("PG", "Procter & Gamble Co."),
    ]),
    ("value",    "Value Investing",   "Undervalued stocks trading below their intrinsic value.", [
        ("BRK-B", "Berkshire Hathaway Inc."), ("JPM", "JPMorgan Chase & Co."),
        ("XOM", "Exxon Mobil Corp."), ("BAC", "Bank of America Corp."),
    ]),
]


@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")  # Safe for concurrent reads
    conn.execute("PRAGMA foreign_keys=ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Create tables and seed strategy data if empty."""
    with get_db() as conn:
        conn.executescript(SCHEMA)

        # Seed strategies only if table is empty
        count = conn.execute("SELECT COUNT(*) FROM strategies").fetchone()[0]
        if count == 0:
            logger.info("Seeding strategy data into SQLite...")
            for key, label, desc, tickers in SEED_STRATEGIES:
                conn.execute(
                    "INSERT INTO strategies (key, label, description) VALUES (?, ?, ?)",
                    (key, label, desc),
                )
                for symbol, name in tickers:
                    conn.execute(
                        "INSERT OR IGNORE INTO strategy_tickers (strategy_key, symbol, name) VALUES (?, ?, ?)",
                        (key, symbol, name),
                    )
            logger.info("Seeded %d strategies.", len(SEED_STRATEGIES))


# ── Repository classes ──────────────────────────────────────────────────────────

class StrategyRepository:
    """Data access for strategies (replaces StrategyRegistry + 5 classes)."""

    def all(self) -> list[dict]:
        with get_db() as conn:
            rows = conn.execute("SELECT key, label, description FROM strategies ORDER BY key").fetchall()
            result = []
            for row in rows:
                tickers = conn.execute(
                    "SELECT symbol, name FROM strategy_tickers WHERE strategy_key = ?",
                    (row["key"],)
                ).fetchall()
                result.append({
                    "key": row["key"],
                    "label": row["label"],
                    "description": row["description"],
                    "tickers": [{"symbol": t["symbol"], "name": t["name"]} for t in tickers],
                })
            return result

    def get(self, key: str) -> dict | None:
        with get_db() as conn:
            row = conn.execute("SELECT key, label, description FROM strategies WHERE key = ?", (key,)).fetchone()
            if not row:
                return None
            tickers = conn.execute(
                "SELECT symbol, name FROM strategy_tickers WHERE strategy_key = ?", (key,)
            ).fetchall()
            return {
                "key": row["key"],
                "label": row["label"],
                "description": row["description"],
                "tickers": [{"symbol": t["symbol"], "name": t["name"]} for t in tickers],
            }

    def get_tickers(self, keys: list[str]) -> list[dict]:
        """Return deduplicated tickers for given strategy keys, preserving order."""
        seen: set[str] = set()
        result: list[dict] = []
        with get_db() as conn:
            for key in keys:
                tickers = conn.execute(
                    "SELECT symbol, name FROM strategy_tickers WHERE strategy_key = ?", (key,)
                ).fetchall()
                for t in tickers:
                    if t["symbol"] not in seen:
                        seen.add(t["symbol"])
                        result.append({"symbol": t["symbol"], "name": t["name"]})
        return result

    def get_label(self, key: str) -> str:
        with get_db() as conn:
            row = conn.execute("SELECT label FROM strategies WHERE key = ?", (key,)).fetchone()
            return row["label"] if row else key


class HistoryRepository:
    """Data access for portfolio history and saved portfolios."""

    def record_snapshot(self, portfolio_value: float, strategies: list[str]) -> None:
        import json
        today = date.today().isoformat()
        with get_db() as conn:
            conn.execute(
                "INSERT OR REPLACE INTO history (date, portfolio_value, strategies) VALUES (?, ?, ?)",
                (today, round(portfolio_value, 2), json.dumps(strategies)),
            )
            # Keep only last N entries
            conn.execute(
                "DELETE FROM history WHERE id NOT IN (SELECT id FROM history ORDER BY date DESC LIMIT ?)",
                (settings.history_max_entries,),
            )

    def get_history(self) -> list[dict]:
        import json
        with get_db() as conn:
            rows = conn.execute("SELECT date, portfolio_value, strategies FROM history ORDER BY date ASC").fetchall()
            return [
                {
                    "date": row["date"],
                    "portfolio_value": row["portfolio_value"],
                    "strategies": json.loads(row["strategies"]),
                }
                for row in rows
            ]

    def save_portfolio(self, config: dict) -> str:
        import json
        portfolio_id = str(uuid.uuid4())
        with get_db() as conn:
            conn.execute(
                "INSERT INTO portfolios (id, saved_at, data) VALUES (?, ?, ?)",
                (portfolio_id, datetime.now().isoformat(), json.dumps(config)),
            )
        return portfolio_id

    def list_portfolios(self) -> list[dict]:
        import json
        with get_db() as conn:
            rows = conn.execute("SELECT id, saved_at, data FROM portfolios ORDER BY saved_at DESC").fetchall()
            result = []
            for row in rows:
                data = json.loads(row["data"])
                data["id"] = row["id"]
                data["saved_at"] = row["saved_at"]
                result.append(data)
            return result

    def delete_portfolio(self, portfolio_id: str) -> bool:
        with get_db() as conn:
            cursor = conn.execute("DELETE FROM portfolios WHERE id = ?", (portfolio_id,))
            return cursor.rowcount > 0


def compute_portfolio_value(allocations: list[dict[str, Any]]) -> float:
    """Sum up the current market value across all positions."""
    return sum(a["shares"] * a["current_price"] for a in allocations)


# Module-level instances for DI
strategy_repo = StrategyRepository()
history_repo = HistoryRepository()
