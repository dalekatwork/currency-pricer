# Crypto Price Tracker & API

A full-stack cryptocurrency tracking application with real-time price updates, featuring a Next.js frontend and NestJS backend.

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed

### Running the Application

1. Clone the repository:
```bash
git clone https://github.com/dalekatwork/currency-pricer
cd currency-pricer
```

2. Start both services:
```bash
docker-compose up -d
```

The services will be available at:
- Frontend (Price Tracker): http://localhost:3000
- Backend (API): http://localhost:8000
- API Documentation: http://localhost:8000/api

### Docker Commands

```bash
# Build and start services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Remove containers and volumes
docker-compose down -v
```

## Frontend (Crypto Price Tracker)

### Frontend features

**UI features**
- Real-time price updates every 60 seconds
- Dark/Light theme support
- Responsive design

**Scope for future updates**
1. Currently all data is fetched from api.
2. Added functionality to add more trading pairs, and fetch their data in realtime.
3. When you add a pair, the reverse of that pair is also added from the backend api.
4. [TODO] Add a feature to deactivate trading pair or delete them completely.

## Backend (Crypto Price API)

### Features

1. Caching and auto-update mechanism for 30 minute period
2. Trading pair support
3. Error handling for hitting 429 on the CoinGecko API source
4. DB handled currently using a sqlite3 db file (for the scope of this task).
  a. [TODO] Needs to be extracted out as a standalone RDS
  or Datastore service so that docker rm doesnt remove the historical data

### API Endpoints

1. `GET /crypto/prices` - Returns current cryptocurrency prices
2. `GET /crypto/pairs` - Lists all active trading pairs
3. `POST /crypto/pairs` - Add new trading pair
4. `PUT /crypto/pairs/:id/deactivate` - Deactivate a trading pair

**Trading Pairs Management**

The API supports dynamic management of cryptocurrency trading pairs:

1. **Adding New Pairs**
   - Pairs can be added via the `/crypto/pairs` endpoint
   - Example: TON/USDT, USDT/TON
   - There is a fixture in place that adds TON/USDT and USDT/TON pairs by default to the db

2. **Listing Active Pairs**
   - View all currently active trading pairs
   - Includes addition timestamp for each pair


### Caching

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

### Tech Stack

#### Frontend
- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui Components

#### Backend
- NestJS
- TypeScript
- Cache Manager
- Swagger UI

### Project Structure

```bash
frontend/
├── app/
│   ├── api/             # API routes
│   └── page.tsx         # Main page
├── components/
│   ├── crypto/          # price cards and core logic
├── hooks/                # hooks to fetch user data
├── lib/                  # util functions
backend/
├── src/
      ├── app.module.ts
      ├── main.ts
      └── crypto/
          ├── crypto.module.ts
          ├── crypto.controller.ts   # API endpoints
          ├── crypto.service.ts      # Core business logic
          ├── crypto.service.spec.ts # Test cases of core busines logic
          ├── types.ts               # Type definitions
          ├── dto/
          │   ├── add-pair.dto.ts    # Adding pairs
          └── entities/               # Database tables
              ├── price-history.entity.ts
              ├── trading-pair.entity.ts
```
