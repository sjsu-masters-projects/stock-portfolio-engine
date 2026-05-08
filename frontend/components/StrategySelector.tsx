"use client";

import { StrategyInfo, StrategyKey } from "@/lib/api";
import clsx from "clsx";

const ICONS: Record<StrategyKey, string> = {
  ethical: "🌱",
  growth: "🚀",
  index: "📊",
  quality: "💎",
  value: "🏷️",
};

interface Props {
  strategies: StrategyInfo[];
  selected: StrategyKey[];
  onChange: (keys: StrategyKey[]) => void;
}

export default function StrategySelector({
  strategies,
  selected,
  onChange,
}: Props) {
  const toggle = (key: StrategyKey) => {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else if (selected.length < 2) {
      onChange([...selected, key]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        Investment strategy{" "}
        <span className="text-slate-400 dark:text-slate-500 font-normal">
          (pick 1 or 2)
        </span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 stagger">
        {strategies.map((s) => {
          const isSelected = selected.includes(s.key);
          const isDisabled = !isSelected && selected.length >= 2;
          return (
            <button
              key={s.key}
              type="button"
              disabled={isDisabled}
              onClick={() => toggle(s.key)}
              className={clsx(
                "flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all duration-200 animate-fade-in-up",
                isSelected
                  ? "border-brand-500 bg-brand-50 dark:bg-brand-900/20 ring-1 ring-brand-500 shadow-sm shadow-brand-500/10"
                  : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-600 hover:-translate-y-0.5 hover:shadow-md",
                isDisabled && "opacity-40 cursor-not-allowed !shadow-none !translate-y-0"
              )}
            >
              <span className="text-2xl mt-0.5">{ICONS[s.key]}</span>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 dark:text-white text-sm">
                  {s.label}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {s.description}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                  {s.tickers.map((t) => t.symbol).join(", ")}
                </p>
              </div>
              {isSelected && (
                <span className="ml-auto text-brand-600 dark:text-brand-400 font-bold text-sm flex-shrink-0">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
