import { PriceData, ApiPriceResponse, TradingPair } from "@/types/crypto";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function fetchTradingPairs(): Promise<TradingPair[]> {
  try {
    const response = await fetch(`${BASE_URL}/crypto/pairs`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const pairs = await response.json();
    return pairs;
  } catch (error) {
    console.error("Error fetching trading pairs:", error);
    throw new Error(
      "Failed to fetch trading pairs. Please check your connection and try again.",
    );
  }
}

export async function fetchPrices(): Promise<{
  prices: PriceData;
  lastUpdated: string;
}> {
  try {
    const response = await fetch(`${BASE_URL}/crypto/prices`, {
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data: ApiPriceResponse = await response.json();

    return {
      prices: data.pairs,
      lastUpdated: data.lastUpdated,
    };
  } catch (error) {
    console.error("Error fetching prices:", error);
    throw new Error(
      "Failed to fetch prices. Please check your connection and try again.",
    );
  }
}
