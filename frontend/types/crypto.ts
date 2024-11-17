export interface Coin {
  id: string;
  symbol: string;
  name: string;
}

export interface TradingPair {
  id: string;
  fromCoin: Coin;
  toCoin: Coin;
  active: boolean;
  addedAt: string;
}

export interface PriceInfo {
  price: number;
  change24h: number;
  changePercentage24h: number;
  fromSymbol: string;
  toSymbol: string;
  lastUpdated: string;
}

export interface PriceData {
  [key: string]: PriceInfo;
}

export interface ApiPriceResponse {
  pairs: {
    [key: string]: PriceInfo;
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
