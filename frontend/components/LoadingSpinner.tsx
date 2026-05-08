"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-4 animate-fade-in">
      {/* Pulsing dots */}
      <div className="flex items-center gap-2">
        <span className="w-3 h-3 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: "0ms" }} />
        <span className="w-3 h-3 rounded-full bg-brand-400 animate-bounce" style={{ animationDelay: "150ms" }} />
        <span className="w-3 h-3 rounded-full bg-brand-300 animate-bounce" style={{ animationDelay: "300ms" }} />
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
        Fetching live market data…
      </p>
    </div>
  );
}
