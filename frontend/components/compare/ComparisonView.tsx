"use client";

import { useState } from "react";
import { StrategyInfo, StrategyKey } from "@/types";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PortfolioHero } from "@/components/dashboard/PortfolioHero";
import { TrendChart } from "@/components/dashboard/TrendChart";
import { RiskMetrics } from "@/components/dashboard/RiskMetrics";
import { ArrowLeft, GitCompare, Check } from "lucide-react";
import { STRATEGY_META } from "@/lib/constants";
import clsx from "clsx";

interface Props {
  strategies: StrategyInfo[];
}

function CompactStrategySelect({
  strategies,
  selected,
  onChange,
  label,
}: {
  strategies: StrategyInfo[];
  selected: StrategyKey[];
  onChange: (keys: StrategyKey[]) => void;
  label: string;
}) {
  const toggle = (key: StrategyKey) => {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else if (selected.length < 2) {
      onChange([...selected, key]);
    }
  };

  return (
    <Card className="space-y-4">
      <h3 className="text-xl font-bold text-slate-900 dark:text-white">{label}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400">Select 1–2 strategies</p>
      <div className="grid grid-cols-1 gap-3">
        {strategies.map((s) => {
          const isSelected = selected.includes(s.key);
          const isDisabled = !isSelected && selected.length >= 2;
          const meta = STRATEGY_META[s.key];
          const Icon = meta?.icon;

          return (
            <button
              key={s.key}
              onClick={() => toggle(s.key)}
              disabled={isDisabled}
              className={clsx(
                "flex items-center gap-3 p-3 rounded-xl border text-left transition-all",
                isSelected
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-500/10 shadow-sm"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
                isDisabled && !isSelected && "opacity-40 pointer-events-none"
              )}
            >
              <div
                className={clsx(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  isSelected
                    ? `bg-gradient-to-br ${meta?.gradient} text-white`
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                )}
              >
                {Icon && <Icon className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-slate-900 dark:text-white">{s.label}</p>
                <p className="text-xs text-slate-500 truncate">{s.description}</p>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}

export function ComparisonView({ strategies }: Props) {
  const [step, setStep] = useState<"setup" | "results">("setup");
  const [amount, setAmount] = useState(10000);
  const [selectedA, setSelectedA] = useState<StrategyKey[]>([]);
  const [selectedB, setSelectedB] = useState<StrategyKey[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [portfolioA, setPortfolioA] = useState<any>(null);
  const [portfolioB, setPortfolioB] = useState<any>(null);

  const handleCompare = async () => {
    if (selectedA.length === 0 || selectedB.length === 0) {
      setError("Please select strategies for both portfolios.");
      return;
    }
    if (amount < 5000) {
      setError("Minimum investment is $5,000.");
      return;
    }

    setIsComparing(true);
    setError(null);
    try {
      const res = await api.compare(amount, selectedA, selectedB);
      setPortfolioA(res.portfolio_a);
      setPortfolioB(res.portfolio_b);
      setStep("results");
    } catch (e: any) {
      setError(e.message || "Failed to compare portfolios.");
    } finally {
      setIsComparing(false);
    }
  };

  if (step === "results" && portfolioA && portfolioB) {
    const valA = portfolioA.allocations.reduce((s: number, a: any) => s + a.shares * a.current_price, 0) + portfolioA.leftover_cash;
    const valB = portfolioB.allocations.reduce((s: number, a: any) => s + a.shares * a.current_price, 0) + portfolioB.leftover_cash;
    
    const getReturn = (p: any) => p.trend?.length > 1 ? p.trend[p.trend.length - 1].portfolio_value - p.trend[0].portfolio_value : 0;
    const retA = getReturn(portfolioA);
    const retB = getReturn(portfolioB);
    const winner = retA > retB ? 'A' : retB > retA ? 'B' : 'TIE';

    return (
      <div className="space-y-8 pb-24 animate-fade-in-up">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <GitCompare className="w-6 h-6" /> Comparison Results
          </h2>
          <Button variant="ghost" onClick={() => setStep("setup")}>
            <ArrowLeft className="w-4 h-4 mr-2" /> New Comparison
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Portfolio A */}
          <div className={clsx("space-y-6 p-4 rounded-3xl border-2 transition-all", winner === 'A' ? "border-brand-500 shadow-xl shadow-brand-500/10" : "border-transparent")}>
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Portfolio A</h3>
              {winner === 'A' && <span className="bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-full">WINNER</span>}
              {winner === 'TIE' && <span className="bg-slate-500 text-white text-xs font-bold px-2 py-1 rounded-full">TIE</span>}
            </div>
            <PortfolioHero
              portfolioValue={valA}
              totalInvested={portfolioA.total_invested}
              strategies={portfolioA.strategies}
              isRefreshing={false}
              onRefresh={() => {}}
              lastUpdated={new Date()}
            />
            <RiskMetrics metrics={portfolioA.risk_metrics} />
            <TrendChart trend={portfolioA.trend} />
          </div>

          {/* Portfolio B */}
          <div className={clsx("space-y-6 p-4 rounded-3xl border-2 transition-all", winner === 'B' ? "border-brand-500 shadow-xl shadow-brand-500/10" : "border-transparent")}>
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Portfolio B</h3>
              {winner === 'B' && <span className="bg-brand-500 text-white text-xs font-bold px-2 py-1 rounded-full">WINNER</span>}
              {winner === 'TIE' && <span className="bg-slate-500 text-white text-xs font-bold px-2 py-1 rounded-full">TIE</span>}
            </div>
            <PortfolioHero
              portfolioValue={valB}
              totalInvested={portfolioB.total_invested}
              strategies={portfolioB.strategies}
              isRefreshing={false}
              onRefresh={() => {}}
              lastUpdated={new Date()}
            />
            <RiskMetrics metrics={portfolioB.risk_metrics} />
            <TrendChart trend={portfolioB.trend} />
          </div>
        </div>
      </div>
    );
  }

  // Setup Step
  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 animate-fade-in-up">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Compare Portfolios</h2>
        <p className="text-slate-500 dark:text-slate-400">See how different strategy combinations perform against each other.</p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl text-center text-sm font-medium">
          {error}
        </div>
      )}

      <Card className="flex flex-col items-center justify-center p-8">
        <Input
          type="number"
          label="Investment Amount (Shared)"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="max-w-xs text-center text-xl font-bold"
          prefixNode="$"
        />
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 items-center justify-center font-bold z-10 shadow-xl">
          VS
        </div>

        <CompactStrategySelect
          strategies={strategies}
          selected={selectedA}
          onChange={setSelectedA}
          label="Portfolio A"
        />

        <CompactStrategySelect
          strategies={strategies}
          selected={selectedB}
          onChange={setSelectedB}
          label="Portfolio B"
        />
      </div>

      <div className="flex justify-center pt-4">
        <Button size="lg" onClick={handleCompare} isLoading={isComparing} className="px-12 py-4 text-lg">
          {isComparing ? "Analyzing..." : "Compare Portfolios"}
        </Button>
      </div>
    </div>
  );
}
