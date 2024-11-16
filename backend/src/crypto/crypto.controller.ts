import { Controller, Get, Post, Put, Body, Param, NotFoundException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam } from '@nestjs/swagger';
import { CryptoService } from './crypto.service';
import { TradingPair, PriceResponse } from './types';

class AddPairDto {
  from: string;
  to: string;
}

interface PairResponse {
  message: string;
  pair: TradingPair;
}

@ApiTags('crypto')
@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get('prices')
  @ApiOperation({ summary: 'Get current cryptocurrency pair prices' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns current prices for cryptocurrency pairs'
  })
  async getPrices(): Promise<PriceResponse> {
    return this.cryptoService.getPrices();
  }

  @Get('pairs')
  @ApiOperation({ summary: 'List all trading pairs' })
  @ApiResponse({ 
    status: 200, 
    description: 'Returns list of all trading pairs'
  })
  async listPairs(): Promise<TradingPair[]> {
    return this.cryptoService.listTradingPairs();
  }

  @Post('pairs')
  @ApiOperation({ summary: 'Add new trading pair' })
  @ApiBody({ type: AddPairDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Trading pair added successfully'
  })
  async addPair(@Body() pair: AddPairDto): Promise<PairResponse> {
    const newPair = this.cryptoService.addTradingPair(pair.from, pair.to);
    return { 
      message: 'Trading pair added successfully',
      pair: newPair
    };
  }

  @Put('pairs/:id/deactivate')
  @ApiOperation({ summary: 'Deactivate a trading pair' })
  @ApiParam({ name: 'id', description: 'Trading pair ID' })
  @ApiResponse({ 
    status: 200, 
    description: 'Trading pair deactivated successfully'
  })
  async deactivatePair(@Param('id') id: string): Promise<PairResponse> {
    const pair = this.cryptoService.deactivateTradingPair(id);
    if (!pair) {
      throw new NotFoundException('Trading pair not found or already deactivated');
    }
    return {
      message: 'Trading pair deactivated successfully',
      pair
    };
  }
}