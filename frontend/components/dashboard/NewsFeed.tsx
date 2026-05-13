"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { NewsArticle } from "@/types";
import { Card } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/Skeleton";
import { ExternalLink } from "lucide-react";

interface Props {
  symbols: string[];
}

export function NewsFeed({ symbols }: Props) {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNews() {
      if (!symbols.length) return;
      setLoading(true);
      try {
        // Fetch news for top 3 weight symbols
        const topSymbols = symbols.slice(0, 3);
        const promises = topSymbols.map(sym => api.getStockNews(sym).catch(() => []));
        const results = await Promise.all(promises);
        
        // Flatten, sort by published time, take top 5
        const allNews = results.flat().sort((a, b) => Number(b.published) - Number(a.published)).slice(0, 5);
        setNews(allNews);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchNews();
  }, [symbols]);

  if (loading) {
    return (
      <Card className="h-full">
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Latest News</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (news.length === 0) return null;

  return (
    <Card className="h-full">
      <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Market News</h3>
      <div className="space-y-4">
        {news.map((item, idx) => (
          <a
            key={idx}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group block border-b border-slate-100 dark:border-slate-800 last:border-0 pb-4 last:pb-0"
          >
            <p className="text-xs font-semibold text-brand-600 dark:text-brand-400 mb-1">
              {item.publisher}
            </p>
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-200 group-hover:text-brand-500 transition-colors line-clamp-2">
              {item.title}
            </h4>
            <div className="flex items-center gap-1 mt-2 text-xs text-slate-500">
              Read article <ExternalLink className="w-3 h-3" />
            </div>
          </a>
        ))}
      </div>
    </Card>
  );
}
