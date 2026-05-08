"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Allocation } from "@/lib/api";

interface Props {
  allocations: Allocation[];
}

const COLORS = [
  "#6366f1", // brand
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#f43f5e", // rose
  "#84cc16", // lime
];

function fmt(n: number) {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 shadow-lg text-sm">
      <p className="font-medium text-slate-900 dark:text-white">
        {data.symbol}
      </p>
      <p className="text-slate-500 dark:text-slate-400 text-xs">{data.name}</p>
      <p className="font-semibold text-brand-600 dark:text-brand-400 mt-1">
        {fmt(data.dollars)} ({(data.weight * 100).toFixed(1)}%)
      </p>
    </div>
  );
};

export default function AllocationPieChart({ allocations }: Props) {
  const data = allocations.map((a) => ({
    symbol: a.symbol,
    name: a.name,
    dollars: a.dollars,
    weight: a.weight,
  }));

  return (
    <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
          Allocation breakdown
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          How your investment is divided across stocks
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* Donut chart */}
        <div className="w-52 h-52 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="dollars"
                stroke="none"
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 grid grid-cols-2 gap-2 w-full">
          {data.map((item, i) => (
            <div
              key={item.symbol}
              className="flex items-center gap-2 text-sm"
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: COLORS[i % COLORS.length] }}
              />
              <span className="font-medium text-slate-700 dark:text-slate-300">
                {item.symbol}
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-xs ml-auto">
                {(item.weight * 100).toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
