"use client";

import { RiskMetrics as RiskMetricsType } from "@/types";
import { Card } from "@/components/ui/Card";
import { Activity, Zap, Shield, TrendingUp } from "lucide-react";
import clsx from "clsx";

interface Props {
  metrics: RiskMetricsType | null;
}

export function RiskMetrics({ metrics }: Props) {
  if (!metrics) return null;

  const items = [
    {
      label: "Portfolio Beta",
      value: metrics.beta.toFixed(2),
      desc: "Market sensitivity (1.0 = matches market)",
      icon: Activity,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
      barColor: "bg-blue-500",
      progress: Math.min((metrics.beta / 2) * 100, 100)
    },
    {
      label: "Volatility (5D)",
      value: `${metrics.volatility}%`,
      desc: "Price fluctuation risk",
      icon: Zap,
      color: "text-amber-500",
      bg: "bg-amber-500/10",
      barColor: "bg-amber-500",
      progress: Math.min((metrics.volatility / 10) * 100, 100)
    },
    {
      label: "Diversification",
      value: `${metrics.diversification_score}/100`,
      desc: "Asset spread score",
      icon: Shield,
      color: "text-emerald-500",
      bg: "bg-emerald-500/10",
      barColor: "bg-emerald-500",
      progress: metrics.diversification_score
    },
    {
      label: "Sharpe Ratio",
      value: metrics.sharpe_ratio.toFixed(2),
      desc: "Risk-adjusted return",
      icon: TrendingUp,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
      barColor: "bg-purple-500",
      progress: Math.min((Math.max(metrics.sharpe_ratio, 0) / 3) * 100, 100)
    }
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <Card key={item.label} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className={clsx("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", item.bg, item.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <p className="font-bold text-lg text-slate-900 dark:text-white">{item.value}</p>
            </div>
            <p className="font-semibold text-slate-900 dark:text-white text-sm">{item.label}</p>
            <p className="text-xs text-slate-500 mt-1 mb-3">{item.desc}</p>
            <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div className={clsx("h-full rounded-full", item.barColor)} style={{ width: `${item.progress}%` }} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
