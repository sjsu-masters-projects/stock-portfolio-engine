"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StrategyInfo } from "@/types";
import { ComparisonView } from "@/components/compare/ComparisonView";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ComparePage() {
  const [strategies, setStrategies] = useState<StrategyInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getStrategies()
      .then(setStrategies)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 p-8">
        <Skeleton className="h-12 w-64 mx-auto" />
        <Skeleton className="h-32 w-full max-w-sm mx-auto" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="py-4">
      <ComparisonView strategies={strategies} />
    </div>
  );
}
