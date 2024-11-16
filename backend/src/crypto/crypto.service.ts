import { Injectable, Inject } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { Cron, CronExpression } from "@nestjs/schedule";
import axios from "axios";
import { TradingPair, PriceResponse, PriceData } from "./types";

@Injectable()
export class CryptoService {
  private readonly COINGECKO_API = "https://api.coingecko.com/api/v3";
  private readonly TRADING_PAIRS: TradingPair[] = [
    {
      id: "ton-usdt",
      from: "the-open-network",
      to: "tether",
      active: true,
      addedAt: new Date().toISOString(),
    },
    {
      id: "usdt-ton",
      from: "tether",
      to: "the-open-network",
      active: true,
      addedAt: new Date().toISOString(),
    },
  ];

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updatePrices(): Promise<PriceResponse> {
    const prices = await this.fetchPricesFromAPI();
    await this.cacheManager.set("crypto_pairs_prices", prices);
    return prices;
  }

  async getPrices(): Promise<PriceResponse> {
    let prices = await this.cacheManager.get<PriceResponse>(
      "crypto_pairs_prices",
    );
    if (!prices) {
      prices = await this.updatePrices();
    }
    return prices;
  }

  private async fetchPricesFromAPI(): Promise<PriceResponse> {
    const activePairs = this.TRADING_PAIRS.filter((pair) => pair.active);
    const ids = [
      ...new Set(activePairs.flatMap((pair) => [pair.from, pair.to])),
    ].join(",");

    const response = await axios.get(`${this.COINGECKO_API}/simple/price`, {
      params: {
        ids: ids,
        vs_currencies: "usd",
        include_24hr_change: true,
      },
    });

    const rawPrices = response.data;
    const pairPrices: Record<string, PriceData> = {};

    for (const pair of activePairs) {
      const fromPrice = rawPrices[pair.from]?.usd;
      const toPrice = rawPrices[pair.to]?.usd;
      const fromChange = rawPrices[pair.from]?.usd_24h_change || 0;
      const toChange = rawPrices[pair.to]?.usd_24h_change || 0;

      if (fromPrice && toPrice) {
        const pairKey = `${pair.from}/${pair.to}`;
        const currentPrice = fromPrice / toPrice;
        const changePercentage = fromChange - toChange;
        const priceYesterday = currentPrice / (1 + changePercentage / 100);
        const priceChange = currentPrice - priceYesterday;

        pairPrices[pairKey] = {
          price: currentPrice,
          change24h: priceChange,
          changePercentage24h: changePercentage,
        };
      }
    }

    return {
      pairs: pairPrices,
      lastUpdated: new Date().toISOString(),
      rawPrices,
    };
  }

  addTradingPair(from: string, to: string): TradingPair {
    const id = `${from}-${to}`.toLowerCase();
    const exists = this.TRADING_PAIRS.some((pair) => pair.id === id);

    if (!exists) {
      this.TRADING_PAIRS.push({
        id,
        from,
        to,
        active: true,
        addedAt: new Date().toISOString(),
      });
    }
    return this.TRADING_PAIRS.find((pair) => pair.id === id)!;
  }

  listTradingPairs(): TradingPair[] {
    return this.TRADING_PAIRS;
  }

  deactivateTradingPair(id: string): TradingPair | null {
    const pair = this.TRADING_PAIRS.find((p) => p.id === id);
    if (pair && pair.active) {
      pair.active = false;
      pair.deactivatedAt = new Date().toISOString();
      return pair;
    }
    return null;
  }
}
