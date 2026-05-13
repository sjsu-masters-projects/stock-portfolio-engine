import { Leaf, Rocket, BarChart3, Gem, Tag, LucideIcon } from "lucide-react";
import { StrategyKey } from "@/types";

export const STRATEGY_META: Record<StrategyKey, { icon: LucideIcon; color: string; gradient: string }> = {
  ethical: { icon: Leaf, color: "#10b981", gradient: "from-emerald-500 to-teal-600" },
  growth: { icon: Rocket, color: "#f59e0b", gradient: "from-amber-500 to-orange-600" },
  index: { icon: BarChart3, color: "#6366f1", gradient: "from-indigo-500 to-violet-600" },
  quality: { icon: Gem, color: "#ec4899", gradient: "from-pink-500 to-rose-600" },
  value: { icon: Tag, color: "#06b6d4", gradient: "from-cyan-500 to-blue-600" },
};
