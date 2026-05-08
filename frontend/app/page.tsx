"use client";

import { useEffect, useState, useCallback } from "react";
import {
  api,
  StrategyKey,
  StrategyInfo,
  PortfolioResponse,
} from "@/lib/api";
import StrategySelector from "@/components/StrategySelector";
import AllocationTable from "@/components/AllocationTable";
import AllocationPieChart from "@/components/AllocationPieChart";
import HistoryChart from "@/components/HistoryChart";
import LoadingSpinner from "@/components/LoadingSpinner";
import clsx from "clsx";

type Step = "form" | "loading" | "results";

export default function Home() {
  const [step, setStep] = useState<Step>("form");
  const [strategies, setStrategies] = useState<StrategyInfo[]>([]);
  const [selected, setSelected] = useState<StrategyKey[]>([]);
  const [amount, setAmount] = useState<string>("10000");
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Load strategies on mount
  useEffect(() => {
    api.getStrategies().then(setStrategies).catch(console.error);
  }, []);

  // Compute the current portfolio value from allocations (shares × price)
  const portfolioValue = portfolio
    ? portfolio.allocations.reduce(
        (sum, a) => sum + a.shares * a.current_price,
        0
      )
    : 0;

  // Auto-refresh prices every 60s when results are shown
  const refreshPortfolio = useCallback(async () => {
    if (!portfolio) return;
    setRefreshing(true);
    try {
      const fresh = await api.generatePortfolio(portfolio.amount, selected);
      setPortfolio(fresh);
    } catch {
      // silent refresh failure
    } finally {
      setRefreshing(false);
    }
  }, [portfolio, selected]);

  useEffect(() => {
    if (step !== "results") return;
    const interval = setInterval(refreshPortfolio, 60_000);
    return () => clearInterval(interval);
  }, [step, refreshPortfolio]);

  const handleSubmit = async () => {
    setError(null);
    const numAmount = parseFloat(amount.replace(/,/g, ""));
    if (isNaN(numAmount) || numAmount < 5000) {
      setError("Please enter a valid amount of at least $5,000.");
      return;
    }
    if (selected.length === 0) {
      setError("Please select at least one investment strategy.");
      return;
    }
    setStep("loading");
    try {
      const res = await api.generatePortfolio(numAmount, selected);
      setPortfolio(res);
      setStep("results");
    } catch (e: unknown) {
      setError(
        e instanceof Error
          ? e.message
          : "Something went wrong. Please try again."
      );
      setStep("form");
    }
  };

  return (
    <div className="space-y-8">
      {/* ── Input form ──────────────────────────────────────────── */}
      <section className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-6 animate-fade-in-up">
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Build your portfolio
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Enter your investment amount and select up to two strategies. Funds
            are allocated based on 5-day price performance.
          </p>
        </div>

        {/* Amount input */}
        <div className="space-y-1.5">
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Investment amount (USD)
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">
              $
            </span>
            <input
              id="amount"
              type="number"
              min={5000}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-7 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-shadow"
              placeholder="10000"
            />
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-500">
            Minimum: $5,000
          </p>
        </div>

        <StrategySelector
          strategies={strategies}
          selected={selected}
          onChange={setSelected}
        />

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={step === "loading"}
          className={clsx(
            "w-full sm:w-auto px-8 py-3 rounded-xl font-medium text-white transition-all shadow-lg shadow-brand-600/20",
            step === "loading"
              ? "bg-brand-400 cursor-not-allowed"
              : "bg-brand-600 hover:bg-brand-700 active:scale-[0.98] hover:shadow-xl hover:shadow-brand-600/30"
          )}
        >
          {step === "loading"
            ? "Fetching live prices…"
            : "Generate portfolio"}
        </button>
      </section>

      {/* ── Loading state ───────────────────────────────────────── */}
      {step === "loading" && <LoadingSpinner />}

      {/* ── Results ─────────────────────────────────────────────── */}
      {portfolio && step === "results" && (
        <>
          {/* Allocation table + portfolio value */}
          <section className="space-y-3 animate-fade-in-up">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Portfolio — {portfolio.strategies.join(" + ")}
              </h2>
              <button
                onClick={refreshPortfolio}
                disabled={refreshing}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline disabled:opacity-50"
              >
                {refreshing ? "Refreshing…" : "↻ Refresh prices"}
              </button>
            </div>
            <AllocationTable
              allocations={portfolio.allocations}
              totalInvested={portfolio.total_invested}
              leftoverCash={portfolio.leftover_cash}
              amount={portfolio.amount}
              portfolioValue={portfolioValue}
            />
          </section>

          {/* Pie chart */}
          <section className="animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
            <AllocationPieChart allocations={portfolio.allocations} />
          </section>

          {/* Weekly trend chart */}
          <section
            className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-2 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Weekly trend
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Portfolio value tracked over the last 5 trading days.
            </p>
            <HistoryChart trend={portfolio.trend} />
          </section>
        </>
      )}
    </div>
  );
}
