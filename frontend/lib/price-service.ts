import { PriceData, ApiResponse } from "@/types/crypto";

export class PriceService {
  private static instance: PriceService;
  private baseUrl = "http://localhost:8000";

  private constructor() {}

  static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  async getPrices(): Promise<{ prices: PriceData; lastUpdated: string }> {
    try {
      const response = await fetch(`${this.baseUrl}/crypto/prices`);
      if (!response.ok) {
        throw new Error("Failed to fetch prices");
      }

      const data: ApiResponse = await response.json();
      console.log("data", data);
      debugger;
      return {
        prices: {
          "TON/USDT": {
            price: data.pairs["the-open-network/tether"].price,
            change24h: data.pairs["the-open-network/tether"].change24h,
            changePercentage24h:
              data.pairs["the-open-network/tether"].changePercentage24h,
          },
          "USDT/TON": {
            price: data.pairs["tether/the-open-network"].price,
            change24h: data.pairs["tether/the-open-network"].change24h,
            changePercentage24h:
              data.pairs["tether/the-open-network"].changePercentage24h,
          },
        },
        lastUpdated: data.lastUpdated,
      };
    } catch (error) {
      console.error("Error fetching prices:", error);
      throw error;
    }
  }
}
