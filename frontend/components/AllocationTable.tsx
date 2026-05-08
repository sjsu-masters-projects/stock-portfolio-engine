"use client";

import { Allocation } from "@/lib/api";

interface Props {
  allocations: Allocation[];
  totalInvested: number;
  leftoverCash: number;
  amount: number;
  portfolioValue: number;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function pct(n: number) {
  return (n * 100).toFixed(1) + "%";
}

export default function AllocationTable({
  allocations,
  totalInvested,
  leftoverCash,
  amount,
  portfolioValue,
}: Props) {
  const gainLoss = portfolioValue - totalInvested;
  const gainLossPct =
    totalInvested > 0 ? ((gainLoss / totalInvested) * 100).toFixed(2) : "0.00";
  const isPositive = gainLoss >= 0;

  return (
    <div className="space-y-4">
      {/* Portfolio value hero card */}
      <div className="bg-gradient-to-br from-brand-600 to-brand-800 rounded-2xl p-6 text-white shadow-xl shadow-brand-600/20">
        <p className="text-brand-200 text-sm font-medium">
          Current Portfolio Value
        </p>
        <p className="text-3xl font-bold mt-1 tracking-tight">
          {fmt(portfolioValue)}
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span
            className={`text-sm font-medium px-2 py-0.5 rounded-full ${
              isPositive
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-red-500/20 text-red-200"
            }`}
          >
            {isPositive ? "▲" : "▼"} {fmt(Math.abs(gainLoss))} (
            {isPositive ? "+" : ""}
            {gainLossPct}%)
          </span>
          <span className="text-brand-300 text-xs">vs. invested</span>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total budget", value: fmt(amount), icon: "💰" },
          { label: "Invested", value: fmt(totalInvested), icon: "📈" },
          { label: "Leftover cash", value: fmt(leftoverCash), icon: "💵" },
        ].map((item) => (
          <div
            key={item.label}
            className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-3 transition-all hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-sm">{item.icon}</span>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {item.label}
              </p>
            </div>
            <p className="font-semibold text-slate-900 dark:text-white mt-1">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
              <tr>
                {[
                  "Stock",
                  "Price",
                  "Weight",
                  "Allocated",
                  "Shares",
                  "5-day return",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {allocations.map((a) => {
                const ret = a["5day_return_pct"];
                const retColor =
                  ret > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : ret < 0
                    ? "text-red-500 dark:text-red-400"
                    : "text-slate-400";
                return (
                  <tr
                    key={a.symbol}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900 dark:text-white">
                        {a.symbol}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 truncate max-w-[140px]">
                        {a.name}
                      </p>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {fmt(a.current_price)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 w-16 overflow-hidden">
                          <div
                            className="h-full bg-brand-500 rounded-full transition-all duration-500"
                            style={{ width: pct(a.weight) }}
                          />
                        </div>
                        <span className="text-slate-700 dark:text-slate-300">
                          {pct(a.weight)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {fmt(a.dollars)}
                    </td>
                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300 font-medium">
                      {a.shares}
                    </td>
                    <td className={`px-4 py-3 font-medium ${retColor}`}>
                      {ret > 0 ? "+" : ""}
                      {ret}%
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
