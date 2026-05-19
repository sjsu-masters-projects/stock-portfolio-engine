"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { useState, useEffect } from "react";

export function Header() {
  const { theme, setTheme } = useTheme();
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
