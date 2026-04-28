import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stock Portfolio Engine",
  description: "Performance-weighted stock portfolio suggestion engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">$</span>
          </div>
          <div>
            <h1 className="font-semibold text-slate-900 leading-tight">Portfolio Engine</h1>
            <p className="text-xs text-slate-500">Smart stock suggestions</p>
          </div>
        </header>
        <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
