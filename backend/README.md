# Cryptocurrency Price API

A NestJS-based API that provides cryptocurrency prices with efficient caching mechanisms.

## Installation and Setup

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
   - Example: TON/USDT, USDT/TON
   - There is a fixture in place that adds TON/USDT and USDT/TON pairs by default to the db

2. **Listing Active Pairs**
   - View all currently active trading pairs
   - Includes addition timestamp for each pair

## Caching

1. In-Memory Cache Layer with 30-minute TTL and limit of 100 entries
2. Only calls external API if cache is empty
3. Cron job that runs every 30 minutes
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
