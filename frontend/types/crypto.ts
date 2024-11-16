export interface TradingPair {
  id: string;
  name: string;
  base: string;
  quote: string;
}

export interface PairGroup {
  id: string;
  name: string;
  pairs: TradingPair[];
}

export interface PriceData {
  [key: string]: PriceInfo;
}

export interface PriceInfo {
  price: number;
  change24h: number;
  changePercentage24h: number;
}

export interface ApiResponse {
  pairs: {
    "the-open-network/tether": {
      price: number;
      change24h: number;
      changePercentage24h: number;
    };
    "tether/the-open-network": {
      price: number;
      change24h: number;
      changePercentage24h: number;
    };
  };
  lastUpdated: string;
  rawPrices: {
    tether: {
      usd: number;
      usd_24h_change: number;
    };
    "the-open-network": {
      usd: number;
      usd_24h_change: number;
    };
  };
}
