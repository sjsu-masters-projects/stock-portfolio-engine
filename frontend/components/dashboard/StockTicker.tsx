"use client";

import { Allocation } from "@/types";
import { fmt } from "@/lib/formatters";
import { TrendingUp, TrendingDown } from "lucide-react";
import clsx from "clsx";

interface Props {
  allocations: Allocation[];
  onStockClick?: (symbol: string) => void;
}

export function StockTicker({ allocations, onStockClick }: Props) {
  if (!allocations.length) return null;

  return (
    <div className="w-full overflow-hidden bg-white/50 dark:bg-slate-900/50 border-y border-slate-200 dark:border-slate-800 py-3">
      <div className="flex overflow-x-auto hide-scrollbar gap-4 px-4 snap-x">
        {allocations.map((a) => {
          const ret = a.five_day_return_pct;
          const isPos = ret >= 0;
          return (
            <button
              key={a.symbol}
              onClick={() => onStockClick?.(a.symbol)}
              className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm shrink-0 snap-start hover:-translate-y-0.5 hover:shadow-md transition-all"
            >
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm text-left">{a.symbol}</p>
                <p className="text-xs text-slate-500 text-left w-24 truncate">{a.name}</p>
              </div>
              <div className="text-right">
                <p className="font-medium text-slate-900 dark:text-white text-sm">{fmt(a.current_price)}</p>
                <div className={clsx("flex items-center justify-end gap-1 text-xs font-semibold", isPos ? "text-emerald-500" : "text-red-500")}>
                  {isPos ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {Math.abs(ret)}%
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
