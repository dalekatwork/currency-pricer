import { Injectable, Inject, OnModuleInit, Logger } from "@nestjs/common";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Cache } from "cache-manager";
import { Cron, CronExpression } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThanOrEqual, LessThanOrEqual } from "typeorm";
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
  private readonly logger = new Logger(CryptoService.name);

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
      this.logger.log("Initializing default trading pairs...");
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

    // Force initial price update
    await this.updatePrices();
  }

  @Cron(CronExpression.EVERY_30_MINUTES)
  async updatePrices(): Promise<PriceResponse> {
    try {
      const activePairs = await this.tradingPairRepository.find({
        where: { active: true },
      });

      this.logger.debug(`Found ${activePairs.length} active pairs`);

      if (activePairs.length === 0) {
        const emptyResponse = {
          pairs: {},
          lastUpdated: new Date().toISOString(),
          rawPrices: {},
        };
        await this.cacheManager.set("crypto_pairs_prices", emptyResponse);
        return emptyResponse;
      }

      const prices = await this.fetchPricesFromAPI();
      await this.cacheManager.set("crypto_pairs_prices", prices);

      // Store historical data
      const timestamp = new Date();
      for (const [pairKey, priceData] of Object.entries(prices.pairs)) {
        const priceHistory = this.priceHistoryRepository.create({
          pairId: pairKey,
          price: priceData.price,
          change24h: priceData.change24h,
          changePercentage24h: priceData.changePercentage24h,
          fromSymbol: priceData.fromSymbol,
          toSymbol: priceData.toSymbol,
          timestamp,
        });
        await this.priceHistoryRepository.save(priceHistory);
      }

      return prices;
    } catch (error) {
      this.logger.error("Error updating prices:", error);
      return this.getRecentPricesFromDB();
    }
  }

  async getPrices(): Promise<PriceResponse> {
    try {
      let prices = await this.cacheManager.get<PriceResponse>(
        "crypto_pairs_prices",
      );
      if (!prices) {
        this.logger.debug("Cache miss, fetching new prices");
        prices = await this.updatePrices();
      }
      return prices;
    } catch (error) {
      this.logger.error("Error getting prices:", error);
      return this.getRecentPricesFromDB();
    }
  }

  private async getRecentPricesFromDB(): Promise<PriceResponse> {
    this.logger.debug("Fetching recent prices from database");

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

    // Get the most recent price history entries for each pair
    const recentPrices = await this.priceHistoryRepository
      .createQueryBuilder("history")
      .select("history.*")
      .where("history.timestamp >= :date", { date: thirtyMinutesAgo })
      .orderBy("history.timestamp", "DESC")
      .getRawMany();

    if (recentPrices.length === 0) {
      return {
        pairs: {},
        lastUpdated: new Date().toISOString(),
        rawPrices: {},
      };
    }

    // Convert to PriceResponse format
    const pairs: Record<string, PriceData> = {};
    let lastUpdated = new Date(0);

    for (const price of recentPrices) {
      const timestamp = new Date(price.timestamp);
      if (timestamp > lastUpdated) {
        lastUpdated = timestamp;
      }

      pairs[price.pairId] = {
        price: parseFloat(price.price),
        change24h: parseFloat(price.change24h),
        changePercentage24h: parseFloat(price.changePercentage24h),
        fromSymbol: price.fromSymbol,
        toSymbol: price.toSymbol,
        lastUpdated: timestamp.toISOString(),
      };
    }

    return {
      pairs,
      lastUpdated: lastUpdated.toISOString(),
      rawPrices: {}, // We don't store raw prices in DB
    };
  }

  async getHistoricalPrices(
    pairId: string,
    days: number = 7,
  ): Promise<PriceHistory[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.priceHistoryRepository.find({
      where: {
        pairId,
        timestamp: MoreThanOrEqual(startDate),
      },
      order: {
        timestamp: "ASC",
      },
    });
  }

  private async fetchPricesFromAPI(): Promise<PriceResponse> {
    const activePairs = await this.tradingPairRepository.find({
      where: { active: true },
    });

    this.logger.debug(`Fetching prices for ${activePairs.length} pairs`);

    // Get unique coin IDs
    const uniqueCoins = new Set<string>();
    activePairs.forEach((pair) => {
      uniqueCoins.add(pair.fromCoin.id);
      uniqueCoins.add(pair.toCoin.id);
    });

    const coinIds = Array.from(uniqueCoins).join(",");

    this.logger.debug(`Requesting prices for coins: ${coinIds}`);

    const response = await axios.get(`${this.COINGECKO_API}/simple/price`, {
      params: {
        ids: coinIds,
        vs_currencies: "usd",
        include_24hr_change: true,
      },
    });

    const rawPrices = response.data;
    const pairPrices: Record<string, PriceData> = {};

    this.logger.debug(`Raw prices received:`, rawPrices);

    for (const pair of activePairs) {
      const fromData = rawPrices[pair.fromCoin.id];
      const toData = rawPrices[pair.toCoin.id];

      if (fromData?.usd && toData?.usd) {
        const pairKey = `${pair.fromCoin.symbol}/${pair.toCoin.symbol}`;
        const currentPrice = fromData.usd / toData.usd;
        const fromChange = fromData.usd_24h_change || 0;
        const toChange = toData.usd_24h_change || 0;
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

        this.logger.debug(
          `Calculated price for ${pairKey}:`,
          pairPrices[pairKey],
        );
      } else {
        this.logger.warn(
          `Missing price data for pair ${pair.fromCoin.symbol}/${pair.toCoin.symbol}`,
        );
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
      pairs.push(forwardPair);
    } else if (!forwardPair.active) {
      forwardPair.active = true;
      forwardPair.deactivatedAt = null;
      await this.tradingPairRepository.save(forwardPair);
      pairs.push(forwardPair);
    }

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
      pairs.push(reversePair);
    } else if (!reversePair.active) {
      reversePair.active = true;
      reversePair.deactivatedAt = null;
      await this.tradingPairRepository.save(reversePair);
      pairs.push(reversePair);
    }

    // Force cache update
    await this.cacheManager.del("crypto_pairs_prices");
    await this.updatePrices();

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

      // Force cache update
      await this.cacheManager.del("crypto_pairs_prices");
      await this.updatePrices();

      return this.mapEntityToInterface(pair);
    }

    return null;
  }
}
