import { Module } from "@nestjs/common";
import { CacheModule } from "@nestjs/cache-manager";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CryptoModule } from "./crypto/crypto.module";
import { PriceHistory } from "./crypto/entities/price-history.entity";
import { TradingPair } from "./crypto/entities/trading-pair.entity";

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,
      ttl: 1800,
      max: 100,
      store: "memory",
    }),
    TypeOrmModule.forRoot({
      type: "sqlite",
      database: "crypto_prices.sqlite3",
      entities: [PriceHistory, TradingPair],
      synchronize: true,
    }),
    ScheduleModule.forRoot(),
    CryptoModule,
  ],
})
export class AppModule {}
