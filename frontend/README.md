# Crypto Price Tracker

A real-time cryptocurrency price tracking application built with Next.js, showing current prices for TON/USDT and USDT/TON pairs.

## Features

- 🚀 Real-time price updates every 30 seconds
- 🌓 Dark/Light theme support
- 📊 Price change indicators and percentages
- 🎨 Beautiful UI with Tailwind CSS and shadcn/ui
- 🔄 Automatic price updates
- 📱 Fully responsive design

## Tech Stack

- Next.js 13+ with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui Components
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
docker build -t crypto-price-tracker .
```

2. Run the container:
```bash
docker run -p 3000:3000 crypto-price-tracker
```

The application will be available at [http://localhost:3000](http://localhost:3000).

#### Docker Configuration Details

The Dockerfile includes several optimizations and security features:

- Multi-stage build process for minimal image size
- Non-root user execution
- Health checks
- Automatic restart capability
- Memory optimization
- Security best practices

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

Run the test suite:

```bash
npm test
```

## Production Deployment

For production deployment, consider:

1. Setting up proper SSL/TLS
2. Configuring environment variables
3. Setting up monitoring and logging
4. Implementing rate limiting
5. Adding error tracking

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
