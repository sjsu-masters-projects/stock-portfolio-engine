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
  five_day_return_pct: number;
}

export interface TrendEntry {
  date: string;
  portfolio_value: number;
}

export interface RiskMetrics {
  beta: number;
  volatility: number;
  diversification_score: number;
  sharpe_ratio: number;
}

export interface PortfolioResponse {
  amount: number;
  strategies: string[];
  strategy_keys: string[];
  tickers_used: string[];
  allocations: Allocation[];
  total_invested: number;
  leftover_cash: number;
  trend: TrendEntry[];
  risk_metrics: RiskMetrics | null;
}

export interface StockDetail {
  symbol: string;
  name: string;
  sector: string;
  market_cap: number;
  current_price: number;
  week_52_high: number;
  week_52_low: number;
  pe_ratio: number | null;
  dividend_yield: number | null;
}

export interface NewsArticle {
  title: string;
  publisher: string;
  link: string;
  published: string;
}

export interface HistoryEntry {
  date: string;
  portfolio_value: number;
  strategies: string[];
}

export interface HistoryResponse {
  history: HistoryEntry[];
}
