"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { TradingPair } from "@/types/crypto";
import { fetchTradingPairs } from "@/lib/price-service";

const REFRESH_INTERVAL = 60000; // 60 seconds

export function useCryptoPairs() {
  const [pairs, setPairs] = useState<TradingPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<NodeJS.Timeout>();
  const mountedRef = useRef(false);

  const fetchPairsData = useCallback(async () => {
    try {
      setIsLoading(true);
      const tradingPairs = await fetchTradingPairs();
      setPairs(tradingPairs);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch trading pairs",
      );
      setPairs([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;

    fetchPairsData();

    intervalRef.current = setInterval(fetchPairsData, REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      mountedRef.current = false;
    };
  }, [fetchPairsData]);

  const refetch = useCallback(async () => {
    // Reset the interval when manually refetching
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    await fetchPairsData();
    intervalRef.current = setInterval(fetchPairsData, REFRESH_INTERVAL);
  }, [fetchPairsData]);

  return {
    pairs,
    isLoading,
    error,
    refetch,
  };
}
