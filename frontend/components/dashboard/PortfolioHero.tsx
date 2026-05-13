"use client";

import { RefreshCw } from "lucide-react";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { Badge } from "@/components/ui/Badge";
import { fmt } from "@/lib/formatters";

interface Props {
  portfolioValue: number;
  totalInvested: number;
  strategies: string[];
  isRefreshing: boolean;
  onRefresh: () => void;
  lastUpdated: Date;
}

export function PortfolioHero({
  portfolioValue,
  totalInvested,
  strategies,
  isRefreshing,
  onRefresh,
  lastUpdated,
}: Props) {
  const gainLoss = portfolioValue - totalInvested;
  const gainLossPct = totalInvested > 0 ? (gainLoss / totalInvested) * 100 : 0;
  const isPositive = gainLoss >= 0;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-900 p-8 sm:p-10 text-white shadow-2xl shadow-brand-500/20 group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-64 h-64 bg-brand-400/20 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-brand-100/80 font-medium mb-1">Current Portfolio Value</p>
          <div className="text-5xl sm:text-6xl font-bold tracking-tight mb-4 flex items-center gap-4">
            <AnimatedNumber value={portfolioValue} formatter={fmt} duration={1000} />
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Badge variant={isPositive ? "success" : "danger"} className="bg-white/20 text-white border-none text-sm px-3 py-1">
              {isPositive ? "▲" : "▼"} {fmt(Math.abs(gainLoss))} ({gainLossPct > 0 ? "+" : ""}{gainLossPct.toFixed(2)}%)
            </Badge>
            <span className="text-brand-200/80 text-sm">All time return</span>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-4 mt-6 sm:mt-0">
          <div className="flex flex-wrap gap-2 sm:justify-end">
            {strategies.map((s) => (
              <span key={s} className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-medium backdrop-blur-md border border-white/10">
                {s}
              </span>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-xs text-brand-200/60">
              Updated {lastUpdated.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors disabled:opacity-50"
              aria-label="Refresh prices"
            >
              <RefreshCw className={`w-4 h-4 text-white ${isRefreshing ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
