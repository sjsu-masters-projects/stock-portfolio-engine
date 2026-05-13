"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PieChart, LayoutDashboard, GitCompare, History, LineChart } from "lucide-react";
import clsx from "clsx";

const navItems = [
  { href: "/portfolio", label: "Builder", icon: PieChart },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/compare", label: "Compare", icon: GitCompare },
  { href: "/history", label: "History", icon: History },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 hidden md:flex w-16 hover:w-56 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 group shadow-2xl shadow-slate-200/20 dark:shadow-none overflow-hidden">
      {/* Logo area */}
      <div className="h-16 flex items-center px-4 border-b border-slate-100 dark:border-slate-800 shrink-0">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/20">
          <LineChart className="w-4 h-4 text-white" />
        </div>
        <span className="ml-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Portfolio Engine
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-6 flex flex-col gap-2 px-2">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                "flex items-center h-12 px-3 rounded-xl transition-all duration-200 group/link overflow-hidden relative",
                isActive
                  ? "text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-500/10"
                  : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-brand-500 rounded-r-full" />
              )}
              <Icon className="w-6 h-6 shrink-0" strokeWidth={isActive ? 2.5 : 2} />
              <span className="ml-4 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {item.label}
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
