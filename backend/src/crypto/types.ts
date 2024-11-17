export interface Coin {
  id: string; // coingecko id
  symbol: string; // e.g., 'TON'
  name: string; // e.g., 'Toncoin'
}

export interface TradingPair {
  id: string;
  fromCoin: Coin;
  toCoin: Coin;
  active: boolean;
  addedAt: string;
  deactivatedAt?: string;
}

export interface PriceData {
  price: number;
  change24h: number;
  changePercentage24h: number;
  fromSymbol: string;
  toSymbol: string;
  lastUpdated: string;
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
