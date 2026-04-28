"use client";

import { Allocation } from "@/lib/api";

interface Props {
  allocations: Allocation[];
  totalInvested: number;
  leftoverCash: number;
  amount: number;
}

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

function pct(n: number) {
  return (n * 100).toFixed(1) + "%";
}

export default function AllocationTable({ allocations, totalInvested, leftoverCash, amount }: Props) {
  return (
    <div className="space-y-4">
      {/* Summary row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total budget",    value: fmt(amount) },
          { label: "Invested",        value: fmt(totalInvested) },
          { label: "Leftover cash",   value: fmt(leftoverCash) },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-xs text-slate-500">{item.label}</p>
            <p className="font-semibold text-slate-900 mt-0.5">{item.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              {["Stock", "Price", "Weight", "Allocated", "Shares", "5-day return"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-slate-500 uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {allocations.map((a) => {
              const ret = a["5day_return_pct"];
              const retColor = ret > 0 ? "text-emerald-600" : ret < 0 ? "text-red-500" : "text-slate-400";
              return (
                <tr key={a.symbol} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-900">{a.symbol}</p>
                    <p className="text-xs text-slate-400 truncate max-w-[140px]">{a.name}</p>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{fmt(a.current_price)}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 rounded-full bg-slate-100 w-16 overflow-hidden">
                        <div
                          className="h-full bg-brand-500 rounded-full"
                          style={{ width: pct(a.weight) }}
                        />
                      </div>
                      <span className="text-slate-700">{pct(a.weight)}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-700">{fmt(a.dollars)}</td>
                  <td className="px-4 py-3 text-slate-700 font-medium">{a.shares}</td>
                  <td className={`px-4 py-3 font-medium ${retColor}`}>
                    {ret > 0 ? "+" : ""}{ret}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
