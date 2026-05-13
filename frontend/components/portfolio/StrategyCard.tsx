"use client";

import { StrategyInfo } from "@/types";
import { STRATEGY_META } from "@/lib/constants";
import { Check } from "lucide-react";
import clsx from "clsx";

interface Props {
  strategy: StrategyInfo;
  isSelected: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export function StrategyCard({ strategy, isSelected, isDisabled, onClick }: Props) {
  const meta = STRATEGY_META[strategy.key] || STRATEGY_META.index;
  const Icon = meta.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isDisabled}
      className={clsx(
        "relative flex flex-col text-left p-5 rounded-2xl border transition-all duration-300 overflow-hidden group",
        isSelected
          ? "border-transparent shadow-lg shadow-brand-500/20 -translate-y-1"
          : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 hover:-translate-y-1",
        isDisabled && !isSelected && "opacity-50 grayscale pointer-events-none"
      )}
    >
      {/* Selected Background Gradient */}
      {isSelected && (
        <div className={clsx("absolute inset-0 bg-gradient-to-br opacity-10 dark:opacity-20", meta.gradient)} />
      )}
      {isSelected && (
        <div className={clsx("absolute inset-0 border-2 rounded-2xl", `border-${meta.color.replace('#', '')}/50`)} style={{ borderColor: meta.color }} />
      )}

      {/* Header */}
      <div className="flex items-start justify-between relative z-10">
        <div
          className={clsx(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 mb-4 transition-transform group-hover:scale-110",
            isSelected ? `bg-gradient-to-br ${meta.gradient} text-white shadow-md` : "bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400"
          )}
        >
          <Icon className="w-6 h-6" />
        </div>
        {isSelected && (
          <div className="w-6 h-6 rounded-full bg-brand-500 text-white flex items-center justify-center shrink-0">
            <Check className="w-4 h-4" strokeWidth={3} />
          </div>
        )}
      </div>

      <h3 className="font-semibold text-slate-900 dark:text-white text-lg relative z-10">
        {strategy.label}
      </h3>
      <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-2 relative z-10 flex-1">
        {strategy.description}
      </p>

      {/* Ticker chips */}
      <div className="flex flex-wrap gap-1.5 mt-4 relative z-10">
        {strategy.tickers.map((t) => (
          <span
            key={t.symbol}
            className={clsx(
              "text-[10px] font-medium px-2 py-1 rounded-md",
              isSelected ? "bg-white/50 dark:bg-black/20 text-slate-800 dark:text-slate-200" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
            )}
          >
            {t.symbol}
          </span>
        ))}
      </div>
    </button>
  );
}
