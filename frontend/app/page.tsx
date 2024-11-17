"use client";

import { Coins } from "lucide-react";
import { PriceGrid } from "@/components/crypto/PriceGrid";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { useCryptoPairs } from "@/hooks/useCryptoPairs";
import { AddPairDialog } from "@/components/crypto/AddPairDialog";

export default function Home() {
  const {
    pairs,
    isLoading: pairsLoading,
    error: pairsError,
    refetch: refetchPairs,
  } = useCryptoPairs();

  const {
    prices,
    isLoading: pricesLoading,
    error: pricesError,
    lastUpdated,
    refetch: refetchPrices,
  } = useCryptoPrices();

  const isLoading = pricesLoading || pairsLoading;
  const error = pricesError || pairsError;

  const handleRetry = () => {
    refetchPairs();
    refetchPrices();
  };

  const handlePairAdded = async () => {
    await Promise.all([refetchPairs(), refetchPrices()]);
  };

  return (
    <div className="flex flex-col min-h-screen">
      <ThemeToggle />
      <header className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-sm z-50 border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-3 mb-3">
              <Coins className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-semibold">Crypto Price Tracker</h1>
            </div>
            <p className="text-muted-foreground">
              Real-time cryptocurrency price updates every 60 seconds
            </p>
          </div>

          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Trading Pairs</h2>
            <AddPairDialog onPairAdded={handlePairAdded} />
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 mt-48 mb-20">
        <div className="max-w-4xl mx-auto">
          <PriceGrid
            prices={prices}
            isLoading={isLoading}
            error={error}
            lastUpdated={lastUpdated}
            tradingPairs={pairs}
            onRetry={handleRetry}
          />
        </div>
      </main>
    </div>
  );
}
