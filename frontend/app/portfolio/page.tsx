"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StepWizard } from "@/components/portfolio/StepWizard";
import { AmountInput } from "@/components/portfolio/AmountInput";
import { StrategyGrid } from "@/components/portfolio/StrategyGrid";
import { ReviewSummary } from "@/components/portfolio/ReviewSummary";
import { usePortfolio } from "@/hooks/usePortfolio";
import { api } from "@/lib/api";
import { StrategyInfo } from "@/types";

const STEPS = ["Amount", "Strategy", "Review"];

export default function PortfolioBuilderPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [strategies, setStrategies] = useState<StrategyInfo[]>([]);
  
  const {
    amount,
    setAmount,
    selectedStrategies,
    setSelectedStrategies,
    isGenerating,
    error,
    generate
  } = usePortfolio();

  useEffect(() => {
    api.getStrategies().then(setStrategies).catch(console.error);
  }, []);

  const handleGenerate = async () => {
    const success = await generate();
    if (success) {
      router.push("/dashboard");
    }
  };

  return (
    <div className="py-8 pb-24">
      {error && (
        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-800 text-center text-sm font-medium">
          {error}
        </div>
      )}

      <StepWizard currentStep={currentStep} steps={STEPS}>
        {/* Step 0: Amount */}
        <AmountInput
          value={amount}
          onChange={setAmount}
          onNext={() => setCurrentStep(1)}
        />

        {/* Step 1: Strategy */}
        <StrategyGrid
          strategies={strategies}
          selected={selectedStrategies}
          onChange={setSelectedStrategies}
          onNext={() => setCurrentStep(2)}
          onBack={() => setCurrentStep(0)}
        />

        {/* Step 2: Review */}
        <ReviewSummary
          amount={amount}
          selectedKeys={selectedStrategies}
          strategies={strategies}
          onGenerate={handleGenerate}
          onEditAmount={() => setCurrentStep(0)}
          onEditStrategy={() => setCurrentStep(1)}
          isGenerating={isGenerating}
        />
      </StepWizard>
    </div>
  );
}
