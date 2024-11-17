# Crypto Price Tracker

A real-time cryptocurrency price tracking application built with Next.js, showing current prices for TON/USDT and USDT/TON pairs.

## Features

- Real-time price updates every 60 seconds
- Dark/Light theme support
- Price change indicators and percentages
- Automatic price updates
- Responsive design

## Tech Stack

- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- Docker

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Docker (for containerized deployment)

### Local Development

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Docker Deployment

#### Building and Running with Docker

1. Build the Docker image:
```bash
docker build -t crypto-price-frontend .
```

2. Run the container:
```bash
docker run -p 3000:3000 crypto-price-frontend
```

The application will be available at [http://localhost:3000](http://localhost:3000).

#### Docker Commands Reference

```bash
# Build the image
docker build -t crypto-price-tracker .

# Run in detached mode
docker run -d -p 3000:3000 crypto-price-tracker

# View logs
docker logs <container_id>

# Stop container
docker stop <container_id>

# Remove container
docker rm <container_id>
```

### Environment Variables

The following environment variables are configured in the Docker environment:

```
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
PORT=3000
HOSTNAME=0.0.0.0
```

## Development

### Project Structure

```
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

### Testing

Tests are implemented under [crypto-tracker.test.tsx](./__tests__/crypto-tracker.test.tsx) to validate the main 2 UI components:

1. PriceCard Tests:

a. Checks if price information (value, percentage changes) displays correctly
b. Verifies the "coming soon" state works for inactive pairs
c. Confirms loading state appears when data is not yet available

2. PriceGrid Tests:

a. Ensures it renders multiple price cards correctly
b. Verifies loading spinner appears during data fetch
Confirms error messages display when data fetching fails

#### Run the test suite:

```bash
npm run test
```
