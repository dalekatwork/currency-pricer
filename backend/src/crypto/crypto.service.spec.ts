import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;
  let cacheManager: { get: jest.Mock; set: jest.Mock };

  beforeEach(async () => {
    cacheManager = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        {
          provide: CACHE_MANAGER,
          useValue: cacheManager,
        },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should return cached prices if available', async () => {
    const mockPrices = {
      bitcoin: { usd: 50000 },
      ethereum: { usd: 3000 },
    };
    
    cacheManager.get.mockResolvedValue(mockPrices);
    
    const result = await service.getPrices();
    expect(result).toEqual(mockPrices);
    expect(cacheManager.get).toHaveBeenCalledWith('crypto_prices');
  });
});