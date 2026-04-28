"use client";

import { StrategyInfo, StrategyKey } from "@/lib/api";
import clsx from "clsx";

const ICONS: Record<StrategyKey, string> = {
  ethical: "🌱",
  growth:  "🚀",
  index:   "📊",
  quality: "💎",
  value:   "🏷️",
};

interface Props {
  strategies: StrategyInfo[];
  selected: StrategyKey[];
  onChange: (keys: StrategyKey[]) => void;
}

export default function StrategySelector({ strategies, selected, onChange }: Props) {
  const toggle = (key: StrategyKey) => {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else if (selected.length < 2) {
      onChange([...selected, key]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-slate-700">
        Investment strategy <span className="text-slate-400 font-normal">(pick 1 or 2)</span>
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                "flex items-start gap-3 rounded-xl border px-4 py-3 text-left transition-all",
                isSelected
                  ? "border-brand-500 bg-brand-50 ring-1 ring-brand-500"
                  : "border-slate-200 bg-white hover:border-slate-300",
                isDisabled && "opacity-40 cursor-not-allowed"
              )}
            >
              <span className="text-2xl mt-0.5">{ICONS[s.key]}</span>
              <div>
                <p className="font-medium text-slate-900 text-sm">{s.label}</p>
                <p className="text-xs text-slate-500 mt-0.5 leading-snug">{s.description}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {s.tickers.map((t) => t.symbol).join(", ")}
                </p>
              </div>
              {isSelected && (
                <span className="ml-auto text-brand-600 font-bold text-sm">✓</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
