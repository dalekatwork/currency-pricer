import { Injectable, Inject, OnModuleInit } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThanOrEqual } from "typeorm";
import axios from "axios";
import {
  PriceResponse,
  PriceData,
  Coin,
  TradingPair as TradingPairInterface,
} from "./types";
import { PriceHistory } from "./entities/price-history.entity";
import { TradingPair } from "./entities/trading-pair.entity";

@Injectable()
export class CryptoService implements OnModuleInit {
  private readonly COINGECKO_API = "https://api.coingecko.com/api/v3";

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(PriceHistory)
    private priceHistoryRepository: Repository<PriceHistory>,
    @InjectRepository(TradingPair)
    private tradingPairRepository: Repository<TradingPair>,
  ) {}

  private mapEntityToInterface(entity: TradingPair): TradingPairInterface {
    return {
      ...entity,
      addedAt: entity.addedAt.toISOString(),
      deactivatedAt: entity.deactivatedAt?.toISOString(),
    };
  }

  async onModuleInit() {
    // Initialize default trading pairs if none exist
    const count = await this.tradingPairRepository.count();
    if (count === 0) {
      await this.addTradingPair(
        {
          id: "the-open-network",
          symbol: "TON",
          name: "Toncoin",
        },
        {
          id: "tether",
          symbol: "USDT",
          name: "Tether",
        },
      );
    }
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updatePrices(): Promise<PriceResponse> {
    try {
      const prices = await this.fetchPricesFromAPI();
      await this.cacheManager.set("crypto_pairs_prices", prices);

      // Store historical data
      for (const [pairKey, priceData] of Object.entries(prices.pairs)) {
        const priceHistory = this.priceHistoryRepository.create({
          pairId: pairKey,
          price: priceData.price,
          change24h: priceData.change24h,
          changePercentage24h: priceData.changePercentage24h,
          fromSymbol: priceData.fromSymbol,
          toSymbol: priceData.toSymbol,
        });
        await this.priceHistoryRepository.save(priceHistory);
      }

      return prices;
    } catch (error) {
      // If API call fails, try to get recent prices from DB
      return this.getRecentPricesFromDB();
    }
  }

  async getPrices(): Promise<PriceResponse> {
    try {
      let prices = await this.cacheManager.get<PriceResponse>(
        "crypto_pairs_prices",
      );
      if (!prices) {
        prices = await this.updatePrices();
      }
      return prices;
    } catch (error) {
      // If both cache and API fail, fallback to DB
      return this.getRecentPricesFromDB();
    }
  }

  private async getRecentPricesFromDB(): Promise<PriceResponse> {
    const thirtyMinutesAgo = new Date();
    thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);

    // Get the most recent price for each pair within the last 30 minutes
    const recentPrices = await this.priceHistoryRepository
      .createQueryBuilder("price")
      .select("price.*")
      .where("price.timestamp >= :cutoff", { cutoff: thirtyMinutesAgo })
      .orderBy("price.timestamp", "DESC")
      .getRawMany();

    // Group by pairId and take the most recent for each
    const pairPrices: Record<string, PriceData> = {};
    const processedPairs = new Set();

    for (const price of recentPrices) {
      if (!processedPairs.has(price.pairId)) {
        pairPrices[price.pairId] = {
          price: parseFloat(price.price),
          change24h: parseFloat(price.change24h),
          changePercentage24h: parseFloat(price.changePercentage24h),
          fromSymbol: price.fromSymbol,
          toSymbol: price.toSymbol,
          lastUpdated: price.timestamp,
        };
        processedPairs.add(price.pairId);
      }
    }

    return {
      pairs: pairPrices,
      lastUpdated: new Date().toISOString(),
      rawPrices: {}, // Empty when using fallback data
    };
  }

  async getHistoricalPrices(
    pairId: string,
    days: number = 7,
  ): Promise<PriceHistory[]> {
    const date = new Date();
    date.setDate(date.getDate() - days);

    return this.priceHistoryRepository.find({
      where: {
        pairId,
        timestamp: MoreThanOrEqual(date),
      },
      order: {
        timestamp: "DESC",
      },
    });
  }

  private async fetchPricesFromAPI(): Promise<PriceResponse> {
    const activePairs = await this.tradingPairRepository.find({
      where: { active: true },
    });

    const ids = [
      ...new Set(
        activePairs.flatMap((pair) => [pair.fromCoin.id, pair.toCoin.id]),
      ),
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
      const fromPrice = rawPrices[pair.fromCoin.id]?.usd;
      const toPrice = rawPrices[pair.toCoin.id]?.usd;
      const fromChange = rawPrices[pair.fromCoin.id]?.usd_24h_change || 0;
      const toChange = rawPrices[pair.toCoin.id]?.usd_24h_change || 0;

      if (fromPrice && toPrice) {
        const pairKey = `${pair.fromCoin.symbol}/${pair.toCoin.symbol}`;
        const currentPrice = fromPrice / toPrice;
        const changePercentage = fromChange - toChange;
        const priceYesterday = currentPrice / (1 + changePercentage / 100);
        const priceChange = currentPrice - priceYesterday;

        pairPrices[pairKey] = {
          price: currentPrice,
          change24h: priceChange,
          changePercentage24h: changePercentage,
          fromSymbol: pair.fromCoin.symbol,
          toSymbol: pair.toCoin.symbol,
          lastUpdated: new Date().toISOString(),
        };
      }
    }

    return {
      pairs: pairPrices,
      lastUpdated: new Date().toISOString(),
      rawPrices,
    };
  }

  async addTradingPair(from: Coin, to: Coin): Promise<TradingPairInterface[]> {
    const pairs: TradingPair[] = [];

    // Create forward pair
    const forwardId = `${from.symbol}-${to.symbol}`.toLowerCase();
    let forwardPair = await this.tradingPairRepository.findOne({
      where: { id: forwardId },
    });

    if (!forwardPair) {
      forwardPair = this.tradingPairRepository.create({
        id: forwardId,
        fromCoin: from,
        toCoin: to,
        active: true,
      });
      await this.tradingPairRepository.save(forwardPair);
    }
    pairs.push(forwardPair);

    // Create reverse pair
    const reverseId = `${to.symbol}-${from.symbol}`.toLowerCase();
    let reversePair = await this.tradingPairRepository.findOne({
      where: { id: reverseId },
    });

    if (!reversePair) {
      reversePair = this.tradingPairRepository.create({
        id: reverseId,
        fromCoin: to,
        toCoin: from,
        active: true,
      });
      await this.tradingPairRepository.save(reversePair);
    }
    pairs.push(reversePair);

    return pairs.map((pair) => this.mapEntityToInterface(pair));
  }

  async listTradingPairs(): Promise<TradingPairInterface[]> {
    const pairs = await this.tradingPairRepository.find();
    return pairs.map((pair) => this.mapEntityToInterface(pair));
  }

  async deactivateTradingPair(
    id: string,
  ): Promise<TradingPairInterface | null> {
    const pair = await this.tradingPairRepository.findOne({
      where: { id, active: true },
    });

    if (pair) {
      pair.active = false;
      pair.deactivatedAt = new Date();
      await this.tradingPairRepository.save(pair);
      return this.mapEntityToInterface(pair);
    }

    return null;
  }
}
