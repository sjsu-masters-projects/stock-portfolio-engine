"use client";

import { useEffect, useState } from "react";
import { StockDetail, NewsArticle } from "@/types";
import { api } from "@/lib/api";
import { X, ExternalLink } from "lucide-react";
import { fmt, fmtCompact } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/Skeleton";
import { Badge } from "@/components/ui/Badge";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  symbol: string | null;
  onClose: () => void;
}

export function StockDetailModal({ symbol, onClose }: Props) {
  const [detail, setDetail] = useState<StockDetail | null>(null);
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    Promise.all([
      api.getStockDetail(symbol).catch(() => null),
      api.getStockNews(symbol).catch(() => [])
    ]).then(([d, n]) => {
      if (d) setDetail(d);
      if (n) setNews(n);
      setLoading(false);
    });
  }, [symbol]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!symbol) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          onClick={onClose} 
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-[90vh] flex flex-col"
        >
          {loading || !detail ? (
            <div className="p-8 space-y-6">
              <Skeleton className="h-8 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <div className="grid grid-cols-2 gap-4"><Skeleton className="h-20" /><Skeleton className="h-20" /></div>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{detail.symbol}</h2>
                    <Badge variant="brand">{detail.sector}</Badge>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 font-medium">{detail.name}</p>
                </div>
                <button onClick={onClose} className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                  <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Left Col: Price & Stats */}
                  <div className="space-y-6">
                    <div>
                      <p className="text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                        {fmt(detail.current_price)}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium text-slate-500">
                        <span>52W Low {fmt(detail.week_52_low)}</span>
                        <span>52W High {fmt(detail.week_52_high)}</span>
                      </div>
                      <div className="relative h-2 rounded-full bg-slate-100 dark:bg-slate-800">
                        {(() => {
                          const range = detail.week_52_high - detail.week_52_low;
                          const pos = range > 0 ? ((detail.current_price - detail.week_52_low) / range) * 100 : 50;
                          return <div className="absolute w-3 h-3 rounded-full bg-brand-500 top-1/2 -translate-y-1/2 -ml-1.5 shadow-sm ring-2 ring-white dark:ring-slate-900" style={{ left: `${Math.max(0, Math.min(100, pos))}%` }} />;
                        })()}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">Market Cap</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{fmtCompact(detail.market_cap)}</p>
                      </div>
                      <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                        <p className="text-xs text-slate-500 mb-1">P/E Ratio</p>
                        <p className="font-semibold text-slate-900 dark:text-white">{detail.pe_ratio ? detail.pe_ratio.toFixed(2) : "N/A"}</p>
                      </div>
                    </div>
                  </div>

                  {/* Right Col: News */}
                  <div>
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Latest News</h3>
                    {news.length > 0 ? (
                      <div className="space-y-4">
                        {news.map((item, idx) => (
                          <a key={idx} href={item.link} target="_blank" rel="noopener noreferrer" className="group block">
                            <p className="text-[10px] font-bold text-brand-500 uppercase tracking-wider mb-0.5">{item.publisher}</p>
                            <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200 group-hover:text-brand-600 dark:group-hover:text-brand-400 line-clamp-2">
                              {item.title}
                            </h4>
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No news available.</p>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
