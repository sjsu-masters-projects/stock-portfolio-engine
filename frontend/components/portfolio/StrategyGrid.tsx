"use client";

import { StrategyInfo, StrategyKey } from "@/types";
import { StrategyCard } from "./StrategyCard";
import { Button } from "@/components/ui/Button";

interface Props {
  strategies: StrategyInfo[];
  selected: StrategyKey[];
  onChange: (keys: StrategyKey[]) => void;
  onNext: () => void;
  onBack: () => void;
}

export function StrategyGrid({ strategies, selected, onChange, onNext, onBack }: Props) {
  const toggle = (key: StrategyKey) => {
    if (selected.includes(key)) {
      onChange(selected.filter((k) => k !== key));
    } else if (selected.length < 2) {
      onChange([...selected, key]);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          Choose your investment strategy
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          Select 1 or 2 strategies to build your custom portfolio.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {strategies.map((s) => (
          <StrategyCard
            key={s.key}
            strategy={s}
            isSelected={selected.includes(s.key)}
            isDisabled={!selected.includes(s.key) && selected.length >= 2}
            onClick={() => toggle(s.key)}
          />
        ))}
      </div>

      <div className="flex items-center justify-between pt-4">
        <Button variant="ghost" onClick={onBack}>
          Back
        </Button>
        <Button onClick={onNext} disabled={selected.length === 0}>
          Review Portfolio
        </Button>
      </div>
    </div>
  );
}
