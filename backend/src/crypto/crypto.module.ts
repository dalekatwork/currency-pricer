import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CryptoController } from "./crypto.controller";
import { CryptoService } from "./crypto.service";
import { PriceHistory } from "./entities/price-history.entity";
import { TradingPair } from "./entities/trading-pair.entity";

@Module({
  imports: [TypeOrmModule.forFeature([PriceHistory, TradingPair])],
  controllers: [CryptoController],
  providers: [CryptoService],
})
export class CryptoModule {}
