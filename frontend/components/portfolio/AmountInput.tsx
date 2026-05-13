"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fmt } from "@/lib/formatters";
import clsx from "clsx";

interface Props {
  value: number;
  onChange: (val: number) => void;
  onNext: () => void;
}

const PRESETS = [5000, 10000, 25000, 50000, 100000];

export function AmountInput({ value, onChange, onNext }: Props) {
  const [error, setError] = useState<string | null>(null);

  const handleNext = () => {
    if (value < 5000) {
      setError("Minimum investment is $5,000");
      return;
    }
    setError(null);
    onNext();
  };

  return (
    <Card className="flex flex-col items-center justify-center py-12 px-6 max-w-xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
          How much do you want to invest?
        </h2>
        <p className="text-slate-500 dark:text-slate-400">
          We'll suggest a tailored portfolio based on your budget.
        </p>
      </div>

      {/* Single large number display */}
      <div className="text-5xl sm:text-6xl font-extrabold tracking-tighter text-brand-600 dark:text-brand-400 tabular-nums">
        {fmt(value)}
      </div>

      {/* Slider */}
      <div className="w-full px-4">
        <input
          type="range"
          min={5000}
          max={100000}
          step={1000}
          value={value}
          onChange={(e) => {
            onChange(Number(e.target.value));
            if (error) setError(null);
          }}
          className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />
        <div className="flex justify-between text-xs font-medium text-slate-400 mt-2">
          <span>$5k</span>
          <span>$100k</span>
        </div>
      </div>

      {/* Presets */}
      <div className="flex flex-wrap justify-center gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => {
              onChange(p);
              if (error) setError(null);
            }}
            className={clsx(
              "px-4 py-1.5 rounded-full text-sm font-medium transition-colors border",
              value === p
                ? "bg-brand-500 border-brand-500 text-white"
                : "bg-transparent border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-brand-300 dark:hover:border-brand-700"
            )}
          >
            {fmt(p).replace(".00", "")}
          </button>
        ))}
      </div>

      {error && <p className="text-red-500 text-xs text-center">{error}</p>}

      <Button onClick={handleNext} className="w-full max-w-xs" size="lg">
        Continue
      </Button>
    </Card>
  );
}
