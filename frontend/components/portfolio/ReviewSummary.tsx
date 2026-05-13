"use client";

import { StrategyInfo, StrategyKey } from "@/types";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fmt } from "@/lib/formatters";
import { STRATEGY_META } from "@/lib/constants";
import clsx from "clsx";

interface Props {
  amount: number;
  selectedKeys: StrategyKey[];
  strategies: StrategyInfo[];
  onGenerate: () => void;
  onEditAmount: () => void;
  onEditStrategy: () => void;
  isGenerating: boolean;
}

export function ReviewSummary({
  amount,
  selectedKeys,
  strategies,
  onGenerate,
  onEditAmount,
  onEditStrategy,
  isGenerating,
}: Props) {
  const selectedStrategies = strategies.filter((s) => selectedKeys.includes(s.key));
  const allTickers = Array.from(new Set(selectedStrategies.flatMap((s) => s.tickers.map((t) => t.symbol))));

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Review your choices
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Everything looks good? Let's generate your allocation.
        </p>
      </div>

      <Card className="p-0 overflow-hidden divide-y divide-slate-100 dark:divide-slate-800">
        {/* Amount Row */}
        <div className="p-6 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Investment Amount</p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{fmt(amount)}</p>
          </div>
          <Button variant="ghost" onClick={onEditAmount} className="text-brand-600 dark:text-brand-400 text-sm">
            Edit
          </Button>
        </div>

        {/* Strategies Row */}
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Selected Strategies</p>
            <Button variant="ghost" onClick={onEditStrategy} className="text-brand-600 dark:text-brand-400 text-sm">
              Edit
            </Button>
          </div>
          <div className="flex flex-col gap-3">
            {selectedStrategies.map((s) => {
              const Icon = STRATEGY_META[s.key]?.icon;
              return (
                <div key={s.key} className="flex items-center gap-3 bg-white dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className={clsx("w-10 h-10 rounded-lg flex items-center justify-center text-white bg-gradient-to-br", STRATEGY_META[s.key]?.gradient)}>
                    {Icon && <Icon className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{s.label}</p>
                    <p className="text-xs text-slate-500 line-clamp-1">{s.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tickers Row */}
        <div className="p-6 space-y-3">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Blended Pool ({allTickers.length} Assets)</p>
          <div className="flex flex-wrap gap-2">
            {allTickers.map((t) => (
              <span key={t} className="px-2.5 py-1 text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-md">
                {t}
              </span>
            ))}
          </div>
        </div>
      </Card>

      <div className="flex justify-center pt-4">
        <Button onClick={onGenerate} isLoading={isGenerating} size="lg" className="w-full sm:w-auto px-12 py-4 text-lg">
          Generate Portfolio
        </Button>
      </div>
    </div>
  );
}
