"use client";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from "recharts";
import { HistoryEntry } from "@/lib/api";

interface Props {
  history: HistoryEntry[];
}

function fmtDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function fmtDollar(v: number) {
  return v.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const val: number = payload[0].value;
  return (
    <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-md text-sm">
      <p className="text-slate-500 text-xs">{label}</p>
      <p className="font-semibold text-slate-900">{fmtDollar(val)}</p>
    </div>
  );
};

export default function HistoryChart({ history }: Props) {
  if (history.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 bg-slate-50 rounded-xl border border-dashed border-slate-200">
        <p className="text-slate-400 text-sm">No history yet — generate your first portfolio to start tracking.</p>
      </div>
    );
  }

  const data = history.map((h) => ({
    date: fmtDate(h.date),
    value: h.portfolio_value,
  }));

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const firstVal = data[0].value;
  const lastVal = data[data.length - 1].value;
  const change = lastVal - firstVal;
  const changePct = firstVal > 0 ? ((change / firstVal) * 100).toFixed(2) : "0.00";
  const isPositive = change >= 0;

  return (
    <div className="space-y-4">
      {/* Mini summary */}
      <div className="flex items-end justify-between">
        <div>
          <p className="text-2xl font-semibold text-slate-900">{fmtDollar(lastVal)}</p>
          <p className={`text-sm font-medium mt-0.5 ${isPositive ? "text-emerald-600" : "text-red-500"}`}>
            {isPositive ? "▲" : "▼"} {fmtDollar(Math.abs(change))} ({changePct}%) over {history.length} day{history.length > 1 ? "s" : ""}
          </p>
        </div>
        <p className="text-xs text-slate-400">5-day portfolio trend</p>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 10, right: 4, bottom: 0, left: 12 }}>
          <defs>
            <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#4f46e5" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}    />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
          <YAxis
            tick={{ fontSize: 11, fill: "#94a3b8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
            domain={[minVal * 0.99, maxVal * 1.01]}
          />
          <Tooltip content={<CustomTooltip />} />
          {history.length > 1 && (
            <ReferenceLine y={firstVal} stroke="#94a3b8" strokeDasharray="4 4" strokeWidth={1} />
          )}
          <Area
            type="monotone"
            dataKey="value"
            stroke="#4f46e5"
            strokeWidth={2}
            fill="url(#grad)"
            dot={{ r: 4, fill: "#4f46e5", strokeWidth: 0 }}
            activeDot={{ r: 6 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
