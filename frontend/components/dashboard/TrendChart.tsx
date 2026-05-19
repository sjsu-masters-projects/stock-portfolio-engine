"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { TrendEntry } from "@/types";
import { Card } from "@/components/ui/Card";
import { fmtDate, fmt } from "@/lib/formatters";

interface Props {
  trend: TrendEntry[];
}

export function TrendChart({ trend }: Props) {
  if (!trend || trend.length === 0) return null;

  const data = trend.map((t) => ({
    date: fmtDate(t.date),
    value: t.portfolio_value,
  }));

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const firstVal = data[0].value;
  const lastVal = data[data.length - 1].value;
  const isPositive = lastVal >= firstVal;
  
  const strokeColor = isPositive ? "#10b981" : "#ef4444";
  const gradientId = "trendGradient";

  return (
    <Card className="flex flex-col">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Portfolio Trend</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">5-day historical performance</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{fmt(lastVal)}</p>
          <p className={`text-xs font-semibold ${isPositive ? "text-emerald-500" : "text-red-500"}`}>
            {isPositive ? "+" : ""}{fmt(lastVal - firstVal)} since start
          </p>
        </div>
      </div>

      <div className="flex-1 -ml-4">
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2} />
                <stop offset="95%" stopColor={strokeColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" strokeOpacity={0.2} />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 11, fill: "#94a3b8" }} 
              dy={10}
            />
            <YAxis 
              domain={[minVal * 0.99, maxVal * 1.01]} 
              axisLine={false} 
              tickLine={false}
              tickFormatter={(val) => `$${(val / 1000).toFixed(1)}k`}
              tick={{ fontSize: 11, fill: "#94a3b8" }}
              dx={-10}
            />
            <RechartsTooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null;
                return (
                  <div className="glass p-3 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700">
                    <p className="text-xs text-slate-500 mb-1">{label}</p>
                    <p className="font-bold text-slate-900 dark:text-white">{fmt(payload[0].value as number)}</p>
                  </div>
                );
              }}
            />
            {data.length > 1 && (
              <ReferenceLine y={firstVal} stroke="#94a3b8" strokeDasharray="4 4" strokeOpacity={0.5} />
            )}
            <Area
              type="monotone"
              dataKey="value"
              stroke={strokeColor}
              strokeWidth={2}
              fillOpacity={1}
              fill={`url(#${gradientId})`}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
