"use client";

import { useState } from "react";
import { Allocation } from "@/types";
import { Card } from "@/components/ui/Card";
import { fmt, pct } from "@/lib/formatters";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import clsx from "clsx";

interface Props {
  allocations: Allocation[];
  onRowClick?: (symbol: string) => void;
}

type SortKey = "symbol" | "current_price" | "weight" | "dollars" | "five_day_return_pct";

export function AllocationTable({ allocations, onRowClick }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("weight");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const sorted = [...allocations].sort((a, b) => {
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  const SortIcon = ({ columnKey }: { columnKey: SortKey }) => {
    if (sortKey !== columnKey) return <ArrowUpDown className="w-3 h-3 opacity-30" />;
    return sortDir === "asc" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />;
  };

  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-semibold text-slate-900 dark:text-white">Holdings</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
            <tr>
              {[
                { key: "symbol", label: "Asset" },
                { key: "current_price", label: "Price" },
                { key: "weight", label: "Weight" },
                { key: "dollars", label: "Allocated" },
                { key: "five_day_return_pct", label: "5D Return" },
              ].map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key as SortKey)}
                  className="px-4 py-3 font-medium cursor-pointer hover:text-slate-700 dark:hover:text-slate-200 transition-colors select-none group whitespace-nowrap"
                >
                  <div className="flex items-center gap-1.5">
                    {col.label}
                    <span className="group-hover:opacity-100 transition-opacity">
                      <SortIcon columnKey={col.key as SortKey} />
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {sorted.map((a) => {
              const ret = a.five_day_return_pct;
              const isPositive = ret > 0;
              
              return (
                <tr
                  key={a.symbol}
                  onClick={() => onRowClick?.(a.symbol)}
                  className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-900 dark:text-white">{a.symbol}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[120px]">{a.name}</p>
                  </td>
                  <td className="px-4 py-3 font-medium">{fmt(a.current_price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-10 tabular-nums">{pct(a.weight)}</span>
                      <div className="hidden sm:block flex-1 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: `${a.weight * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{fmt(a.dollars)}</p>
                    <p className="text-xs text-slate-400">{a.shares} shares</p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium",
                        isPositive ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-500/10" 
                        : ret < 0 ? "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-500/10"
                        : "text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800"
                      )}
                    >
                      {isPositive ? "▲" : ret < 0 ? "▼" : ""} {Math.abs(ret)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
