import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";
import { CurrencyProvider } from "@/contexts/CurrencyContext";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Stock Portfolio Engine",
  description: "Performance-weighted stock portfolio suggestion engine",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-50 selection:bg-brand-500/30 min-h-screen flex flex-col md:flex-row`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <CurrencyProvider>
            <Sidebar />
            <div className="flex-1 flex flex-col min-h-screen md:pl-16 pb-16 md:pb-0 transition-all duration-300">
              <Header />
              <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full page-enter page-enter-active">
                {children}
              </main>
            </div>
            <MobileNav />
          </CurrencyProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
