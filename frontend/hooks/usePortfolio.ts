"use client";

import { useState, useCallback, useEffect } from "react";
import { api } from "@/lib/api";
import { PortfolioResponse, StrategyKey } from "@/types";

export function usePortfolio() {
  const [amount, setAmount] = useState<number>(10000);
  const [selectedStrategies, setSelectedStrategies] = useState<StrategyKey[]>([]);
  const [portfolio, setPortfolio] = useState<PortfolioResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from session storage on mount
  useEffect(() => {
    const saved = sessionStorage.getItem("current_portfolio");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPortfolio(parsed);
        setAmount(parsed.amount);
        // Restore strategy keys so refresh works correctly
        if (parsed.strategy_keys?.length > 0) {
          setSelectedStrategies(parsed.strategy_keys);
        }
      } catch (e) {
        sessionStorage.removeItem("current_portfolio");
      }
    }
  }, []);

  const generate = useCallback(async () => {
    if (selectedStrategies.length === 0 || amount < 5000) return false;
    
    setIsGenerating(true);
    setError(null);
    try {
      const res = await api.generatePortfolio(amount, selectedStrategies);
      setPortfolio(res);
      sessionStorage.setItem("current_portfolio", JSON.stringify(res));
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to generate portfolio");
      return false;
    } finally {
      setIsGenerating(false);
    }
  }, [amount, selectedStrategies]);

  const refresh = useCallback(async () => {
    if (!portfolio) return;
    try {
      // Use strategy_keys (actual keys like "ethical") instead of
      // strategies (labels like "Ethical Investing") which would fail validation
      const keys = (portfolio.strategy_keys?.length > 0
        ? portfolio.strategy_keys
        : selectedStrategies) as StrategyKey[];
      
      if (keys.length === 0) return;
      
      const res = await api.generatePortfolio(portfolio.amount, keys);
      setPortfolio(res);
      sessionStorage.setItem("current_portfolio", JSON.stringify(res));
    } catch (err) {
      console.error("Refresh failed", err);
    }
  }, [portfolio, selectedStrategies]);

  const reset = () => {
    setPortfolio(null);
    setSelectedStrategies([]);
    sessionStorage.removeItem("current_portfolio");
  };

  return {
    amount,
    setAmount,
    selectedStrategies,
    setSelectedStrategies,
    portfolio,
    isGenerating,
    error,
    generate,
    refresh,
    reset
  };
}
