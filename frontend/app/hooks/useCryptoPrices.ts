"use client";

import { useState, useEffect } from 'react';

export interface PriceData {
  "TON/USDT": number;
  "USDT/TON": number;
}

export function useCryptoPrices() {
  const [prices, setPrices] = useState<PriceData | null>(null);
  const [previousPrices, setPreviousPrices] = useState<PriceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPrices = async () => {
    try {
      const response = await fetch("/api/prices");
      if (!response.ok) throw new Error('Failed to fetch prices');
      const newPrices = await response.json();
      setPreviousPrices(prices);
      setPrices(newPrices);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch prices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 30000);
    return () => clearInterval(interval);
  }, []);

  return { prices, previousPrices, isLoading, error, refetch: fetchPrices };
}