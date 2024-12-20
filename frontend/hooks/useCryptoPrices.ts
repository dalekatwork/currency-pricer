"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { PriceData } from "@/types/crypto";
import { fetchPrices } from "@/lib/price-service";

const REFRESH_INTERVAL = 60000; // 60 seconds

export function useCryptoPrices() {
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(false);

  const fetchPriceData = useCallback(async () => {
    try {
      const { prices: newPrices, lastUpdated: newLastUpdated } =
        await fetchPrices();
      setPrices(newPrices);
      setLastUpdated(newLastUpdated);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch prices");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    fetchPriceData();

    intervalRef.current = setInterval(fetchPriceData, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      mountedRef.current = false;
    };
  }, [fetchPriceData]);

  const refetch = useCallback(async () => {
    // Reset the interval when manually refetching
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    await fetchPriceData();
    intervalRef.current = setInterval(fetchPriceData, REFRESH_INTERVAL);
  }, [fetchPriceData]);

  return {
    prices,
    lastUpdated,
    isLoading,
    error,
    refetch,
  };
}
