import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { CryptoModule } from './crypto/crypto.module';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,  // Make cache module global
      ttl: 1800, // 30 minutes
      max: 100, // maximum number of items in cache
    }),
    ScheduleModule.forRoot(),
    CryptoModule,
  ],
})
export class AppModule {}