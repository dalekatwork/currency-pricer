"use client";

import { PriceCard } from "./PriceCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { TradingPair, PriceData } from "@/types/crypto";
import { formatDistanceToNow } from "date-fns";

interface PriceGridProps {
  prices: PriceData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
  tradingPairs: TradingPair[];
}

export function PriceGrid({
  prices,
  isLoading,
  error,
  lastUpdated,
  tradingPairs,
}: PriceGridProps) {
  if (error) return <ErrorMessage message={error} />;
  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {tradingPairs.map((pair) => (
          <PriceCard
            key={pair.id}
            pair={pair.name}
            priceInfo={prices?.[pair.id]}
            comingSoon={!prices?.[pair.id]}
          />
        ))}
      </div>
      {lastUpdated && (
        <p className="text-center text-sm text-muted-foreground">
          Last updated: {formatDistanceToNow(new Date(lastUpdated))} ago
        </p>
      )}
    </div>
  );
}
