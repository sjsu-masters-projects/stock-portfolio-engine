"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { fmt, fmtDate } from "@/lib/formatters";
import { Skeleton } from "@/components/ui/Skeleton";
import { History, Save, Trash2, Play } from "lucide-react";

export default function HistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [saved, setSaved] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [histRes, savedRes] = await Promise.all([
        api.getHistory(),
        api.listPortfolios(),
      ]);
      setHistory(histRes.history || []);
      setSaved(savedRes || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLoad = (config: any) => {
    sessionStorage.setItem("current_portfolio", JSON.stringify(config));
    router.push("/dashboard");
  };

  const handleDelete = async (id: string) => {
    try {
      await api.deletePortfolio(id);
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveCurrent = async () => {
    const current = sessionStorage.getItem("current_portfolio");
    if (!current) return alert("No active portfolio to save");
    try {
      await api.savePortfolio(JSON.parse(current));
      await loadData();
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto space-y-8 p-8">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Skeleton className="h-96 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-24 animate-fade-in-up py-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <History className="w-6 h-6" /> Portfolio History & Saved
        </h2>
        <Button onClick={handleSaveCurrent} variant="secondary">
          <Save className="w-4 h-4 mr-2" /> Save Current Portfolio
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Saved Portfolios */}
        <Card className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Save className="w-5 h-5 text-brand-500" /> Saved Configurations
          </h3>
          {saved.length === 0 ? (
            <p className="text-slate-500 text-sm">No saved portfolios yet.</p>
          ) : (
            <div className="space-y-3">
              {saved.map((s) => (
                <div key={s.id} className="p-4 border border-slate-100 dark:border-slate-800 rounded-xl hover:shadow-md transition-shadow bg-white/50 dark:bg-slate-900/50">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{fmt(s.amount)}</p>
                      <p className="text-xs text-slate-400">Saved: {fmtDate(s.saved_at?.split('T')[0] || '')}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleLoad(s)} className="p-1.5 bg-brand-50 text-brand-600 rounded-lg hover:bg-brand-100 transition-colors dark:bg-brand-500/10 dark:text-brand-400" title="Load">
                        <Play className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors dark:bg-red-500/10 dark:text-red-400" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {(s.strategies || []).map((strat: string) => (
                      <span key={strat} className="text-[10px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-slate-600 dark:text-slate-300">
                        {strat}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Generation History */}
        <Card className="space-y-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-5 h-5 text-brand-500" /> Generation History
          </h3>
          {history.length === 0 ? (
            <p className="text-slate-500 text-sm">No history yet.</p>
          ) : (
            <div className="space-y-3">
              {[...history].reverse().map((h, i) => (
                <div key={i} className="flex items-center justify-between p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-white/50 dark:bg-slate-900/50">
                  <div>
                    <p className="font-bold text-slate-900 dark:text-white">{fmt(h.portfolio_value)}</p>
                    <p className="text-xs text-slate-400">{fmtDate(h.date)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    {(h.strategies || []).map((strat: string) => (
                      <span key={strat} className="text-xs text-slate-600 dark:text-slate-400">
                        {strat}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
