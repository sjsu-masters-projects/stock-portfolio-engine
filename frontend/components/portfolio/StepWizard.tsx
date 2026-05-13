"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";
import clsx from "clsx";

interface Props {
  currentStep: number;
  steps: string[];
  children: React.ReactNode[];
}

export function StepWizard({ currentStep, steps, children }: Props) {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Progress Bar */}
      <div className="relative flex items-center justify-between px-2 sm:px-8">
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 dark:bg-slate-800 rounded-full mx-6 sm:mx-12" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-brand-500 rounded-full transition-all duration-500 mx-6 sm:mx-12"
          style={{ width: `calc(${(currentStep / (steps.length - 1)) * 100}% - 3rem)` }}
        />

        {steps.map((step, idx) => {
          const isActive = idx === currentStep;
          const isCompleted = idx < currentStep;

          return (
            <div key={step} className="relative z-10 flex flex-col items-center gap-2">
              <div
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                  isActive
                    ? "bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-lg shadow-brand-500/30 scale-110"
                    : isCompleted
                    ? "bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-800"
                    : "bg-white dark:bg-slate-900 text-slate-400 border border-slate-200 dark:border-slate-800"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : idx + 1}
              </div>
              <span
                className={clsx(
                  "text-xs font-medium absolute -bottom-6 whitespace-nowrap",
                  isActive ? "text-slate-900 dark:text-white" : "text-slate-500"
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>

      {/* Content Area */}
      <div className="relative min-h-[400px] mt-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="w-full"
          >
            {children[currentStep]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
