import { TradingPair } from "@/types/crypto";

export interface PairGroup {
  id: string;
  name: string;
  pairs: TradingPair[];
}

export const TRADING_PAIRS: PairGroup[] = [
  {
    id: "ton-pairs",
    name: "TON/USDT",
    pairs: [
      {
        id: "TON/USDT",
        name: "TON/USDT",
        base: "TON",
        quote: "USDT",
      },
      {
        id: "USDT/TON",
        name: "USDT/TON",
        base: "USDT",
        quote: "TON",
      },
    ],
  },
  {
    id: "coming-soon",
    name: "Coming Soon",
    pairs: [
      {
        id: "ETH/USDT",
        name: "ETH/USDT (Coming Soon)",
        base: "ETH",
        quote: "USDT",
      },
      {
        id: "BNB/USDT",
        name: "BNB/USDT (Coming Soon)",
        base: "BNB",
        quote: "USDT",
      },
    ],
  },
];