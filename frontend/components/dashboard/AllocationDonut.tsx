"use client";

import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from "recharts";
import { Allocation } from "@/types";
import { Card } from "@/components/ui/Card";
import { fmt, pct } from "@/lib/formatters";

interface Props {
  allocations: Allocation[];
  totalValue: number;
}

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#06b6d4", "#f43f5e", "#84cc16",
];

export function AllocationDonut({ allocations, totalValue }: Props) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const data = allocations.map((a) => ({
    name: a.symbol,
    value: a.dollars,
    weight: a.weight,
    fullName: a.name,
  }));

  return (
    <Card className="flex flex-col">
      <div className="mb-4">
        <h3 className="font-semibold text-slate-900 dark:text-white">Asset Allocation</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">Distribution by performance weight</p>
      </div>

      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height={160}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
              animationDuration={1000}
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <RechartsTooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl text-sm border border-slate-200 dark:border-slate-700">
                    <p className="font-bold text-slate-900 dark:text-white">{d.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">{d.fullName}</p>
                    <p className="text-brand-600 dark:text-brand-400 font-medium">{fmt(d.value)}</p>
                    <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">{pct(d.weight)} of portfolio</p>
                  </div>
                );
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-medium">Total</span>
          <span className="font-bold text-slate-900 dark:text-white">{fmt(totalValue).split('.')[0]}</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-2 gap-y-3 mt-4 max-h-40 overflow-y-auto custom-scrollbar">
        {data.map((item, i) => (
          <div key={item.name} className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{item.name}</span>
            <span className="text-xs text-slate-400 dark:text-slate-500 ml-auto shrink-0">{pct(item.weight)}</span>
          </div>
        ))}
      </div>
    </Card>
  );
}
