import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  NotFoundException,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
  ApiExtraModels,
} from "@nestjs/swagger";
import { CryptoService } from "./crypto.service";
import { TradingPair, PriceResponse, Coin } from "./types";
import { PriceHistory } from "./entities/price-history.entity";
import { AddPairDto } from "./dto/add-pair.dto";

interface PairResponse {
  message: string;
  pairs: TradingPair[];
}

@ApiTags("crypto")
@Controller("crypto")
@ApiExtraModels(AddPairDto)
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get("prices")
  @ApiOperation({
    summary: "Get current cryptocurrency pair prices",
    description:
      "Retrieves current prices, 24h changes, and other metrics for all active trading pairs",
  })
  @ApiResponse({
    status: 200,
    description: "Returns current prices for cryptocurrency pairs with symbols",
    schema: {
      example: {
        pairs: {
          "BTC/ETH": {
            price: 16.85,
            change24h: 0.25,
            changePercentage24h: 1.5,
            fromSymbol: "BTC",
            toSymbol: "ETH",
            lastUpdated: "2024-11-16T22:05:35.000Z",
          },
        },
        lastUpdated: "2024-11-16T22:05:35.000Z",
      },
    },
  })
  async getPrices(): Promise<PriceResponse> {
    return this.cryptoService.getPrices();
  }

  @Get("prices/:pairId/history")
  @ApiOperation({
    summary: "Get historical prices for a trading pair",
    description:
      "Retrieves historical price data for a specific trading pair over a specified number of days",
  })
  @ApiParam({
    name: "pairId",
    description: "Trading pair ID (e.g., BTC-ETH)",
    example: "btc-eth",
  })
  @ApiQuery({
    name: "days",
    required: false,
    description: "Number of days of history",
    example: 7,
  })
  @ApiResponse({
    status: 200,
    description: "Returns historical price data for the specified pair",
    schema: {
      example: [
        {
          id: 1,
          pairId: "BTC/ETH",
          price: 16.85,
          change24h: 0.25,
          changePercentage24h: 1.5,
          fromSymbol: "BTC",
          toSymbol: "ETH",
          timestamp: "2024-11-16T22:05:35.000Z",
        },
      ],
    },
  })
  async getHistoricalPrices(
    @Param("pairId") pairId: string,
    @Query("days") days: number = 7,
  ): Promise<PriceHistory[]> {
    return this.cryptoService.getHistoricalPrices(pairId, days);
  }

  @Get("pairs")
  @ApiOperation({
    summary: "List all trading pairs",
    description:
      "Returns a list of all configured trading pairs, including both active and inactive pairs",
  })
  @ApiResponse({
    status: 200,
    description: "Returns list of all trading pairs with coin details",
    schema: {
      example: [
        {
          id: "btc-eth",
          fromCoin: {
            id: "bitcoin",
            symbol: "BTC",
            name: "Bitcoin",
          },
          toCoin: {
            id: "ethereum",
            symbol: "ETH",
            name: "Ethereum",
          },
          active: true,
          addedAt: "2024-11-16T22:05:35.000Z",
        },
      ],
    },
  })
  async listPairs(): Promise<TradingPair[]> {
    return this.cryptoService.listTradingPairs();
  }

  @Post("pairs")
  @ApiOperation({
    summary: "Add new trading pair",
    description:
      "Adds a new cryptocurrency trading pair and its reverse pair to the system",
  })
  @ApiBody({
    type: AddPairDto,
    description: "Trading pair information",
    examples: {
      "BTC/ETH Pair": {
        value: {
          from: {
            id: "bitcoin",
            symbol: "BTC",
            name: "Bitcoin",
          },
          to: {
            id: "ethereum",
            symbol: "ETH",
            name: "Ethereum",
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "Trading pairs added successfully",
    schema: {
      example: {
        message: "Trading pairs added successfully",
        pairs: [
          {
            id: "btc-eth",
            fromCoin: {
              id: "bitcoin",
              symbol: "BTC",
              name: "Bitcoin",
            },
            toCoin: {
              id: "ethereum",
              symbol: "ETH",
              name: "Ethereum",
            },
            active: true,
            addedAt: "2024-11-16T22:05:35.000Z",
          },
          {
            id: "eth-btc",
            fromCoin: {
              id: "ethereum",
              symbol: "ETH",
              name: "Ethereum",
            },
            toCoin: {
              id: "bitcoin",
              symbol: "BTC",
              name: "Bitcoin",
            },
            active: true,
            addedAt: "2024-11-16T22:05:35.000Z",
          },
        ],
      },
    },
  })
  async addPair(@Body() pair: AddPairDto): Promise<PairResponse> {
    const newPairs = await this.cryptoService.addTradingPair(
      pair.from,
      pair.to,
    );
    return {
      message: "Trading pairs added successfully",
      pairs: newPairs,
    };
  }

  @Put("pairs/:id/deactivate")
  @ApiOperation({
    summary: "Deactivate a trading pair",
    description:
      "Deactivates an active trading pair. Deactivated pairs will no longer fetch price updates.",
  })
  @ApiParam({
    name: "id",
    description: "Trading pair ID (e.g., btc-eth)",
    example: "btc-eth",
  })
  @ApiResponse({
    status: 200,
    description: "Trading pair deactivated successfully",
    schema: {
      example: {
        message: "Trading pair deactivated successfully",
        pair: {
          id: "btc-eth",
          fromCoin: {
            id: "bitcoin",
            symbol: "BTC",
            name: "Bitcoin",
          },
          toCoin: {
            id: "ethereum",
            symbol: "ETH",
            name: "Ethereum",
          },
          active: false,
          addedAt: "2024-11-16T22:05:35.000Z",
          deactivatedAt: "2024-11-16T23:05:35.000Z",
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: "Trading pair not found or already deactivated",
  })
  async deactivatePair(@Param("id") id: string): Promise<PairResponse> {
    const pair = await this.cryptoService.deactivateTradingPair(id);
    if (!pair) {
      throw new NotFoundException(
        "Trading pair not found or already deactivated",
      );
    }
    return {
      message: "Trading pair deactivated successfully",
      pairs: [pair],
    };
  }
}
