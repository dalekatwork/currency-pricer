# Crypto Price Tracker & API

A full-stack cryptocurrency tracking application with real-time price updates, featuring a Next.js frontend and NestJS backend.

## 🚀 Quick Start with Docker

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

## 🖥️ Frontend (Crypto Price Tracker)

### Features

- Real-time price updates every 30 seconds
- Dark/Light theme support
- Price change indicators and percentages
- Automatic price updates
- Responsive design

### Local Development

```bash
cd frontend
npm install
npm run dev
```

### Project Structure

```
frontend/
├── app/                  # Next.js app directory
│   ├── api/             # API routes
│   ├── components/      # App-specific components
│   └── page.tsx         # Main page
├── components/          # Shared components
│   ├── crypto/         # Cryptocurrency-specific components
│   └── ui/             # UI components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── public/             # Static files
└── types/              # TypeScript type definitions
```

## 🔧 Backend (Cryptocurrency Price API)

### Features

- 🔄 Real-time cryptocurrency price updates
- 💾 Efficient caching mechanism
- 📊 Multiple trading pairs support
- 📝 Comprehensive API documentation
- 🔒 Rate limiting and security features

### Local Development

```bash
cd backend
npm install
npm run dev
```

### API Endpoints

- `GET /crypto/prices` - Returns current cryptocurrency prices
- `GET /crypto/pairs` - Lists all active trading pairs
- `POST /crypto/pairs` - Add new trading pair
- `PUT /crypto/pairs/:id/deactivate` - Deactivate a trading pair

### Caching Strategy

The backend implements a sophisticated caching mechanism:

1. **In-Memory Cache Layer**
   - 30-minute TTL (Time To Live)
   - Limited to 100 items
   - Global accessibility

2. **Automatic Updates**
   - CRON job runs every 30 minutes
   - Proactive cache updates
   - Ensures data freshness

## 🛠️ Development

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

### Environment Variables

#### Frontend
```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0
```

#### Backend
```
PORT=8000
NODE_ENV=production
CACHE_TTL=1800
MAX_CACHE_ITEMS=100
```
