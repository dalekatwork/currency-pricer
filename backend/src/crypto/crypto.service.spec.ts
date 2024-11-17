import { Test, TestingModule } from "@nestjs/testing";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CryptoService } from "./crypto.service";
import { PriceHistory } from "./entities/price-history.entity";
import { TradingPair } from "./entities/trading-pair.entity";
import { Coin } from "./types";

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe("CryptoService", () => {
  let service: CryptoService;
  let cacheManager: { get: jest.Mock; set: jest.Mock };
  let priceHistoryRepository: MockRepository<PriceHistory>;
  let tradingPairRepository: MockRepository<TradingPair>;

  const mockBTC: Coin = {
    id: "bitcoin",
    symbol: "BTC",
    name: "Bitcoin",
  };

  const mockETH: Coin = {
    id: "ethereum",
    symbol: "ETH",
    name: "Ethereum",
  };

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    priceHistoryRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getRawMany: jest.fn().mockResolvedValue([]),
      }),
    };

    tradingPairRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      count: jest.fn().mockResolvedValue(0),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
        {
          provide: getRepositoryToken(PriceHistory),
          useValue: priceHistoryRepository,
        },
        {
          provide: getRepositoryToken(TradingPair),
          useValue: tradingPairRepository,
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  describe("getPrices", () => {
    it("should return cached prices if available", async () => {
      const mockPrices = {
        pairs: {
          "BTC/ETH": {
            price: 16.85,
            change24h: 0.25,
            changePercentage24h: 1.5,
            fromSymbol: "BTC",
            toSymbol: "ETH",
            lastUpdated: new Date().toISOString(),
          },
        },
        lastUpdated: new Date().toISOString(),
        rawPrices: {},
      };

      cacheManager.get.mockResolvedValue(mockPrices);

      const result = await service.getPrices();
      expect(result).toEqual(mockPrices);
      expect(cacheManager.get).toHaveBeenCalledWith("crypto_pairs_prices");
    });

    it("should fetch new prices if cache is empty", async () => {
      const mockPrices = {
        pairs: {},
        lastUpdated: new Date().toISOString(),
        rawPrices: {},
      };

      cacheManager.get.mockResolvedValue(null);
      jest
        .spyOn(service as any, "fetchPricesFromAPI")
        .mockResolvedValue(mockPrices);

      const result = await service.getPrices();
      expect(result).toEqual(mockPrices);
      expect(cacheManager.get).toHaveBeenCalledWith("crypto_pairs_prices");
      expect(cacheManager.set).toHaveBeenCalledWith(
        "crypto_pairs_prices",
        mockPrices,
      );
    });

    it("should fallback to DB if both cache and API fail", async () => {
      cacheManager.get.mockRejectedValue(new Error("Cache error"));
      jest
        .spyOn(service as any, "fetchPricesFromAPI")
        .mockRejectedValue(new Error("API error"));

      const mockDBPrices = {
        pairs: {},
        lastUpdated: new Date().toISOString(),
        rawPrices: {},
      };

      jest
        .spyOn(service as any, "getRecentPricesFromDB")
        .mockResolvedValue(mockDBPrices);

      const result = await service.getPrices();
      expect(result).toEqual(mockDBPrices);
    });
  });

  describe("addTradingPair", () => {
    it("should create both forward and reverse pairs", async () => {
      const mockForwardPair = {
        id: "btc-eth",
        fromCoin: mockBTC,
        toCoin: mockETH,
        active: true,
        addedAt: new Date(),
      };

      const mockReversePair = {
        id: "eth-btc",
        fromCoin: mockETH,
        toCoin: mockBTC,
        active: true,
        addedAt: new Date(),
      };

      (tradingPairRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(null);

      (tradingPairRepository.create as jest.Mock)
        .mockReturnValueOnce(mockForwardPair)
        .mockReturnValueOnce(mockReversePair);

      (tradingPairRepository.save as jest.Mock)
        .mockResolvedValueOnce(mockForwardPair)
        .mockResolvedValueOnce(mockReversePair);

      const result = await service.addTradingPair(mockBTC, mockETH);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("btc-eth");
      expect(result[1].id).toBe("eth-btc");
      expect(tradingPairRepository.save).toHaveBeenCalledTimes(2);
    });

    it("should not recreate existing pairs", async () => {
      const existingPair = {
        id: "btc-eth",
        fromCoin: mockBTC,
        toCoin: mockETH,
        active: true,
        addedAt: new Date(),
      };

      (tradingPairRepository.findOne as jest.Mock)
        .mockResolvedValueOnce(existingPair)
        .mockResolvedValueOnce(null);

      (tradingPairRepository.create as jest.Mock).mockReturnValueOnce({
        id: "eth-btc",
        fromCoin: mockETH,
        toCoin: mockBTC,
        active: true,
        addedAt: new Date(),
      });

      await service.addTradingPair(mockBTC, mockETH);

      expect(tradingPairRepository.save).toHaveBeenCalledTimes(1);
    });
  });

  describe("deactivateTradingPair", () => {
    it("should deactivate an active pair", async () => {
      const mockPair = {
        id: "btc-eth",
        fromCoin: mockBTC,
        toCoin: mockETH,
        active: true,
        addedAt: new Date(),
      };

      (tradingPairRepository.findOne as jest.Mock).mockResolvedValue(mockPair);
      (tradingPairRepository.save as jest.Mock).mockImplementation(
        async (pair) => pair,
      );

      const result = await service.deactivateTradingPair("btc-eth");

      expect(result).toBeTruthy();
      expect(result!.active).toBe(false);
      expect(result!.deactivatedAt).toBeDefined();
    });

    it("should return null for non-existent or inactive pairs", async () => {
      (tradingPairRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await service.deactivateTradingPair("non-existent");

      expect(result).toBeNull();
      expect(tradingPairRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("getHistoricalPrices", () => {
    it("should return historical prices for a pair", async () => {
      const mockHistory = [
        {
          id: 1,
          pairId: "BTC/ETH",
          fromSymbol: "BTC",
          toSymbol: "ETH",
          price: 16.85,
          change24h: 0.25,
          changePercentage24h: 1.5,
          timestamp: new Date(),
        },
      ];

      (priceHistoryRepository.find as jest.Mock).mockResolvedValue(mockHistory);

      const result = await service.getHistoricalPrices("BTC/ETH", 7);

      expect(result).toEqual(mockHistory);
      expect(priceHistoryRepository.find).toHaveBeenCalled();
    });
  });
});
