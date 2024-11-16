"use client";

import { useState, useEffect } from "react";
import { PriceData } from "@/types/crypto";
import { PriceService } from "@/lib/price-service";

export function useCryptoPrices(updateInterval = 5000) {
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      const priceService = PriceService.getInstance();
      const { prices: newPrices, lastUpdated: newLastUpdated } =
        await priceService.getPrices();
      setPrices(newPrices);
      setLastUpdated(newLastUpdated);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prices");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, updateInterval);
    return () => clearInterval(interval);
  }, [updateInterval]);

  return {
    prices,
    lastUpdated,
    isLoading,
    error,
    refetch: fetchPrices,
  };
}
