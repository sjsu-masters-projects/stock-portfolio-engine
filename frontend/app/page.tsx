"use client";

import { useEffect, useState, useCallback } from "react";
import { api, StrategyKey, StrategyInfo, PortfolioResponse, HistoryEntry } from "@/lib/api";
import StrategySelector from "@/components/StrategySelector";
import AllocationTable from "@/components/AllocationTable";
import HistoryChart from "@/components/HistoryChart";
import clsx from "clsx";

type Step = "form" | "loading" | "results";

export default function Home() {
  const [step, setStep] = useState<Step>("form");
  const [strategies, setStrategies] = useState<StrategyInfo[]>([]);
  const [selected, setSelected] = useState<StrategyKey[]>([]);
  const [amount, setAmount] = useState<string>("10000");
  const [error, setError] = useState<string | null>(null);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Load strategies on mount
  useEffect(() => {
    api.getStrategies().then(setStrategies).catch(console.error);
    api.getHistory().then((r) => setHistory(r.history)).catch(console.error);
  }, []);

  // Auto-refresh prices every 60s when results are shown
  const refreshPortfolio = useCallback(async () => {
    if (!portfolio) return;
    setRefreshing(true);
    try {
      const fresh = await api.generatePortfolio(
        portfolio.amount,
        selected
      );
      setPortfolio(fresh);
      const h = await api.getHistory();
      setHistory(h.history);
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
      const h = await api.getHistory();
      setHistory(h.history);
      setStep("results");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setStep("form");
    }
  };

  return (
    <div className="space-y-8">
      {/* Input form */}
      <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Build your portfolio</h2>
          <p className="text-sm text-slate-500 mt-1">
            Enter your investment amount and select up to two strategies.
            Funds are allocated based on 5-day price performance.
          </p>
        </div>

        {/* Amount input */}
        <div className="space-y-1.5">
          <label htmlFor="amount" className="block text-sm font-medium text-slate-700">
            Investment amount (USD)
          </label>
          <div className="relative max-w-xs">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
            <input
              id="amount"
              type="number"
              min={5000}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-7 pr-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
              placeholder="10000"
            />
          </div>
          <p className="text-xs text-slate-400">Minimum: $5,000</p>
        </div>

        <StrategySelector
          strategies={strategies}
          selected={selected}
          onChange={setSelected}
        />

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={step === "loading"}
          className={clsx(
            "w-full sm:w-auto px-8 py-3 rounded-xl font-medium text-white transition-all",
            step === "loading"
              ? "bg-brand-400 cursor-not-allowed"
              : "bg-brand-600 hover:bg-brand-700 active:scale-[0.98]"
          )}
        >
          {step === "loading" ? "Fetching live prices…" : "Generate portfolio"}
        </button>
      </section>

      {/* Results */}
      {portfolio && step === "results" && (
        <>
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                Portfolio — {portfolio.strategies.join(" + ")}
              </h2>
              <button
                onClick={refreshPortfolio}
                disabled={refreshing}
                className="text-xs text-brand-600 hover:underline disabled:opacity-50"
              >
                {refreshing ? "Refreshing…" : "↻ Refresh prices"}
              </button>
            </div>
            <AllocationTable
              allocations={portfolio.allocations}
              totalInvested={portfolio.total_invested}
              leftoverCash={portfolio.leftover_cash}
              amount={portfolio.amount}
            />
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-6 space-y-2">
            <h2 className="text-lg font-semibold text-slate-900">Weekly trend</h2>
            <p className="text-sm text-slate-500">Portfolio value tracked over the last 5 days.</p>
            <HistoryChart history={history} />
          </section>
        </>
      )}
    </div>
  );
}
