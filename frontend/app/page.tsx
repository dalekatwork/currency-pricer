"use client";

import { Coins } from "lucide-react";
import { PriceGrid } from "@/components/crypto/PriceGrid";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCryptoPrices } from "@/hooks/useCryptoPrices";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TRADING_PAIRS } from "@/config/trading-pairs";

export default function Home() {
  const { prices, isLoading, error, lastUpdated } = useCryptoPrices();

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-accent/5 pb-16">
      <ThemeToggle />
      <div className="container mx-auto px-4 py-12">
        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-3">
            <Coins className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-semibold">Crypto Price Tracker</h1>
          </div>
          <p className="text-muted-foreground">
            Real-time cryptocurrency price updates every minute
          </p>
        </header>

        <Tabs defaultValue={TRADING_PAIRS[0].id} className="max-w-4xl mx-auto">
          <TabsList className="grid grid-cols-2 w-[400px] mx-auto mb-8">
            {TRADING_PAIRS.map((group) => (
              <TabsTrigger key={group.id} value={group.id}>
                {group.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {TRADING_PAIRS.map((group) => (
            <TabsContent key={group.id} value={group.id}>
              <PriceGrid
                prices={prices}
                isLoading={isLoading}
                error={error}
                lastUpdated={lastUpdated}
                tradingPairs={group.pairs}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
}
