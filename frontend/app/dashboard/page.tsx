"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { usePortfolio } from "@/hooks/usePortfolio";
import { PortfolioHero } from "@/components/dashboard/PortfolioHero";
import { AllocationTable } from "@/components/dashboard/AllocationTable";
import { StockTicker } from "@/components/dashboard/StockTicker";

import { RiskMetrics } from "@/components/dashboard/RiskMetrics";
import { StockDetailModal } from "@/components/dashboard/StockDetailModal";
import { Button } from "@/components/ui/Button";
import { ArrowLeft } from "lucide-react";

// Recharts requires DOM measurement — must skip SSR
const TrendChart = dynamic(
  () => import("@/components/dashboard/TrendChart").then((m) => m.TrendChart),
  { ssr: false }
);
const AllocationDonut = dynamic(
  () => import("@/components/dashboard/AllocationDonut").then((m) => m.AllocationDonut),
  { ssr: false }
);

export default function DashboardPage() {
  const router = useRouter();
  const { portfolio, refresh, isGenerating } = usePortfolio();
  const [selectedStock, setSelectedStock] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Auto-refresh every 60s
  useEffect(() => {
    if (!portfolio) return;
    const interval = setInterval(async () => {
      await refresh();
      setLastUpdated(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, [portfolio, refresh]);

  if (!portfolio) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">No Portfolio Generated</h2>
        <p className="text-slate-500 dark:text-slate-400">Head back to the builder to create your custom portfolio.</p>
        <Button onClick={() => router.push("/portfolio")}>
          Go to Builder
        </Button>
      </div>
    );
  }

  const currentPortfolioValue = portfolio.allocations.reduce((sum, a) => sum + a.shares * a.current_price, 0) + portfolio.leftover_cash;

  return (
    <div className="space-y-6 pb-24 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <Button variant="ghost" onClick={() => router.push("/portfolio")} className="text-slate-500 hidden sm:flex">
          <ArrowLeft className="w-4 h-4 mr-2" /> New Portfolio
        </Button>
      </div>

      <PortfolioHero
        portfolioValue={currentPortfolioValue}
        totalInvested={portfolio.total_invested}
        strategies={portfolio.strategies}
        isRefreshing={isGenerating}
        onRefresh={async () => {
          await refresh();
          setLastUpdated(new Date());
        }}
        lastUpdated={lastUpdated}
      />

      <StockTicker 
        allocations={portfolio.allocations} 
        onStockClick={setSelectedStock} 
      />

      <RiskMetrics metrics={portfolio.risk_metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <TrendChart trend={portfolio.trend} />
          <AllocationTable 
            allocations={portfolio.allocations} 
            onRowClick={setSelectedStock} 
          />
        </div>
        <div className="space-y-6">
          <AllocationDonut 
            allocations={portfolio.allocations} 
            totalValue={portfolio.total_invested} 
          />
        </div>
      </div>

      <StockDetailModal 
        symbol={selectedStock} 
        onClose={() => setSelectedStock(null)} 
      />
    </div>
  );
}
