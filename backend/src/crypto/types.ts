export interface TradingPair {
  id: string;
  from: string;
  to: string;
  active: boolean;
  addedAt: string;
  deactivatedAt?: string;
}

export interface PriceData {
  price: number;
  change24h: number;
  changePercentage24h: number;
}

export interface PriceResponse {
  pairs: Record<string, PriceData>;
  lastUpdated: string;
  rawPrices: Record<
    string,
    {
      usd: number;
      usd_24h_change: number;
    }
  >;
}
