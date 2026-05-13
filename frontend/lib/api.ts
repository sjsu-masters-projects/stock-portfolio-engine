import {
  StrategyKey,
  StrategyInfo,
  PortfolioResponse,
  HistoryResponse,
  StockDetail,
  NewsArticle,
} from "@/types";

const BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

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

  getStockDetail: (symbol: string) =>
    request<StockDetail>(`/api/stocks/${symbol}`),

  getStockNews: (symbol: string) =>
    request<NewsArticle[]>(`/api/stocks/${symbol}/news`),

  getPrices: (symbols: string[]) =>
    request<Record<string, number>>(`/api/prices?symbols=${symbols.join(",")}`),

  compare: (amount: number, a: StrategyKey[], b: StrategyKey[]) =>
    request<{ portfolio_a: PortfolioResponse; portfolio_b: PortfolioResponse }>(
      "/api/compare",
      {
        method: "POST",
        body: JSON.stringify({ amount, strategies_a: a, strategies_b: b }),
      }
    ),

  getCurrencies: () => request<Record<string, number>>("/api/currencies"),

  // Saved portfolios
  listPortfolios: () => request<any[]>("/api/portfolios"),

  savePortfolio: (config: any) =>
    request<{ status: string; id: string }>("/api/portfolios/save", {
      method: "POST",
      body: JSON.stringify(config),
    }),

  deletePortfolio: (id: string) =>
    request<{ status: string }>(`/api/portfolios/${id}`, {
      method: "DELETE",
    }),
};
