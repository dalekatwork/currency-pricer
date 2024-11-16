# Cryptocurrency Price API

A NestJS-based API that provides cryptocurrency prices with efficient caching mechanisms.

## Installation and Setup

1. **Clone and Install Dependencies**
```bash
npm install
```

2. **Start the Application**

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run start:prod
```

3. **Docker Setup**
```bash
# Build the image
docker build -t crypto-api .

# Run the container
docker run -p 8000:8000 crypto-api
```

## API Endpoints

- `GET /crypto/prices` - Returns current cryptocurrency prices
- `GET /crypto/pairs` - Lists all active trading pairs
- `POST /crypto/pairs` - Add new trading pair
- `PUT /crypto/pairs/:id/deactivate` - Deactivate a trading pair
- Swagger UI available at `/api`

## Trading Pairs Management

The API supports dynamic management of cryptocurrency trading pairs:

1. **Adding New Pairs**
   - Pairs can be added via the `/crypto/pairs` endpoint
   - Each pair consists of a base and quote currency
   - Example: TON/USDT, USDT/TON

2. **Listing Active Pairs**
   - View all currently active trading pairs
   - Includes addition timestamp for each pair

3. **Deactivating Pairs**
   - Pairs can be deactivated rather than deleted
   - Historical data remains accessible
   - Deactivated pairs no longer fetch price updates

## Caching Strategy

The application implements a sophisticated caching mechanism to minimize external API calls to CoinGecko:

1. **In-Memory Cache Layer**
   - Uses NestJS Cache Manager with a 30-minute TTL (Time To Live)
   - Cache size limited to 100 items to prevent memory overflow
   - Configured in `app.module.ts` with global accessibility

2. **Automatic Cache Updates**
   - Implements a CRON job that runs every 30 minutes
   - Proactively updates prices before cache expiration
   - Ensures data freshness while minimizing API calls

3. **Cache-First Approach**
   - All requests first check the cache
   - Only calls external API if cache is empty
   - Provides instant responses for cached data

4. **Implementation Details**
```typescript
// Cache configuration (app.module.ts)
CacheModule.register({
  isGlobal: true,  // Available throughout the application
  ttl: 1800,       // 30 minutes in seconds
  max: 100,        // Maximum cache items
})

// Price retrieval with cache (crypto.service.ts)
async getPrices() {
  let prices = await this.cacheManager.get('crypto_prices');
  if (!prices) {
    prices = await this.updatePrices();
  }
  return prices;
}
```

This caching strategy ensures:
- Minimal external API calls
- Fast response times
- Reduced API rate limit consumption
- High availability of price data