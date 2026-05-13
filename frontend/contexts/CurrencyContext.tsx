"use client";

import { createContext, useContext, useState, useEffect } from "react";

// Hardcoded for demo/frontend speed, normally fetch from API or pass from backend
const RATES: Record<string, number> = { USD: 1.0, EUR: 0.92, GBP: 0.79, JPY: 149.5, INR: 83.4 };

interface CurrencyContextType {
  currency: string;
  setCurrency: (c: string) => void;
  format: (usdAmount: number) => string;
  formatCompact: (usdAmount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState("USD");

  useEffect(() => {
    const saved = localStorage.getItem("preferred_currency");
    if (saved && RATES[saved]) setCurrency(saved);
  }, []);

  const handleSetCurrency = (c: string) => {
    setCurrency(c);
    localStorage.setItem("preferred_currency", c);
  };

  const getRate = () => RATES[currency] || 1.0;

  const format = (n: number) => {
    const val = n * getRate();
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatCompact = (n: number) => {
    const val = n * getRate();
    if (val >= 1e9) return `${currency === "USD" ? "$" : ""}${(val / 1e9).toFixed(1)}B ${currency !== "USD" ? currency : ""}`;
    if (val >= 1e6) return `${currency === "USD" ? "$" : ""}${(val / 1e6).toFixed(1)}M ${currency !== "USD" ? currency : ""}`;
    if (val >= 1e3) return `${currency === "USD" ? "$" : ""}${(val / 1e3).toFixed(1)}K ${currency !== "USD" ? currency : ""}`;
    return format(n);
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency: handleSetCurrency, format, formatCompact }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within CurrencyProvider");
  return ctx;
}
