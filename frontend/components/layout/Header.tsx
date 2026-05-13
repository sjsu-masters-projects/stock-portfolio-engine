"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, ChevronDown } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useState, useEffect } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <header className="sticky top-0 z-30 w-full h-16 glass border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-2 md:ml-0 ml-2">
        <h1 className="font-semibold text-slate-900 dark:text-white text-lg tracking-tight md:hidden">
          Portfolio Engine
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Connection status */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
          <span className="w-2 h-2 rounded-full bg-emerald-500 pulse-live" />
          <span className="text-xs font-medium text-emerald-700 dark:text-emerald-400">Live Prices</span>
        </div>

        {/* Currency toggle */}
        <div className="relative group">
          <button className="flex items-center gap-1 p-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            {currency} <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>
          <div className="absolute right-0 top-full mt-1 w-24 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
            {["USD", "EUR", "GBP", "JPY", "INR"].map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className="w-full text-left px-4 py-2 text-sm hover:bg-brand-50 dark:hover:bg-brand-500/10 hover:text-brand-600 dark:hover:text-brand-400 transition-colors first:rounded-t-xl last:rounded-b-xl"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          aria-label="Toggle theme"
        >
          {!mounted ? <div className="w-5 h-5" /> : theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}
