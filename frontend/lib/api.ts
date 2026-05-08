/**
 * API client for the FastAPI backend.
 * All endpoints resolve from NEXT_PUBLIC_API_URL (default: http://localhost:8000).
 */

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export type StrategyKey = "ethical" | "growth" | "index" | "quality" | "value";

export interface StrategyInfo {
  key: StrategyKey;
  label: string;
  description: string;
  tickers: { symbol: string; name: string }[];
}

export interface Allocation {
  symbol: string;
  name: string;
  weight: number;
  dollars: number;
  current_price: number;
  shares: number;
  actual_spent: number;
  "5day_return_pct": number;
}

export interface TrendEntry {
  date: string;
  portfolio_value: number;
}

export interface PortfolioResponse {
  amount: number;
  strategies: string[];
  tickers_used: string[];
  allocations: Allocation[];
  total_invested: number;
  leftover_cash: number;
  trend: TrendEntry[];
}

export interface HistoryEntry {
  date: string;
  portfolio_value: number;
  strategies: string[];
}

export interface HistoryResponse {
  history: HistoryEntry[];
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail ?? `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export const api = {
  getStrategies: () => request<StrategyInfo[]>("/api/strategies"),

  generatePortfolio: (amount: number, strategies: StrategyKey[]) =>
    request<PortfolioResponse>("/api/portfolio", {
      method: "POST",
      body: JSON.stringify({ amount, strategies }),
    }),

  getHistory: () => request<HistoryResponse>("/api/history"),
};
